// import React, { useState, useEffect } from 'react';
// import { parse, format, isValid, isBefore, isAfter, isWithinInterval } from 'date-fns';
// import { toZonedTime } from 'date-fns-tz';
// import { fetchSchedulesInRange } from '../api';

// const ReportPage = () => {
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [backendSchedules, setBackendSchedules] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [locations, setLocations] = useState([]);
//   const [selectedLocation, setSelectedLocation] = useState(null);
//   const [sidebarLocationSearchQuery, setSidebarLocationSearchQuery] = useState('');

//   const mapBackendScheduleToFrontend = (backendSchedule) => {
//     let workerName = 'N/A Worker';
//     let workerProfilePicture = null;
//     const careWorkerObject = Array.isArray(backendSchedule.careWorker) && backendSchedule.careWorker.length > 0
//       ? backendSchedule.careWorker[0]
//       : null;

//     if (careWorkerObject) {
//       if (careWorkerObject.firstName || careWorkerObject.lastName) {
//         const first = careWorkerObject.firstName || '';
//         const last = careWorkerObject.lastName || '';
//         workerName = [first, last].filter(Boolean).join(' ').trim() || 'N/A Worker';
//       } else {
//         workerName = careWorkerObject.name || careWorkerObject.username || careWorkerObject.email || 'N/A Worker';
//       }
//       workerProfilePicture = careWorkerObject.profilePicture || null;
//     }

//     if (workerName === 'N/A Worker') {
//       console.warn("Worker name still 'N/A Worker'. Inspecting backendSchedule.careWorker:", backendSchedule.careWorker);
//     }

//     const workerStatusFromDb = careWorkerObject?.status || 'Unknown Status';
//     const scheduleDateRaw = backendSchedule.date;
//     const scheduleStart = backendSchedule.start;
//     const scheduleEnd = backendSchedule.end;

//     let scheduleDateForParsing = '';
//     let displayDate = 'Invalid Date';

//     if (scheduleDateRaw) {
//       try {
//         // Parse possible date formats (YYYY-MM-DD or full date string)
//         const parsedDate = parse(scheduleDateRaw, 'yyyy-MM-dd', new Date()) || new Date(scheduleDateRaw);
//         if (isValid(parsedDate)) {
//           scheduleDateForParsing = format(parsedDate, 'yyyy-MM-dd');
//           displayDate = format(parsedDate, 'MMM d, yyyy');
//         } else {
//           console.warn("Invalid date format:", scheduleDateRaw);
//         }
//       } catch (e) {
//         console.error("Date parsing error:", scheduleDateRaw, e);
//       }
//     }

//     let derivedStatus = workerStatusFromDb;
//     let scheduleStartDateTime = null;
//     let scheduleEndDateTime = null;

//     if (scheduleDateForParsing && scheduleStart && scheduleEnd) {
//       try {
//         // Assume times are in IST (per your timestamp)
//         const timeZone = 'Asia/Kolkata';
//         scheduleStartDateTime = parse(`${scheduleDateForParsing} ${scheduleStart}`, 'yyyy-MM-dd HH:mm', new Date());
//         scheduleEndDateTime = parse(`${scheduleDateForParsing} ${scheduleEnd}`, 'yyyy-MM-dd HH:mm', new Date());

//         if (isValid(scheduleStartDateTime) && isValid(scheduleEndDateTime)) {
//           // Convert to IST for comparison
//           const currentDateTime = toZonedTime(new Date(), timeZone);

//           if (isBefore(currentDateTime, scheduleStartDateTime)) {
//             derivedStatus = 'Upcoming';
//           } else if (isWithinInterval(currentDateTime, { start: scheduleStartDateTime, end: scheduleEndDateTime })) {
//             derivedStatus = 'In Progress';
//           } else if (isAfter(currentDateTime, scheduleEndDateTime)) {
//             derivedStatus = 'Completed';
//           }
//         } else {
//           console.warn("Invalid start/end time:", backendSchedule.id, scheduleStart, scheduleEnd);
//         }
//       } catch (e) {
//         console.error("Error in status derivation:", e);
//       }
//     } else {
//       console.warn("Missing date or times:", { date: scheduleDateRaw, start: scheduleStart, end: scheduleEnd });
//     }

