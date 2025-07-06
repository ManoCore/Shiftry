import React, { useState, useEffect } from 'react';
import {
    fetchLocations,
    createOrUpdateSchedule,
    updateSchedule,
    fetchSchedulesInRange,
    fetchAllUsers
} from "../api";
import { useAuth } from '../context/AuthContext';

const OpenSchedules = () => {
    // Modals and UI State
    const [showRulesModal, setShowRulesModal] = useState(false);
    const [agreedToRules, setAgreedToRules] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState('All Locations');
    const [showAddShiftModal, setShowAddShiftModal] = useState(false);
    // State for mobile sidebar visibility
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);


    // Data States
    const { user, isLoading: authLoading } = useAuth();
    const [locations, setLocations] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [careTakerCards, setCareTakerCards] = useState([]);

    // Loading & Error States
    const [loadingLocations, setLoadingLocations] = useState(true);
    const [locationError, setLocationError] = useState(null);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [usersError, setUsersError] = useState(null);
    const [loadingShifts, setLoadingShifts] = useState(true);
    const [shiftsError, setShiftsError] = useState(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmError, setConfirmError] = useState('');

    // States for "Add New Shift" form
    const [newShiftName, setNewShiftName] = useState('');
    const [newShiftLocation, setNewShiftLocation] = useState('');
    const [newShiftDate, setNewShiftDate] = useState('');
    const [newShiftStartTime, setNewShiftStartTime] = useState('');
    const [newShiftEndTime, setNewShiftEndTime] = useState('');
    const [selectedShiftDetails, setSelectedShiftDetails] = useState(null);

    // Helper to get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // Helper to get a future date (e.g., 1 year from now) in YYYY-MM-DD format
    const getFutureDate = (months) => {
        const future = new Date();
        future.setMonth(future.getMonth() + months);
        return future.toISOString().split('T')[0];
    };

    // Function to process backend schedule data into frontend careTakerCard format
    const processShiftData = (schedules) => {
        return schedules.map(schedule => ({
            id: schedule._id,
            name: schedule.description || 'Care Taker Shift',
            location: schedule.location?.name || schedule.location,
            date: schedule.date,
            timings: `${schedule.start} - ${schedule.end}`,
            status: (schedule.careWorker && schedule.isPublished) ? 'assigned' : 'join',
            originalStartTime: schedule.start,
            originalEndTime: schedule.end,
            originalLocationId: schedule.location?._id || schedule.location,
            originalCareWorkerId: schedule.careWorker,
            createdBy: schedule.createdBy
        }));
    };

    // Effect to fetch locations (e.g., Austin, Dallas) on component mount
    useEffect(() => {
        const getLocations = async () => {
            try {
                setLoadingLocations(true);
                const response = await fetchLocations();
                setLocations(response.data);
                setLoadingLocations(false);
            } catch (err) {
                console.error("Failed to fetch locations:", err);
                setLocationError("Failed to load locations. Please try again.");
                setLoadingLocations(false);
            }
        };
        getLocations();
    }, []);

    // Effect to fetch all users for the sidebar on component mount
    useEffect(() => {
        const getUsers = async () => {
            try {
                setLoadingUsers(true);
                const response = await fetchAllUsers();
                const usersData = response.data;

                console.log("Fetched users data for state (after .data extraction):", usersData);

                if (!Array.isArray(usersData)) {
                    console.error("Fetched user data is not an array:", usersData);
                    setUsersError("Received invalid user data from the server.");
                    setAllUsers([]);
                    return;
                }

                setAllUsers(usersData);
                setLoadingUsers(false);
            } catch (err) {
                console.error("Failed to fetch all users:", err.response?.data || err.message);
                setUsersError("Failed to load user list. " + (err.message || ''));
                setLoadingUsers(false);
                setAllUsers([]);
            }
        };
        getUsers();
    }, []);

    // Effect to fetch schedules and filter for "open" shifts
    useEffect(() => {
        const getSchedulesAndFilterOpen = async () => {
            if (authLoading || !user) {
                return;
            }

            try {
                setLoadingShifts(true);
                setShiftsError(null);

                const startDate = getTodayDate();
                const endDate = getFutureDate(12);
                const response = await fetchSchedulesInRange(startDate, endDate);

                const allFetchedSchedules = response.data;
                const openShifts = allFetchedSchedules.filter(schedule =>
                    !schedule.careWorker && schedule.isPublished === false
                );
                setCareTakerCards(processShiftData(openShifts));
                setLoadingShifts(false);
            } catch (err) {
                console.error("Failed to fetch open shifts:", err.response?.data || err.message);
                setShiftsError("Failed to load open shifts. Please try again.");
                setLoadingShifts(false);
            }
        };

        getSchedulesAndFilterOpen();
    }, [authLoading, user]);

    // Filtered cards based on selected location
    const filteredCards = selectedLocation === 'All Locations'
        ? careTakerCards
        : careTakerCards.filter(card => card.location === selectedLocation);

    // Handler for "Join Work" button click - opens the rules modal
    const handleJoinWorkClick = (card) => {
        setSelectedShiftDetails(card);
        setShowRulesModal(true);
        setAgreedToRules(false);
        setConfirmMessage('');
        setConfirmError('');
    };

    // Handler for closing the rules modal
    const handleCloseRulesModal = () => {
        setShowRulesModal(false);
        setAgreedToRules(false);
        setSelectedShiftDetails(null);
        setConfirmMessage('');
        setConfirmError('');
    };

    // Handler for confirming rules and assigning shift
    const handleConfirmRules = async () => {
        if (!agreedToRules) {
            setConfirmError('You must agree to the rules and regulations to confirm.');
            return;
        }
        if (!selectedShiftDetails || !user || !user.id) {
            setConfirmError('Error: Shift details or user information missing. Please log in.');
            return;
        }

        setIsConfirming(true);
        setConfirmMessage('');
        setConfirmError('');

        try {
            const locationObj = locations.find(loc => loc.name === selectedShiftDetails.location);
            if (!locationObj || !locationObj._id) {
                throw new Error('Selected location ID not found. Cannot update schedule.');
            }
            const locationId = locationObj._id;

            const scheduleUpdatePayload = {
                start: selectedShiftDetails.originalStartTime,
                end: selectedShiftDetails.originalEndTime,
                description: selectedShiftDetails.name,
                careWorker: user.id,
                location: locationId,
                date: selectedShiftDetails.date,
                break: 0,
                isPublished: true,
                createdBy: selectedShiftDetails.createdBy,
            };

            const response = await updateSchedule(selectedShiftDetails.id, scheduleUpdatePayload);
            console.log("Schedule confirmed and updated in database:", response.data);
            setConfirmMessage('Shift successfully confirmed and scheduled!');

            const updatedShiftsResponse = await fetchSchedulesInRange(getTodayDate(), getFutureDate(12));
            const allFetchedSchedules = updatedShiftsResponse.data;
            const openShifts = allFetchedSchedules.filter(schedule =>
                !schedule.careWorker && schedule.isPublished === false
            );
            setCareTakerCards(processShiftData(openShifts));

            setTimeout(() => {
                handleCloseRulesModal();
            }, 2000);

        } catch (error) {
            const errMsg = error.response?.data?.message || error.message || 'Failed to confirm shift. Please try again.';
            console.error("Error confirming shift:", error);
            setConfirmError(errMsg);
        } finally {
            setIsConfirming(false);
        }
    };

    // Handler for "Add Open Shifts" button click - opens the add shift modal
    const handleAddShiftClick = () => {
        setShowAddShiftModal(true);
        setNewShiftName('');
        setNewShiftLocation('');
        setNewShiftDate('');
        setNewShiftStartTime('');
        setNewShiftEndTime('');
    };

    // Handler for closing the add shift modal
    const handleCloseAddShiftModal = () => {
        setShowAddShiftModal(false);
    };

    // Handler for submitting new open shift
    const handleSubmitNewShift = async (e) => {
        e.preventDefault();

        const locationObj = locations.find(loc => loc.name === newShiftLocation);
        if (!locationObj || !locationObj._id) {
            setConfirmError('Please select a valid location for the new shift.');
            return;
        }
        const locationIdForNewShift = locationObj._id;

        const newShiftPayload = {
            start: newShiftStartTime,
            end: newShiftEndTime,
            description: newShiftName || 'New Care Taker Shift',
            careWorker: null,
            location: locationIdForNewShift,
            date: newShiftDate,
            break: 0,
            isPublished: false,
            createdBy: user.id,
        };

        try {
            const response = await createOrUpdateSchedule(newShiftPayload);
            console.log("New open shift added successfully to schedules:", response.data);

            setCareTakerCards(prevCards => [...prevCards, processShiftData([response.data])[0]]);

            handleCloseAddShiftModal();
            setConfirmMessage('New open shift added successfully!');
        } catch (error) {
            console.error("Error adding new open shift:", error.response?.data || error.message);
            setConfirmError('Failed to add new shift. Please try again.');
        }
    };

    // Display loading indicator while authentication data is being fetched
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="ml-3 text-lg text-gray-700">Loading user data...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-lg text-gray-700">Please log in to view open schedules.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 font-inter">
            {/* Hamburger menu for mobile */}
            <div className="md:hidden p-4 bg-white shadow-md flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Schedules</h2>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="text-gray-600 focus:outline-none"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {isSidebarOpen ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            ></path>
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16m-7 6h7"
                            ></path>
                        )}
                    </svg>
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 bg-white p-4 shadow-lg z-40 w-64 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:w-64 transition-transform duration-300 ease-in-out`}>
                <div className="mb-6">
                    {/* Close button for mobile sidebar */}
                    <div className="md:hidden flex justify-end mb-4">
                        <button onClick={() => setIsSidebarOpen(false)} className="text-gray-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    {/* Location Dropdown */}
                    <div className="mb-4">
                        <label htmlFor="location-select" className="block text-sm font-medium text-gray-700 mb-1">
                            Select Location
                        </label>
                        <select
                            id="location-select"
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="All Locations">All Locations</option>
                            {loadingLocations ? (
                                <option disabled>Loading locations...</option>
                            ) : locationError ? (
                                <option disabled>{locationError}</option>
                            ) : (
                                locations.map(location => (
                                    <option key={location._id} value={location.name}>
                                        {location.name}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Search Bar (non-functional in this snippet, placeholder) */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <svg
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                </div>
                {/* Actual Users List in Sidebar */}
                <div className="mt-6 border-t border-[#B1B1B1] pt-6">
                    <h3 className="text-lg font-semibold mb-3">USERS</h3>
                    <div className="space-y-2">
                        {loadingUsers ? (
                            <p className="text-gray-600">Loading users...</p>
                        ) : usersError ? (
                            <p className="text-red-500">{usersError}</p>
                        ) : allUsers.length === 0 ? (
                            <p className="text-gray-600">No users found.</p>
                        ) : (
                            allUsers.map((person) => (
                                <div
                                    key={person._id}
                                    className="flex items-center p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                                >
                                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                                        <svg
                                            className="text-gray-600"
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                    </div>
                                    <span className="text-gray-800 font-medium">
                                        {person.name}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900 bg-opacity-50 z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col p-4 md:p-6">
                <div className='flex justify-between items-center mb-6 w-full'>
                    <h1 className="text-2xl font-bold text-gray-800 hidden md:block">Open Schedules</h1> {/* Title for desktop */}
                    {/* Conditional rendering for the "+Add Open Shifts" button */}
                    {(user && (user.role === 'admin' || user.role === 'employee')) && (
                        <button
                            className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-700 transition-colors duration-200 w-full md:w-auto'
                            onClick={handleAddShiftClick}
                        >
                            + Add Open Shifts
                        </button>
                    )}
                </div>

                {/* Conditional rendering for loading, error, or empty shifts */}
                {loadingShifts ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <p className="ml-3 text-lg text-gray-700">Loading shifts...</p>
                    </div>
                ) : shiftsError ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{shiftsError}</span>
                    </div>
                ) : filteredCards.length === 0 ? (
                    <div className="text-center text-gray-500 text-lg mt-10">
                        No open shifts available for the selected location.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCards.map((card) => (
                            <div key={card.id} className="bg-white p-6 rounded-lg shadow-md w-full"> {/* Made cards w-full on small screens */}
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                        <svg
                                            className="text-gray-600"
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{card.name}</h3>
                                        <p className="text-gray-600 text-sm">location - {card.location}</p>
                                        <p className="text-gray-600 text-sm">Date {card.date}</p>
                                        {card.timings && <p className="text-gray-600 text-sm">Timings: {card.timings}</p>}
                                    </div>
                                </div>
                                {/* Conditionally render Join Work or Assigned button based on card.status */}
                                {card.status === 'join' ? (
                                    <button
                                        onClick={() => handleJoinWorkClick(card)}
                                        className="w-full flex items-center justify-center bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-700 transition-colors duration-200"
                                    >
                                        <svg
                                            className="mr-2"
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="9" cy="7" r="4"></circle>
                                            <line x1="18" y1="8" x2="23" y2="13"></line>
                                            <line x1="23" y1="8" x2="18" y2="13"></line>
                                        </svg>
                                        Join Work
                                    </button>
                                ) : (
                                    <button className="w-full flex items-center justify-center bg-green-500 text-white py-2 px-4 rounded-lg cursor-not-allowed">
                                        <svg
                                            className="mr-2"
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                        Assigned
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Work Rules & Regulations Modal */}
            {showRulesModal && selectedShiftDetails && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm sm:max-w-md w-full"> {/* Adjusted max-width */}
                        <div className="text-center mb-6">
                            <h2 className="font-bold text-xl text-gray-900">Work Details</h2>
                            <p className="text-gray-600 text-sm">Location: {selectedShiftDetails.location}</p>
                            <p className="text-gray-600 text-sm">Date: {selectedShiftDetails.date}</p>
                            <hr className="my-4 border-gray-300" />
                        </div>

                        {/* Confirmation Messages */}
                        {confirmMessage && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                                <span className="block sm:inline">{confirmMessage}</span>
                            </div>
                        )}
                        {confirmError && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                                <span className="block sm:inline">{confirmError}</span>
                            </div>
                        )}

                        <h3 className="font-bold text-lg mb-3 text-gray-900">Work Rules & Regulations</h3>
                        <ul className="list-decimal list-inside space-y-2 text-gray-700 mb-6 text-sm"> {/* Added text-sm for smaller font */}
                            <li>Be punctual and attend your assigned shift without fail.</li>
                            <li>Maintain respectful, professional behavior at all times.</li>
                            <li>Follow all safety and supervisor instructions carefully.</li>
                            <li>Handle workspace and equipment responsibly.</li>
                            <li>Inform your supervisor immediately in case of emergencies.</li>
                        </ul>

                        <div className="flex items-center mb-6">
                            <input
                                type="checkbox"
                                id="agreeRules"
                                checked={agreedToRules}
                                onChange={(e) => setAgreedToRules(e.target.checked)}
                                className="form-checkbox h-5 w-5 text-blue-600 rounded"
                            />
                            <label htmlFor="agreeRules" className="ml-2 text-gray-700 text-sm">
                                I have read and agree to follow the above rules and regulations.
                            </label>
                        </div>

                        <div className="flex flex-col sm:flex-row-reverse justify-end space-y-2 sm:space-y-0 sm:space-x-4"> {/* Stack buttons on mobile */}
                            <button
                                onClick={handleConfirmRules}
                                disabled={!agreedToRules || isConfirming}
                                className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                                    agreedToRules && !isConfirming
                                        ? 'bg-green-500 text-white hover:bg-green-600'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                {isConfirming ? 'Confirming...' : 'Confirm'}
                            </button>
                            <button
                                onClick={handleCloseRulesModal}
                                className="px-6 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-colors duration-200"
                                disabled={isConfirming}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add New Open Shift Modal */}
            {showAddShiftModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm sm:max-w-md w-full"> {/* Adjusted max-width */}
                        <h2 className="font-bold text-xl text-gray-900 text-center mb-6">Add New Open Shift</h2>
                        <form onSubmit={handleSubmitNewShift}>
                            <div className="mb-4">
                                <label htmlFor="workName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Work Name
                                </label>
                                <input
                                    type="text"
                                    id="workName"
                                    value={newShiftName}
                                    onChange={(e) => setNewShiftName(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                    Location
                                </label>
                                <select
                                    id="location"
                                    value={newShiftLocation}
                                    onChange={(e) => setNewShiftLocation(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select a location</option>
                                    {loadingLocations ? (
                                        <option disabled>Loading locations...</option>
                                    ) : locationError ? (
                                        <option disabled>{locationError}</option>
                                    ) : (
                                        locations.map(location => (
                                            <option key={location._id} value={location.name}>
                                                {location.name}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    id="date"
                                    value={newShiftDate}
                                    onChange={(e) => setNewShiftDate(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"> {/* Stack time inputs on mobile */}
                                <div className="flex-1">
                                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Time
                                    </label>
                                    <input
                                        type="time"
                                        id="startTime"
                                        value={newShiftStartTime}
                                        onChange={(e) => setNewShiftStartTime(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                                        End Time
                                    </label>
                                    <input
                                        type="time"
                                        id="endTime"
                                        value={newShiftEndTime}
                                        onChange={(e) => setNewShiftEndTime(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row-reverse justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-6"> {/* Stack buttons on mobile */}
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-700 transition-colors duration-200"
                                >
                                    Add Shift
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseAddShiftModal}
                                    className="px-6 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OpenSchedules;