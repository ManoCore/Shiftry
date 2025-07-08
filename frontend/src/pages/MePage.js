import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchSchedulesInRange } from '../api';
import { parse, format, isValid, isBefore, isAfter, isWithinInterval } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import '@fontsource/poppins'; // Ensure Poppins font is loaded

const MePage = () => {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();
    const [schedules, setSchedules] = useState([]); // For user's assigned schedules
    const [openSchedules, setOpenSchedules] = useState([]); // For general open schedules overview
    const [error, setError] = useState(null);

    const today = format(toZonedTime(new Date(), 'Asia/Kolkata'), 'yyyy-MM-dd'); // Ensure consistency with IST

    const getScheduleStatus = (schedule) => {
        if (!schedule.start || !schedule.end || !schedule.date) {
            console.warn(`Missing date or times for schedule ${schedule.id}:`, schedule);
            return 'Unknown';
        }
        try {
            const timeZone = 'Asia/Kolkata';
            const currentTime = toZonedTime(new Date(), timeZone);
            const startDateTime = parse(`${schedule.date} ${schedule.start}`, 'yyyy-MM-dd HH:mm', new Date());
            const endDateTime = parse(`${schedule.date} ${schedule.end}`, 'yyyy-MM-dd HH:mm', new Date());

            if (!isValid(startDateTime) || !isValid(endDateTime)) {
                console.warn(`Invalid date/time for schedule ${schedule.id}:`, schedule);
                return 'Unknown';
            }

            // Check if the schedule is for a future date, then it's definitely 'Upcoming'
            const scheduleDate = parse(schedule.date, 'yyyy-MM-dd', new Date());
            const todayDateOnly = parse(today, 'yyyy-MM-dd', new Date());

            if (isBefore(scheduleDate, todayDateOnly)) { // If schedule date is before today (only date part)
                // If it's today's date but the time has passed
                if (format(scheduleDate, 'yyyy-MM-dd') === format(todayDateOnly, 'yyyy-MM-dd') && isAfter(currentTime, endDateTime)) {
                    return 'Completed';
                }
                // If it's a past date
                if (isBefore(scheduleDate, todayDateOnly)) {
                    return 'Completed';
                }
            }


            if (isBefore(currentTime, startDateTime)) return 'Upcoming';
            if (isAfter(currentTime, endDateTime)) return 'Completed';
            if (isWithinInterval(currentTime, { start: startDateTime, end: endDateTime })) return 'In Progress';
            return 'Unknown';
        } catch (e) {
            console.error(`Error deriving status for schedule ${schedule.id}:`, e);
            return 'Unknown';
        }
    };

    useEffect(() => {
        const fetchAndFilterSchedules = async () => {
            if (!user || !user.id) {
                console.log('No user or user.id found', { user });
                setError('Please log in to view schedules');
                return;
            }
            setError(null); // Clear previous errors

            try {
                console.log('Fetching schedules for user ID:', user.id, 'Role:', user.role);

                // Fetch for a broad range to accurately get open schedules
                const startFetchDate = getTodayDate(); // Start from today
                const endFetchDate = getFutureDate(12); // Fetch for next 12 months for open schedules

                const response = await fetchSchedulesInRange(startFetchDate, endFetchDate);
                console.log('Raw API response for all schedules:', response.data);

                // --- Logic for Open Schedules Block ---
                // Filter for schedules that are NOT assigned to any careWorker AND are not published (i.e., truly open)
                const allFetchedSchedules = response.data || []; // Ensure it's an array
                const currentOpenSchedules = allFetchedSchedules
                    .filter(schedule => {
                        const scheduleDateObj = new Date(schedule.date);
                        const todayDateObj = new Date(today); // Compare date parts only
                        return (
                            (schedule.date && scheduleDateObj >= todayDateObj) && // Only future or today's open schedules
                            (!schedule.careWorker ||
                                (Array.isArray(schedule.careWorker) && schedule.careWorker.length === 0)) &&
                            schedule.isPublished === false // Explicitly check isPublished for open shifts
                        );
                    })
                    .map(schedule => ({
                        id: schedule._id,
                        title: schedule.description || 'Open Shift',
                        start: schedule.start || '',
                        end: schedule.end || '',
                        location: schedule.location?.name || schedule.location || 'Unknown',
                        date: schedule.date,
                        breakDuration: schedule.break ? `${schedule.break} mins` : '',
                        status: getScheduleStatus({
                            id: schedule._id,
                            start: schedule.start,
                            end: schedule.end,
                            date: schedule.date
                        })
                    }));
                console.log('Filtered Open schedules for overview:', currentOpenSchedules);
                setOpenSchedules(currentOpenSchedules);


                // --- Logic for User's Assigned Schedules (What's Happening & Today's Schedule) ---
                // These are schedules specifically for the CURRENT day that are assigned to the user
                const userAssignedSchedulesToday = allFetchedSchedules
                    .filter(schedule => {
                        if (!schedule.date || schedule.date !== today) {
                            return false; // Not today's schedule
                        }

                        if (user.role === 'admin') {
                            // Admins see all schedules for today
                            return true;
                        } else {
                            // Non-admins (employees, careWorkers) see only their own schedules for today
                            if (!schedule.careWorker) {
                                return false; // Not assigned
                            }
                            if (Array.isArray(schedule.careWorker)) {
                                return schedule.careWorker.some(cw =>
                                    (typeof cw === 'object' && cw?._id === user.id) ||
                                    (typeof cw === 'string' && cw === user.id)
                                );
                            }
                            return (typeof schedule.careWorker === 'object' && schedule.careWorker?._id === user.id) ||
                                (typeof schedule.careWorker === 'string' && schedule.careWorker === user.id);
                        }
                    })
                    .map(schedule => {
                        const careWorkerNames = Array.isArray(schedule.careWorker)
                            ? schedule.careWorker
                                .map(cw => {
                                    if (typeof cw === 'object' && (cw?.firstName || cw?.lastName)) {
                                        return `${cw.firstName || ''} ${cw.lastName || ''}`.trim();
                                    }
                                    return 'Unknown';
                                })
                                .filter(Boolean)
                            : [schedule.careWorker?.firstName
                                ? `${schedule.careWorker.firstName} ${schedule.careWorker.lastName || ''}`.trim()
                                : 'Unknown'];

                        return {
                            id: schedule._id,
                            title: schedule.description || 'Shift',
                            start: schedule.start || '',
                            end: schedule.end || '',
                            location: schedule.location?.name || schedule.location || 'Unknown',
                            date: schedule.date,
                            breakDuration: schedule.break ? `${schedule.break} mins` : '',
                            careWorkerNames: careWorkerNames.length > 0 && careWorkerNames.some(name => name !== 'Unknown')
                                ? careWorkerNames
                                : ['Unknown'],
                            status: getScheduleStatus({
                                id: schedule._id,
                                start: schedule.start,
                                end: schedule.end,
                                date: schedule.date
                            })
                        };
                    });
                console.log('User assigned schedules for today:', userAssignedSchedulesToday);
                setSchedules(userAssignedSchedulesToday); // Set for the Today's Schedule section

            } catch (err) {
                console.error('Error fetching schedules:', err);
                const message = err.response?.status === 401
                    ? 'Not authorized. Please log in.'
                    : err.response?.data?.msg || 'Failed to load schedules';
                setError(message);
            }
        };

        // Helper to get today's date in YYYY-MM-DD format (local timezone)
        const getTodayDate = () => {
            const todayDate = toZonedTime(new Date(), 'Asia/Kolkata');
            return format(todayDate, 'yyyy-MM-dd');
        };

        // Helper to get a future date (e.g., 1 year from now) in YYYY-MM-DD format
        const getFutureDate = (months) => {
            const futureDate = toZonedTime(new Date(), 'Asia/Kolkata');
            futureDate.setMonth(futureDate.getMonth() + months);
            return format(futureDate, 'yyyy-MM-dd');
        };


        if (!isLoading && user) { // Fetch only when user data is loaded
            fetchAndFilterSchedules();
        }
    }, [user, isLoading, today]); // Dependencies for useEffect

    const formatTime = (time) => {
        if (!time) return '';
        const parsedTime = parse(time, 'HH:mm', new Date());
        if (!isValid(parsedTime)) return time;
        return format(parsedTime, 'h:mm a');
    };

    const completedSchedules = schedules.filter(schedule => schedule.status === 'Completed');
    const upcomingSchedules = schedules.filter(schedule => schedule.status === 'Upcoming' || schedule.status === 'In Progress');

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 font-poppins">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="ml-3 text-lg text-gray-700">Loading user data...</p>
            </div>
        );
    }

    if (!user) {
        navigate('/login');
        return null; // Ensure nothing renders before redirection
    }

    return (
        <div className="min-h-screen bg-gray-100 font-poppins flex flex-col md:flex-row"> {/* Changed to flex-col on mobile */}
            {/* Sidebar / User Info Block - Always visible, full width on mobile */}
            <aside
                className="w-full md:w-64 bg-white p-6 shadow-md border-b md:border-r border-gray-200 flex flex-col items-center py-8 flex-shrink-0" // Adjusted width and border
            >
                <div className="flex flex-col items-center flex-grow">
                    <div className="w-16 h-16 md:w-12 md:h-12 rounded-full overflow-hidden mb-4"> {/* Larger avatar on mobile */}
                        <img
                            src={user?.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                            alt={`${user?.firstName || 'User'}'s Profile`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
                            }}
                        />
                    </div>
                    <h2 className="text-xl md:text-lg font-semibold text-gray-800 mb-1 text-center"> {/* Larger font on mobile */}
                        {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-base md:text-sm text-gray-600 mb-8 capitalize"> {/* Larger font on mobile */}
                        <span className="font-semibold">Role:</span> {user?.role}
                    </p>
                    {/* Start Shift button - typically for care workers */}
                    {user.role === 'careWorker' && ( // Only show if role is 'careWorker'
                        <button
                            className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 shadow-sm"
                            onClick={() => navigate('/schedule')}
                        >
                            Start Shift
                        </button>
                    )}
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto"> {/* Adjusted padding for mobile */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    {/* No hamburger icon here anymore */}
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm text-center">{error}</div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"> {/* Adjusted grid for responsiveness */}
                    {/* Open Schedules Block */}
                    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-center border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Open Schedules</h3>
                        {openSchedules.length > 0 ? (
                            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar"> {/* Added scrollbar to this block */}
                                {openSchedules.map(schedule => (
                                    <div key={schedule.id} className="flex items-center text-gray-700 mb-2 p-2 rounded-md bg-gray-50 border border-gray-200">
                                        <span className="mr-2 text-xl">📋</span>
                                        <div className="flex-1">
                                            <p className="font-medium">{schedule.title} ({formatTime(schedule.start)} - {formatTime(schedule.end)})</p>
                                            <p className="text-sm text-gray-600">Location: {schedule.location}</p>
                                        </div>
                                        {(user.role === 'admin' || user.role === 'manager') && (
                                            <button
                                                className="ml-auto text-blue-600 hover:text-blue-700 text-sm font-semibold"
                                                onClick={() => navigate(`/openschedules`)}
                                            >
                                                Assign
                                            </button>
                                        )}
                                        {user.role === 'careWorker' && (
                                            <button
                                                className="ml-auto text-blue-600 hover:text-blue-700 text-sm font-semibold"
                                                onClick={() => navigate(`/open-schedules`)}
                                            >
                                                View Details
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center text-gray-700">
                                <span className="mr-2 text-xl"></span>
                                <span className="font-medium">No open schedules available at this time.</span>
                            </div>
                        )}
                        <button
                            className="mt-4 text-blue-600 hover:underline self-end"
                            onClick={() => navigate('/openschedules')}
                        >
                            View All Open Schedules
                        </button>
                    </div>

                    {/* What's Happening Block */}
                    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-center border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">What's Happening Today</h3>
                        <div className="text-gray-700 max-h-48 overflow-y-auto custom-scrollbar">
                            {(completedSchedules.length > 0 || upcomingSchedules.length > 0) ? (
                                <div className="space-y-4">
                                    {completedSchedules.length > 0 && (
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800 mb-1">Completed</p>
                                            {completedSchedules.map(schedule => (
                                                <div key={schedule.id} className="text-xs text-gray-600 mb-2 bg-gray-100 p-2 rounded-md">
                                                    <p className="truncate">{schedule.title} ({formatTime(schedule.start)} - {formatTime(schedule.end)})</p>
                                                    <p className="truncate">Location: {schedule.location}</p>
                                                    <p className="truncate">Workers: {schedule.careWorkerNames.join(', ')}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {upcomingSchedules.length > 0 && (
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800 mb-1">Upcoming & In Progress</p>
                                            {upcomingSchedules.map(schedule => (
                                                <div key={schedule.id} className="text-xs text-gray-600 mb-2 bg-gray-50 p-2 rounded-md">
                                                    <p className="truncate">{schedule.title} ({formatTime(schedule.start)} - {formatTime(schedule.end)})</p>
                                                    <p className="truncate">Location: {schedule.location}</p>
                                                    <p className="truncate">Workers: {schedule.careWorkerNames.join(', ')}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-600">No completed or upcoming schedules for today.</p>
                            )}
                        </div>
                    </div>
                    {/* Placeholder for third card if needed */}
                    {/* <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-center border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Another Section</h3>
                        <p className="text-gray-700">Content for another card.</p>
                    </div> */}
                </div>

                {/* Today's Schedule (Detailed List) */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Today's Detailed Schedule ({today})</h2>
                    {schedules.length > 0 ? (
                        <div className="flex flex-wrap gap-5 justify-center sm:justify-start"> {/* Centered on mobile, start on larger screens */}
                            {schedules.map(schedule => (
                                <div
                                    key={schedule.id}
                                    className="bg-gray-50 p-4 rounded-md border border-gray-200 shadow-sm flex flex-col justify-between items-center space-y-4 w-full sm:w-auto min-w-[200px] max-w-[250px]" // `w-full` on mobile
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 text-center">{schedule.title}</p>
                                        <p className="text-xs text-gray-600 text-center">
                                            {formatTime(schedule.start)} - {formatTime(schedule.end)}
                                        </p>
                                        <p className="text-xs text-gray-600 text-center">Location: {schedule.location}</p>
                                        <p className="text-xs text-gray-600 text-center">Workers: {schedule.careWorkerNames.join(', ')}</p>
                                        {schedule.breakDuration && (
                                            <p className="text-xs text-gray-600 text-center">Break: {schedule.breakDuration}</p>
                                        )}
                                        <p className="text-xs text-gray-600 text-center">Status: {schedule.status}</p>
                                    </div>
                                    <button
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 text-sm"
                                        onClick={() => navigate('/schedule')}
                                    >
                                        View Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-600 text-center">No assigned schedules for today.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MePage;