//     const displayLocation = typeof backendSchedule.location === 'object' && backendSchedule.location !== null
//       ? backendSchedule.location.name || backendSchedule.location.address || 'N/A Location Object'
//       : backendSchedule.location || 'N/A Location';

//     let displayWorkType = '';
//     if (typeof backendSchedule.location === 'object' && backendSchedule.location !== null && backendSchedule.location.workType) {
//       displayWorkType = backendSchedule.location.workType;
//     } else {
//       displayWorkType = backendSchedule.title || backendSchedule.description || 'N/A Work Type';
//     }

//     if (!displayWorkType || displayWorkType.trim() === '') {
//       console.warn("Work Type not found:", backendSchedule);
//       displayWorkType = 'N/A Work Type';
//     }

//     return {
//       id: backendSchedule.id,
//       worker: workerName,
//       profilePicture: workerProfilePicture,
//       location: displayLocation,
//       workType: displayWorkType,
//       dates: [displayDate],
//       hoursOfWork: [`${scheduleStart || 'N/A'} - ${scheduleEnd || 'N/A'}`],
//       status: derivedStatus,
//       endDateTime: scheduleEnd,
//       parsedDateForTimeCalc: scheduleDateForParsing,
//     };
//   };

//   useEffect(() => {
//     const fetchAndProcessData = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const today = new Date();
//         const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
//         const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

//         const startDateString = format(startOfMonth, 'yyyy-MM-dd');
//         const endDateString = format(endOfMonth, 'yyyy-MM-dd');

//         const response = await fetchSchedulesInRange(startDateString, endDateString);
//         const schedulesArray = response.data && Array.isArray(response.data) ? response.data : [];

//         setBackendSchedules(schedulesArray);

//         const uniqueLocations = [...new Set(
//           schedulesArray
//             .map(s => typeof s.location === 'object' && s.location !== null
//               ? s.location.name || s.location.address
//               : s.location
//             )
//             .filter(Boolean)
//         )];
//         setLocations(uniqueLocations);
//       } catch (err) {
//         console.error('Error fetching schedules:', err);
//         setError('Failed to load schedules. Please check your network or try again.');
//         setBackendSchedules([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAndProcessData();
//   }, []);

//   const handleSearchChange = (e) => {
//     setSearchQuery(e.target.value);
//     setSelectedLocation(null);
//   };

//   const handleLocationClick = (location) => {
//     setSelectedLocation(location);
//     setSearchQuery('');
//   };

//   const filteredSchedules = Array.isArray(backendSchedules)
//     ? backendSchedules
//         .map(mapBackendScheduleToFrontend)
//         .filter((schedule) => {
//           const lowerCaseSearchQuery = searchQuery.toLowerCase();
//           const matchesSearch =
//             schedule.worker.toLowerCase().includes(lowerCaseSearchQuery) ||
//             schedule.location.toLowerCase().includes(lowerCaseSearchQuery) ||
//             schedule.workType.toLowerCase().includes(lowerCaseSearchQuery);

//           const matchesLocation = selectedLocation
//             ? schedule.location === selectedLocation
//             : true;

//           return matchesSearch && matchesLocation;
//         })
//     : [];

//   const getStatusColorClass = (status) => {
//     switch (status.toLowerCase()) {
//       case 'in progress':
//         return 'bg-blue-600 hover:bg-blue-700';
//       case 'upcoming':
//         return 'bg-yellow-600 hover:bg-yellow-700';
//       case 'completed':
//         return 'bg-green-600 hover:bg-green-700';
//       case 'inactive':
//         return 'bg-gray-400 hover:bg-gray-500';
//       case 'unknown status':
//         return 'bg-gray-500 hover:bg-gray-600';
//       default:
//         return 'bg-gray-500 hover:bg-gray-600';
//     }
//   };

//   if (loading) {
//     return <div className="flex justify-center items-center h-screen text-xl text-gray-700">Loading schedules...</div>;
//   }

//   if (error) {
//     return <div className="flex justify-center items-center h-screen text-xl text-red-600">{error}</div>;
//   }

//   return (
//     <div className="flex h-screen bg-gray-100">
//       <div className="w-64 bg-white shadow-md p-4 overflow-y-auto">
//         <h2 className="text-lg font-semibold text-gray-800 mb-4">Locations</h2>
//         <input
//           type="text"
//           placeholder="Filter locations..."
//           value={sidebarLocationSearchQuery}
//           onChange={(e) => setSidebarLocationSearchQuery(e.target.value)}
//           className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//         <ul className="space-y-2">
//           <li
//             key="all-locations"
//             className={`text-gray-600 hover:text-blue-600 cursor-pointer p-2 rounded-md transition-colors ${
//               selectedLocation === null ? 'font-bold text-blue-700 bg-blue-50' : ''
//             }`}
//             onClick={() => {
//               handleLocationClick(null);
//               setSidebarLocationSearchQuery('');
//             }}
//           >
//             All Locations
//           </li>
//           {locations
//             .filter(location =>
//               typeof location === 'string' && location.toLowerCase().includes(sidebarLocationSearchQuery.toLowerCase())
//             )
//             .map((location) => (
//               <li
//                 key={location}
//                 className={`text-gray-600 hover:text-blue-600 cursor-pointer p-2 rounded-md transition-colors ${
//                   selectedLocation === location ? 'font-bold text-blue-700 bg-blue-50' : ''
//                 }`}
//                 onClick={() => handleLocationClick(location)}
//               >
//                 {location}
//               </li>
//             ))}
//           {locations.filter(location =>
//               typeof location === 'string' && location.toLowerCase().includes(sidebarLocationSearchQuery.toLowerCase())
//           ).length === 0 && !loading && (
//             <li className="text-gray-500 text-sm p-2">No matching locations.</li>
//           )}
//         </ul>
//       </div>

//       <div className="flex-1 p-4 overflow-y-auto">
//         <div className="bg-white shadow-md p-4 rounded-lg">
//           <div className="flex justify-between items-center mb-4">
//             <input
//               type="text"
//               placeholder="Search Worker, Location, or Work Type..."
//               value={searchQuery}
//               onChange={handleSearchChange}
//               className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             {/* <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
//               Export
//             </button> */}
//           </div>

//           {filteredSchedules.length > 0 ? (
//             filteredSchedules.map((schedule) => (
//               <div key={schedule.id} className="border rounded-lg p-4 mb-4 shadow-sm bg-white">
//                 <div className="flex items-center mb-2">
//                   <div className="w-8 h-8 rounded-full flex items-center justify-center text-white mr-2 text-sm font-bold overflow-hidden">
//                     {schedule.profilePicture ? (
//                       <img
//                         src={schedule.profilePicture}
//                         alt={schedule.worker.charAt(0).toUpperCase()}
//                         className="w-full h-full object-cover"
//                         onError={(e) => {
//                           e.target.onerror = null;
//                           e.target.style.display = 'none';
//                           e.target.parentNode.innerHTML = schedule.worker.charAt(0).toUpperCase();
//                           e.target.parentNode.classList.add('bg-gray-800');
//                         }}
//                       />
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center bg-gray-800">
//                         {schedule.worker && schedule.worker !== 'N/A Worker' ? schedule.worker.charAt(0).toUpperCase() : '?'}
//                       </div>
//                     )}
//                   </div>
//                   <div>
//                     <span className="font-semibold text-gray-800">{schedule.worker}</span>
//                     <span className="ml-2 text-gray-600">• Location - {schedule.location}</span>
//                     <span className="ml-2 text-gray-600">• Work Type - {schedule.workType}</span>
//                   </div>
//                 </div>
//                 <div className="mb-2 flex flex-wrap justify-between items-center">
//                   <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-2 sm:mb-0">
//                     <div className="text-center">
//                       <div className="font-medium text-gray-700">{schedule.dates[0]}</div>
//                       <div className="text-gray-500 text-sm">{schedule.hoursOfWork[0]}</div>
//                     </div>
//                   </div>
//                   <div className="flex flex-col items-end">
//                     <button
//                       className={`text-white px-4 py-2 rounded-md mb-1 text-sm font-semibold transition-colors ${getStatusColorClass(schedule.status)}`}
//                     >
//                       Status - {schedule.status}
//                     </button>
//                     <div className="text-gray-500 text-sm">
//                       End Date/Time - {
//                         schedule.dates[0] !== 'Invalid Date' && schedule.endDateTime && schedule.parsedDateForTimeCalc
//                           ? format(
//                               parse(`${schedule.parsedDateForTimeCalc} ${schedule.endDateTime}`, 'yyyy-MM-dd HH:mm', new Date()),
//                               'h:mm a'
//                             )
//                           : 'N/A'
//                       }
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <p className="text-center text-gray-600 p-4">No schedules found matching your current filters or search criteria.</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ReportPage;


import React, { useState, useEffect } from 'react';
import { parse, format, isValid, isBefore, isAfter, isWithinInterval } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { fetchSchedulesInRange } from '../api';

const ReportPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendSchedules, setBackendSchedules] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [sidebarLocationSearchQuery, setSidebarLocationSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // New state for sidebar toggle

  const mapBackendScheduleToFrontend = (backendSchedule) => {
    let workerName = 'N/A Worker';
    let workerProfilePicture = null;
    const careWorkerObject = Array.isArray(backendSchedule.careWorker) && backendSchedule.careWorker.length > 0
      ? backendSchedule.careWorker[0]
      : null;

    if (careWorkerObject) {
      if (careWorkerObject.firstName || careWorkerObject.lastName) {
        const first = careWorkerObject.firstName || '';
        const last = careWorkerObject.lastName || '';
        workerName = [first, last].filter(Boolean).join(' ').trim() || 'N/A Worker';
      } else {
        workerName = careWorkerObject.name || careWorkerObject.username || careWorkerObject.email || 'N/A Worker';
      }
      workerProfilePicture = careWorkerObject.profilePicture || null;
    }

    if (workerName === 'N/A Worker') {
      console.warn("Worker name still 'N/A Worker'. Inspecting backendSchedule.careWorker:", backendSchedule.careWorker);
    }

    const workerStatusFromDb = careWorkerObject?.status || 'Unknown Status';
    const scheduleDateRaw = backendSchedule.date;
    const scheduleStart = backendSchedule.start;
    const scheduleEnd = backendSchedule.end;

    let scheduleDateForParsing = '';
    let displayDate = 'Invalid Date';

    if (scheduleDateRaw) {
      try {
        // Parse possible date formats (YYYY-MM-DD or full date string)
        const parsedDate = parse(scheduleDateRaw, 'yyyy-MM-dd', new Date()) || new Date(scheduleDateRaw);
        if (isValid(parsedDate)) {
          scheduleDateForParsing = format(parsedDate, 'yyyy-MM-dd');
          displayDate = format(parsedDate, 'MMM d, yyyy');
        } else {
          console.warn("Invalid date format:", scheduleDateRaw);
        }
      } catch (e) {
        console.error("Date parsing error:", scheduleDateRaw, e);
      }
    }

    let derivedStatus = workerStatusFromDb;
    let scheduleStartDateTime = null;
    let scheduleEndDateTime = null;

    if (scheduleDateForParsing && scheduleStart && scheduleEnd) {
      try {
        // Assume times are in IST (per your timestamp)
        const timeZone = 'Asia/Kolkata';
        scheduleStartDateTime = parse(`${scheduleDateForParsing} ${scheduleStart}`, 'yyyy-MM-dd HH:mm', new Date());
        scheduleEndDateTime = parse(`${scheduleDateForParsing} ${scheduleEnd}`, 'yyyy-MM-dd HH:mm', new Date());

        if (isValid(scheduleStartDateTime) && isValid(scheduleEndDateTime)) {
          // Convert to IST for comparison
          const currentDateTime = toZonedTime(new Date(), timeZone);

          if (isBefore(currentDateTime, scheduleStartDateTime)) {
            derivedStatus = 'Upcoming';
          } else if (isWithinInterval(currentDateTime, { start: scheduleStartDateTime, end: scheduleEndDateTime })) {
            derivedStatus = 'In Progress';
          } else if (isAfter(currentDateTime, scheduleEndDateTime)) {
            derivedStatus = 'Completed';
          }
        } else {
          console.warn("Invalid start/end time:", backendSchedule.id, scheduleStart, scheduleEnd);
        }
      } catch (e) {
        console.error("Error in status derivation:", e);
      }
    } else {
      console.warn("Missing date or times:", { date: scheduleDateRaw, start: scheduleStart, end: scheduleEnd });
    }

    const displayLocation = typeof backendSchedule.location === 'object' && backendSchedule.location !== null
      ? backendSchedule.location.name || backendSchedule.location.address || 'N/A Location Object'
      : backendSchedule.location || 'N/A Location';

    let displayWorkType = '';
    if (typeof backendSchedule.location === 'object' && backendSchedule.location !== null && backendSchedule.location.workType) {
      displayWorkType = backendSchedule.location.workType;
    } else {
      displayWorkType = backendSchedule.title || backendSchedule.description || 'N/A Work Type';
    }

    if (!displayWorkType || displayWorkType.trim() === '') {
      console.warn("Work Type not found:", backendSchedule);
      displayWorkType = 'N/A Work Type';
    }

    return {
      id: backendSchedule.id,
      worker: workerName,
      profilePicture: workerProfilePicture,
      location: displayLocation,
      workType: displayWorkType,
      dates: [displayDate],
      hoursOfWork: [`${scheduleStart || 'N/A'} - ${scheduleEnd || 'N/A'}`],
      status: derivedStatus,
      endDateTime: scheduleEnd,
      parsedDateForTimeCalc: scheduleDateForParsing,
    };
  };

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        setLoading(true);
        setError(null);

        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const startDateString = format(startOfMonth, 'yyyy-MM-dd');
        const endDateString = format(endOfMonth, 'yyyy-MM-dd');

        const response = await fetchSchedulesInRange(startDateString, endDateString);
        const schedulesArray = response.data && Array.isArray(response.data) ? response.data : [];

        setBackendSchedules(schedulesArray);

        const uniqueLocations = [...new Set(
          schedulesArray
            .map(s => typeof s.location === 'object' && s.location !== null
              ? s.location.name || s.location.address
              : s.location
            )
            .filter(Boolean)
        )];
        setLocations(uniqueLocations);
      } catch (err) {
        console.error('Error fetching schedules:', err);
        setError('Failed to load schedules. Please check your network or try again.');
        setBackendSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessData();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setSelectedLocation(null);
  };

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
    setSearchQuery('');
    setIsSidebarOpen(false); // Close sidebar after selecting a location on mobile
  };

  const filteredSchedules = Array.isArray(backendSchedules)
    ? backendSchedules
      .map(mapBackendScheduleToFrontend)
      .filter((schedule) => {
        const lowerCaseSearchQuery = searchQuery.toLowerCase();
        const matchesSearch =
          schedule.worker.toLowerCase().includes(lowerCaseSearchQuery) ||
          schedule.location.toLowerCase().includes(lowerCaseSearchQuery) ||
          schedule.workType.toLowerCase().includes(lowerCaseSearchQuery);

        const matchesLocation = selectedLocation
          ? schedule.location === selectedLocation
          : true;

        return matchesSearch && matchesLocation;
      })
    : [];

  const getStatusColorClass = (status) => {
    switch (status.toLowerCase()) {
      case 'in progress':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'upcoming':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'completed':
        return 'bg-green-600 hover:bg-green-700';
      case 'inactive':
        return 'bg-gray-400 hover:bg-gray-500';
      case 'unknown status':
        return 'bg-gray-500 hover:bg-gray-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl text-gray-700">Loading schedules...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-xl text-red-600">{error}</div>;
  }

  return (
    <div className="flex flex-col sm:flex-row h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle Button */}
      <div className="sm:hidden p-4 bg-white shadow-md">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-blue-600 hover:text-blue-800 focus:outline-none"
        >
          {isSidebarOpen ? 'Hide Locations' : 'Show Locations'}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`w-full sm:w-64 bg-white shadow-md p-4 overflow-y-auto ${isSidebarOpen ? 'block' : 'hidden'} sm:block`}>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Locations</h2>
        <input
          type="text"
          placeholder="Filter locations..."
          value={sidebarLocationSearchQuery}
          onChange={(e) => setSidebarLocationSearchQuery(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <ul className="space-y-2">
          <li
            key="all-locations"
            className={`text-gray-600 hover:text-blue-600 cursor-pointer p-2 rounded-md transition-colors ${
              selectedLocation === null ? 'font-bold text-blue-700 bg-blue-50' : ''
            }`}
            onClick={() => {
              handleLocationClick(null);
              setSidebarLocationSearchQuery('');
            }}
          >
            All Locations
          </li>
          {locations
            .filter(location =>
              typeof location === 'string' && location.toLowerCase().includes(sidebarLocationSearchQuery.toLowerCase())
            )
            .map((location) => (
              <li
                key={location}
                className={`text-gray-600 hover:text-blue-600 cursor-pointer p-2 rounded-md transition-colors ${
                  selectedLocation === location ? 'font-bold text-blue-700 bg-blue-50' : ''
                }`}
                onClick={() => handleLocationClick(location)}
              >
                {location}
              </li>
            ))}
          {locations.filter(location =>
            typeof location === 'string' && location.toLowerCase().includes(sidebarLocationSearchQuery.toLowerCase())
          ).length === 0 && !loading && (
            <li className="text-gray-500 text-sm p-2">No matching locations.</li>
          )}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="bg-white shadow-md p-4 rounded-lg">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <input
              type="text"
              placeholder="Search Worker, Location, or Work Type..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto">
              Export
            </button> */}
          </div>

          {filteredSchedules.length > 0 ? (
            filteredSchedules.map((schedule) => (
              <div key={schedule.id} className="border rounded-lg p-4 mb-4 shadow-sm bg-white">
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white mr-2 text-sm font-bold overflow-hidden mb-2 sm:mb-0">
                    {schedule.profilePicture ? (
                      <img
                        src={schedule.profilePicture}
                        alt={schedule.worker.charAt(0).toUpperCase()}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentNode.innerHTML = schedule.worker.charAt(0).toUpperCase();
                          e.target.parentNode.classList.add('bg-gray-800');
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        {schedule.worker && schedule.worker !== 'N/A Worker' ? schedule.worker.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="font-semibold text-gray-800">{schedule.worker}</span>
                    <span className="text-gray-600">• Location - {schedule.location}</span>
                    <span className="text-gray-600">• Work Type - {schedule.workType}</span>
                  </div>
                </div>
                <div className="mb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-2 sm:mb-0">
                    <div className="text-left sm:text-center">
                      <div className="font-medium text-gray-700">{schedule.dates[0]}</div>
                      <div className="text-gray-500 text-sm">{schedule.hoursOfWork[0]}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start sm:items-end mt-2 sm:mt-0">
                    <button
                      className={`text-white px-4 py-2 rounded-md mb-1 text-sm font-semibold transition-colors ${getStatusColorClass(schedule.status)}`}
                    >
                      Status - {schedule.status}
                    </button>
                    <div className="text-gray-500 text-sm">
                      End Date/Time - {
                        schedule.dates[0] !== 'Invalid Date' && schedule.endDateTime && schedule.parsedDateForTimeCalc
                          ? format(
                              parse(`${schedule.parsedDateForTimeCalc} ${schedule.endDateTime}`, 'yyyy-MM-dd HH:mm', new Date()),
                              'h:mm a'
                            )
                          : 'N/A'
                      }
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600 p-4">No schedules found matching your current filters or search criteria.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportPage;