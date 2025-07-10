// import React, { useEffect, useState, useMemo, useRef } from "react";
// import { fetchLocations, addLocation, fetchSchedulesInRange, updateLocation, deleteLocation } from "../api";
// import { MapPinIcon, MagnifyingGlassIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
// import { useAuth } from '../context/AuthContext';
// import Papa from 'papaparse';

// const getFirstName = (nameOrObject) => {
//     if (!nameOrObject) return ''; // Handles null, undefined, or empty array

//     let actualObject = nameOrObject;

//     if (Array.isArray(nameOrObject) && nameOrObject.length > 0) {
//         actualObject = nameOrObject[0]; // Get the first item from the array
//     }

//     if (typeof actualObject === 'object' && actualObject !== null) {
//         if (actualObject.firstName) {
//             return `${actualObject.firstName} ${actualObject.lastName || ''}`.trim();
//         }
//         if (actualObject.name) {
//             const parts = actualObject.name.trim().split(' ');
//             return parts.length > 0 ? parts[0] : '';
//         }
//         return ''; // Object but no recognizable name property
//     }

//     if (typeof actualObject === 'string') {
//         const parts = actualObject.trim().split(' ');
//         return parts.length > 0 ? parts[0] : '';
//     }

//     return ''; // Handle any other unexpected types
// };

// const getStartOfWeek = (date) => {
//     const d = new Date(date);
//     const day = d.getDay();
//     const diff = d.getDate() - day + (day === 0 ? -6 : 1);
//     const monday = new Date(d.setDate(diff));
//     monday.setHours(0, 0, 0, 0);
//     return monday;
// };

// export default function LocationPage() {
//     const [locations, setLocations] = useState([]);
//     const [schedules, setSchedules] = useState([]);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [selectedLocation, setSelectedLocation] = useState("");
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//     const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//     const [editLocation, setEditLocation] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [apiError, setApiError] = useState(null);
//     const [successMessage, setSuccessMessage] = useState("");
//     const { user, token, isLoading: isAuthLoading } = useAuth();
//     const fileInputRef = useRef(null);

//     const [form, setForm] = useState({
//         name: '',
//         street: '',
//         city: '',
//         postalCode: '',
//         country: '',
//         workType: '',
//     });
//     const [formError, setFormError] = useState('');

//     useEffect(() => {
//         const loadLocations = async () => {
//             setLoading(true);
//             setApiError(null);
//             if (!token) {
//                 setApiError("Authentication token missing. Please log in.");
//                 setLoading(false);
//                 return;
//             }

//             try {
//                 const res = await fetchLocations();
//                 setLocations(res.data);
//             } catch (err) {
//                 console.error("Failed to fetch locations:", err);
//                 setApiError(
//                     err.response?.data?.message ||
//                     "Failed to load locations. Please try again."
//                 );
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (token && !isAuthLoading) {
//             loadLocations();
//         } else if (!token && !isAuthLoading) {
//             setApiError("You are not logged in. Please log in to view locations.");
//         }
//     }, [token, isAuthLoading]);

//     useEffect(() => {
//         const loadSchedules = async () => {
//             if (!token || isAuthLoading) {
//                 setSchedules([]);
//                 return;
//             }

//             try {
//                 const currentYear = new Date().getFullYear();
//                 const startOfYear = new Date(currentYear, 0, 1);
//                 const endOfYear = new Date(currentYear, 11, 31);
//                 console.log(`Fetching schedules from ${startOfYear.toISOString().split('T')[0]} to ${endOfYear.toISOString().split('T')[0]}`);
//                 const res = await fetchSchedulesInRange(startOfYear, endOfYear);
//                 setSchedules(res.data);
//                 console.log("Fetched schedules:", res.data);
//             } catch (err) {
//                 console.error("Failed to fetch schedules in range:", err);
//                 setApiError("Failed to load schedules. Please try again.");
//             }
//         };

//         if (!isAuthLoading && token) {
//             loadSchedules();
//         } else if (!token && !isAuthLoading) {
//             setSchedules([]);
//         }
//     }, [token, isAuthLoading]);

//     const filteredLocations = useMemo(() => {
//         return locations.filter((loc) =>
//             loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             loc.address?.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             loc.address?.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             loc.address?.postalCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             loc.address?.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             loc.workType.toLowerCase().includes(searchTerm.toLowerCase())
//         );
//     }, [locations, searchTerm]);

//     const scheduledWorkers = useMemo(() => {
//         console.log("Processing schedules:", schedules);
//         if (!schedules || schedules.length === 0) {
//             console.log("No schedules available");
//             return [];
//         }

//         if (!selectedLocation) {
//             const allWorkers = schedules
//                 .filter(s => s.careWorker && s.location)
//                 .map(s => ({
//                     name: getFirstName(s.careWorker),
//                     location: s.location?.name || 'Unknown'
//                 }));
//             const uniqueWorkers = [...new Set(allWorkers.map(w => w.name))].filter(name => name);
//             console.log("All unique workers across locations:", uniqueWorkers);
//             return uniqueWorkers;
//         } else {
//             const filteredSchedules = schedules.filter(s => {
//                 if (!s.location || !s.location.name) {
//                     console.warn(`Schedule missing location data:`, s);
//                     return false;
//                 }
//                 return s.location.name === selectedLocation;
//             });
//             const workersForLocation = filteredSchedules
//                 .filter(s => s.careWorker)
//                 .map(s => getFirstName(s.careWorker));
//             const uniqueWorkersForLocation = [...new Set(workersForLocation)].filter(name => name);
//             console.log(`Unique workers for ${selectedLocation}:`, uniqueWorkersForLocation);
//             return uniqueWorkersForLocation;
//         }
//     }, [schedules, selectedLocation]);

//     const handleOpenModal = () => {
//         setIsModalOpen(true);
//         setApiError(null);
//         setSuccessMessage("");
//         setFormError("");
//         setForm({
//             name: '',
//             street: '',
//             city: '',
//             postalCode: '',
//             country: '',
//             workType: '',
//         });
//         setEditLocation(null);
//     };

//     const handleEditLocation = (location) => {
//         setIsEditModalOpen(true);
//         setApiError(null);
//         setSuccessMessage("");
//         setFormError("");
//         setForm({
//             name: location.name || '',
//             street: location.address?.street || '',
//             city: location.address?.city || '',
//             postalCode: location.address?.postalCode || '',
//             country: location.address?.country || '',
//             workType: location.workType || '',
//         });
//         setEditLocation(location);
//     };

//     const handleCloseModal = () => {
//         setIsModalOpen(false);
//         setIsEditModalOpen(false);
//         setIsDeleteModalOpen(false);
//         setApiError(null);
//         setFormError('');
//         setEditLocation(null);
//     };

//     const handleFormChange = (e) => {
//         const { name, value } = e.target;
//         setForm((prev) => ({ ...prev, [name]: value }));
//     };

//     const handleDeleteLocation = async () => {
//         if (!editLocation) return;
//         if (!token) {
//             setApiError("You must be logged in to delete a location.");
//             return;
//         }

//         setIsDeleteModalOpen(true);
//     };

//     const confirmDeleteLocation = async () => {
//         setLoading(true);
//         setApiError(null);

//         try {
//             await deleteLocation(editLocation._id);
//             setLocations((prev) => prev.filter((loc) => loc._id !== editLocation._id));
//             setSuccessMessage("Location deleted successfully!");
//             handleCloseModal();
//         } catch (err) {
//             console.error("Failed to delete location:", {
//                 message: err.message,
//                 status: err.response?.status,
//                 data: err.response?.data,
//             });
//             setApiError(err.response?.data?.msg || "Failed to delete location. Please try again.");
//         } finally {
//             setLoading(false);
//             setTimeout(() => {
//                 setApiError(null);
//                 setSuccessMessage("");
//             }, 5000);
//         }
//     };

//     const handleFormSubmit = async (e) => {
//         e.preventDefault();
//         setFormError('');
//         setApiError(null);
//         if (!token) {
//             setApiError("You must be logged in to add or update a location.");
//             setLoading(false);
//             return;
//         }

//         if (!form.name || !form.street || !form.city || !form.postalCode || !form.country || !form.workType) {
//             if (!form.workType) {
//                 setFormError('Work type is required.');
//             } else {
//                 setFormError('All fields are required.');
//             }
//             return;
//         }

//         setLoading(true);

//         const locationData = {
//             name: form.name,
//             address: {
//                 street: form.street,
//                 city: form.city,
//                 postalCode: form.postalCode,
//                 country: form.country,
//             },
//             workType: form.workType,
//             isCustom: true,
//         };

//         console.log("Submitting Location:", locationData);

//         try {
//             if (editLocation) {
//                 const res = await updateLocation(editLocation._id, locationData);
//                 setLocations((prev) =>
//                     prev.map((loc) =>
//                         loc._id === editLocation._id ? { ...res.data, _id: res.data._id } : loc
//                     )
//                 );
//                 setSuccessMessage("Location updated successfully!");
//             } else {
//                 const res = await addLocation(locationData);
//                 setLocations((prev) => [...prev, { ...res.data, _id: res.data._id || Date.now() }]);
//                 setSuccessMessage("Location added successfully!");
//             }
//             handleCloseModal();
//         } catch (err) {
//             console.error("Failed to process location:", err);
//             const serverErrors = err.response?.data?.errors;
//             if (serverErrors && Array.isArray(serverErrors)) {
//                 setApiError(serverErrors.map((e) => e.msg).join(" | "));
//             } else {
//                 setApiError(err.response?.data?.msg || "Failed to process location. Please check console.");
//             }
//         } finally {
//             setLoading(false);
//             setTimeout(() => {
//                 setApiError(null);
//                 setSuccessMessage("");
//             }, 5000);
//         }
//     };

//     const handleCSVUpload = async (event) => {
//         const file = event.target.files[0];
//         if (!file) return;

//         if (!file.name.endsWith('.csv')) {
//             setApiError('Please upload a valid CSV file.');
//             setTimeout(() => setApiError(null), 5000);
//             return;
//         }

//         setLoading(true);
//         setApiError(null); // Clear previous errors
//         setSuccessMessage(""); // Clear previous success messages

//         Papa.parse(file, {
//             complete: async (result) => {
//                 const rows = result.data;
//                 console.log('Parsed CSV Rows:', rows); // Debug entire CSV

//                 // Validate headers
//                 const headers = rows[0];
//                 const expectedHeaders = ["Location Name", "Street", "City", "Postal Code", "Country", "Work Type"];
//                 if (!expectedHeaders.every((header, index) => headers[index] === header)) {
//                     setApiError('Invalid CSV format. Expected headers: ' + expectedHeaders.join(', '));
//                     setLoading(false);
//                     setTimeout(() => setApiError(null), 5000);
//                     return;
//                 }

//                 const newLocations = [];
//                 const errors = [];

//                 for (let i = 1; i < rows.length; i++) {
//                     const row = rows[i];
//                     // Skip empty or invalid rows
//                     if (!row || row.length < 6 || row.every(cell => !cell || cell.trim() === '')) {
//                         console.log(`Skipping invalid or empty row ${i + 1}`);
//                         continue;
//                     }

//                     const [name, street, city, postalCode, country, workType] = row.map(cell => cell ? cell.trim().replace(/^"|"$/g, '') : '');
//                     console.log(`Processing row ${i + 1}:`, { name, street, city, postalCode, country, workType }); // Debug row data

//                     // Validate required fields
//                     if (!name || !street || !city || !workType) {
//                         errors.push(`Row ${i + 1}: Missing required fields (name, street, city, work type)`);
//                         console.log(`Validation failed for row ${i + 1}: Missing fields`);
//                         continue;
//                     }

//                     // Validate workType (case-insensitive)
//                     if (workType.toUpperCase() !== "SUPPORT WORKER") {
//                         errors.push(`Row ${i + 1}: Invalid work type. Must be 'SUPPORT WORKER'`);
//                         console.log(`Invalid workType for row ${i + 1}: ${workType}`);
//                         continue;
//                     }

//                     const locationData = {
//                         name,
//                         address: {
//                             street,
//                             city,
//                             postalCode: postalCode || '',
//                             country: country || '',
//                         },
//                         workType: "SUPPORT WORKER",
//                         isCustom: true,
//                     };

//                     try {
//                         const res = await addLocation(locationData);
//                         console.log(`API Response for row ${i + 1}:`, { status: res.status, data: res.data }); // Debug API response
//                         if (res.status >= 200 && res.status < 300) {
//                             newLocations.push({ ...res.data, _id: res.data._id || Date.now() });
//                         } else {
//                             errors.push(`Row ${i + 1}: Unexpected API response status ${res.status}`);
//                         }
//                     } catch (err) {
//                         console.error(`Failed to add location at row ${i + 1}:`, {
//                             message: err.message,
//                             status: err.response?.status,
//                             data: err.response?.data,
//                         });
//                         errors.push(`Row ${i + 1}: ${err.response?.data?.msg || 'Unknown error'}`);
//                     }
//                 }

//                 // Update state based on results
//                 if (newLocations.length > 0) {
//                     setLocations((prev) => [...prev, ...newLocations]);
//                     let message = `Successfully imported ${newLocations.length} location(s)`;
//                     if (errors.length > 0) {
//                         message += `. ${errors.length} row(s) failed: ${errors.join('; ')}`;
//                         setApiError(message);
//                     } else {
//                         setSuccessMessage(message);
//                     }
//                 } else {
//                     setApiError(errors.length > 0 ? `No locations imported. Errors: ${errors.join('; ')}` : 'No valid locations found in the CSV file.');
//                 }

//                 setLoading(false);
//                 fileInputRef.current.value = ''; // Reset file input
//                 setTimeout(() => {
//                     setApiError(null);
//                     setSuccessMessage("");
//                 }, 8000); // Extended timeout for longer error messages
//             },
//             error: (err) => {
//                 console.error('CSV Parsing Error:', err);
//                 setApiError('Failed to parse CSV file. Please ensure it is formatted correctly.');
//                 setLoading(false);
//                 setTimeout(() => setApiError(null), 5000);
//             },
//             header: false,
//             skipEmptyLines: true,
//         });
//     };

//     const isAuthorized = user && (user.role === "admin" || user.role === "manager");
//     const isAdmin = user && user.role === "admin";

//     return (
//         <div className="flex flex-col h-screen bg-gray-100 font-sans">
//             <div className="flex flex-1 flex-col md:flex-row">
//                 <div className="flex-1 px-4 py-4 md:px-10 md:py-6 bg-white overflow-auto">
//                     <div className="flex flex-col md:flex-row justify-between items-center mb-6">
//                         <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-0">Locations</h1>
//                         {isAuthorized && isAdmin && (
//                             <button
//                                 className="w-full md:w-auto bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center justify-center space-x-2 hover:bg-indigo-700 transition duration-200"
//                                 onClick={handleOpenModal}
//                             >
//                                 <span className="text-xl">+</span>
//                                 <span>Add Location</span>
//                             </button>
//                         )}
//                     </div>

//                     {successMessage && (
//                         <div
//                             className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 text-sm"
//                             role="alert"
//                         >
//                             <p className="font-bold">Success!</p>
//                             <p>{successMessage}</p>
//                         </div>
//                     )}

//                     {apiError && (
//                         <div
//                             className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 text-sm"
//                             role="alert"
//                         >
//                             <p className="font-bold">Error!</p>
//                             <p>{apiError}</p>
//                         </div>
//                     )}

//                     <div className="flex flex-col md:flex-row items-center justify-between mb-4 space-y-4 md:space-y-0">
//                         <div className="relative w-full md:w-1/3">
//                             <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                             <input
//                                 type="text"
//                                 placeholder="Search..."
//                                 className="border border-gray-300 pl-10 pr-3 py-2 rounded-md w-full text-sm focus:ring-indigo-500 focus:border-indigo-500"
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                             />
//                         </div>
//                         {isAdmin && (
//                             <div className="flex items-center space-x-2 w-full md:w-auto">
//                                 <button
//                                     className="p-2 border border-blue-500 bg-blue-50 text-blue-600 rounded-md w-full md:w-[120px] flex items-center justify-center hover:bg-blue-100 transition duration-200"
//                                     onClick={async () => {
//                                         const { jsPDF } = await import("jspdf");
//                                         const autoTable = (await import("jspdf-autotable")).default;

//                                         const doc = new jsPDF();
//                                         const columns = [
//                                             { header: "Location Name", dataKey: "name" },
//                                             { header: "Street", dataKey: "street" },
//                                             { header: "City", dataKey: "city" },
//                                             { header: "Postal Code", dataKey: "postalCode" },
//                                             { header: "Country", dataKey: "country" },
//                                             { header: "Work Type", dataKey: "workType" },
//                                         ];
//                                         const rows = filteredLocations.map(loc => ({
//                                             name: loc.name,
//                                             street: loc.address?.street || "",
//                                             city: loc.address?.city || "",
//                                             postalCode: loc.address?.postalCode || "",
//                                             country: loc.address?.country || "",
//                                             workType: loc.workType || "",
//                                         }));

//                                         doc.text("Locations List", 14, 16);
//                                         autoTable(doc, {
//                                             startY: 22,
//                                             head: [columns.map(col => col.header)],
//                                             body: rows.map(row => columns.map(col => row[col.dataKey])),
//                                             styles: { fontSize: 10 },
//                                         });

//                                         doc.save("locations.pdf");
//                                     }}
//                                 >
//                                     <span>
//                                         <img src="/outbox.svg" alt="Export icon" className='w-[20px] mr-1'/>
//                                     </span>
//                                     <span className="font-medium">Export</span>
//                                 </button>
//                                 <div>
//                                     <input
//                                         type="file"
//                                         accept=".csv"
//                                         ref={fileInputRef}
//                                         className="hidden"
//                                         onChange={handleCSVUpload}
//                                     />
//                                     <button
//                                         className="p-2 border border-blue-500 bg-blue-50 text-blue-600 rounded-md w-full md:w-[140px] flex items-center justify-center hover:bg-blue-100 transition duration-200"
//                                         onClick={() => fileInputRef.current.click()}
//                                     >
//                                         <ArrowUpTrayIcon className="w-[20px] mr-1" />
//                                         <span className="font-medium">Upload CSV</span>
//                                     </button>
//                                 </div>
//                             </div>
//                         )}
//                     </div>

//                     <span className="text-sm text-gray-600 mb-4 block">
//                         Showing {filteredLocations.length} Locations
//                     </span>

//                     <div className="hidden md:grid grid-cols-[2fr,3fr,1.5fr,1.5fr] gap-4 text-sm font-semibold text-gray-600 py-3 border-b border-gray-200">
//                         <div>Location Name</div>
//                         <div>Location Address</div>
//                         <div>Areas</div>
//                         {isAdmin && (
//                             <div className="text-right">Actions</div>
//                         )}
//                     </div>

//                     {loading && <p className="py-4 text-center text-gray-600">Loading locations...</p>}
//                     {!loading && filteredLocations.length === 0 && (
//                         <p className="py-4 text-center text-gray-600">No locations found.</p>
//                     )}
//                     {!loading &&
//                         filteredLocations.map((loc) => (
//                             <div
//                                 key={loc._id}
//                                 className="flex flex-col md:grid md:grid-cols-[2fr,3fr,1.5fr,1.5fr] gap-4 py-3 items-start md:items-center border-b border-gray-200 text-sm"
//                             >
//                                 <div className="text-gray-900 font-medium">{loc.name}</div>
//                                 <div className="text-[#0034AD] flex items-center mt-2 md:mt-0">
//                                     <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
//                                     <span className="">
//                                         {loc.address?.street}, {loc.address?.city}, {loc.address?.postalCode}, {loc.address?.country}
//                                     </span>
//                                 </div>
//                                 <div className="text-gray-700 mt-2 md:mt-0">{loc.workType}</div>
//                                 <div className="flex justify-start md:justify-end w-full mt-3 md:mt-0">
//                                     {isAuthorized && isAdmin && (
//                                         <button
//                                             className="inline-flex justify-center w-full md:w-auto rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//                                             onClick={() => handleEditLocation(loc)}
//                                         >
//                                             Edit Settings
//                                             <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
//                                                 <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
//                                             </svg>
//                                         </button>
//                                     )}
//                                 </div>
//                             </div>
//                         ))}
//                 </div>

//                 <div className="w-full md:w-72 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-200 px-4 py-4 md:px-5 md:py-6 shadow-md flex-shrink-0">
//                     <div className="bg-white rounded-lg shadow-sm p-4">
//                         <h2 className="text-lg font-semibold text-gray-800 mb-3">Teams</h2>
//                         <select
//                             className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
//                             value={selectedLocation}
//                             onChange={(e) => setSelectedLocation(e.target.value)}
//                         >
//                             <option value="">All Locations</option>
//                             {locations.map((loc) => (
//                                 <option key={loc._id} value={loc.name}>
//                                     {loc.name}
//                                 </option>
//                             ))}
//                         </select>
//                         <div className="mt-6 md:mt-10 text-sm text-gray-700">
//                             {scheduledWorkers.length > 0 ? (
//                                 <>
//                                     <p className="font-semibold mb-2">
//                                         Scheduled Workers at {selectedLocation || "All Locations"}:
//                                     </p>
//                                     <ul className="list-none list-inside space-y-1">
//                                         {scheduledWorkers.map((worker, index) => (
//                                             <li key={index} className="pt-[10px]">{worker}</li>
//                                         ))}
//                                     </ul>
//                                 </>
//                             ) : (
//                                 <p className="text-gray-500">
//                                     No workers are currently scheduled at{" "}
//                                     {selectedLocation || "any locations"}.
//                                 </p>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {(isModalOpen || isEditModalOpen) && (
//                 <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm md:max-w-md p-6 md:p-8 transform transition-all duration-300 ease-out scale-95 opacity-0 animate-scale-in">
//                         <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6 text-center">
//                             {isEditModalOpen ? 'Edit Location' : 'Add New Location'}
//                         </h2>

//                         {formError && (
//                             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">
//                                 <strong className="font-bold">Error: </strong>
//                                 <span className="block sm:inline">{formError}</span>
//                             </div>
//                         )}
//                         {apiError && (
//                             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">
//                                 <strong className="font-bold">Error: </strong>
//                                 <span className="block sm:inline">{apiError}</span>
//                             </div>
//                         )}

//                         <form onSubmit={handleFormSubmit} className="space-y-4 md:space-y-5">
//                             <div>
//                                 <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
//                                     Location Name
//                                 </label>
//                                 <input
//                                     type="text"
//                                     id="name"
//                                     name="name"
//                                     value={form.name}
//                                     onChange={handleFormChange}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
//                                     placeholder="e.g., Central Office"
//                                     required
//                                 />
//                             </div>

//                             <div className="space-y-3 md:space-y-4 pt-2">
//                                 <label className="block text-base md:text-lg font-semibold text-gray-800 border-b pb-2 mb-3">
//                                     Location Address
//                                 </label>
//                                 <div>
//                                     <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
//                                         Street
//                                     </label>
//                                     <input
//                                         type="text"
//                                         id="street"
//                                         name="street"
//                                         value={form.street}
//                                         onChange={handleFormChange}
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
//                                         placeholder="e.g., 123 Main Street"
//                                         required
//                                     />
//                                 </div>
//                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
//                                     <div>
//                                         <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
//                                             City
//                                         </label>
//                                         <input
//                                             type="text"
//                                             id="city"
//                                             name="city"
//                                             value={form.city}
//                                             onChange={handleFormChange}
//                                             className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
//                                             placeholder="e.g., London"
//                                             required
//                                         />
//                                     </div>
//                                     <div>
//                                         <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
//                                             Postal Code
//                                         </label>
//                                         <input
//                                             type="text"
//                                             id="postalCode"
//                                             name="postalCode"
//                                             value={form.postalCode}
//                                             onChange={handleFormChange}
//                                             className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
//                                             placeholder="e.g., SW1A 1AA"
//                                             required
//                                         />
//                                     </div>
//                                 </div>
//                                 <div>
//                                     <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
//                                         Country
//                                     </label>
//                                     <input
//                                         type="text"
//                                         id="country"
//                                         name="country"
//                                         value={form.country}
//                                         onChange={handleFormChange}
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
//                                         placeholder="e.g., United Kingdom"
//                                         required
//                                     />
//                                 </div>
//                             </div>

//                             <div>
//                                 <label htmlFor="workType" className="block text-sm font-medium text-gray-700 mb-1">
//                                     Work Type
//                                 </label>
//                                 <select
//                                     id="workType"
//                                     name="workType"
//                                     value={form.workType}
//                                     onChange={handleFormChange}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
//                                     required
//                                 >
//                                     <option value="">Select a Work Type</option>
//                                     <option value="SUPPORT WORKER">SUPPORT WORKER</option>
//                                 </select>
//                             </div>

//                             <div className="flex justify-end space-x-2 pt-4 md:pt-6">
//                                 {isEditModalOpen && (
//                                     <button
//                                         type="button"
//                                         onClick={handleDeleteLocation}
//                                         className="px-4 py-2 border bg-red-600 border-gray-300 rounded-lg text-white hover:bg-red-700 transition duration-200 text-base font-medium"
//                                         disabled={loading}
//                                     >
//                                         Delete
//                                     </button>
//                                 )}
//                                 <button
//                                     type="button"
//                                     onClick={handleCloseModal}
//                                     className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200 text-base font-medium"
//                                     disabled={loading}
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 text-base font-medium shadow-md flex items-center justify-center"
//                                     disabled={loading}
//                                 >
//                                     {loading ? (
//                                         <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                         </svg>
//                                     ) : (
//                                         isEditModalOpen ? 'Update Location' : 'Add Location'
//                                     )}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {isDeleteModalOpen && (
//                 <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm md:max-w-md p-6 md:p-8 transform transition-all duration-300 ease-out scale-95 opacity-0 animate-scale-in">
//                         <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6 text-center">
//                             Confirm Deletion
//                         </h2>
//                         <p className="text-sm text-gray-700 mb-6 text-center">
//                             Are you sure you want to delete the location "{editLocation?.name}"? This action cannot be undone.
//                         </p>
//                         {apiError && (
//                             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">
//                                 <strong className="font-bold">Error: </strong>
//                                 <span className="block sm:inline">{apiError}</span>
//                             </div>
//                         )}
//                         <div className="flex justify-end space-x-2">
//                             <button
//                                 type="button"
//                                 onClick={handleCloseModal}
//                                 className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200 text-base font-medium"
//                                 disabled={loading}
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 type="button"
//                                 onClick={confirmDeleteLocation}
//                                 className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 text-base font-medium flex items-center justify-center"
//                                 disabled={loading}
//                             >
//                                 {loading ? (
//                                     <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                     </svg>
//                                 ) : (
//                                     'Delete'
//                                 )}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }



import React, { useEffect, useState, useMemo, useRef } from "react";
import { fetchLocations, addLocation, fetchSchedulesInRange, updateLocation, deleteLocation } from "../api";
import { MapPinIcon, MagnifyingGlassIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import Papa from 'papaparse';

const getFirstName = (nameOrObject) => {
    if (!nameOrObject) return ''; // Handles null, undefined, or empty array

    let actualObject = nameOrObject;

    if (Array.isArray(nameOrObject) && nameOrObject.length > 0) {
        actualObject = nameOrObject[0]; // Get the first item from the array
    }

    if (typeof actualObject === 'object' && actualObject !== null) {
        if (actualObject.firstName) {
            return `${actualObject.firstName} ${actualObject.lastName || ''}`.trim();
        }
        if (actualObject.name) {
            const parts = actualObject.name.trim().split(' ');
            return parts.length > 0 ? parts[0] : '';
        }
        return ''; // Object but no recognizable name property
    }

    if (typeof actualObject === 'string') {
        const parts = actualObject.trim().split(' ');
        return parts.length > 0 ? parts[0] : '';
    }

    return ''; // Handle any other unexpected types
};

const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
};

export default function LocationPage() {
    const [locations, setLocations] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editLocation, setEditLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const { user, token, isLoading: isAuthLoading } = useAuth();
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        name: '',
        street: '',
        city: '',
        postalCode: '',
        country: '',
        workType: '',
    });
    const [formError, setFormError] = useState('');

    useEffect(() => {
        const loadLocations = async () => {
            setLoading(true);
            setApiError(null);
            if (!token) {
                setApiError("Authentication token missing. Please log in.");
                setLoading(false);
                return;
            }

            try {
                const res = await fetchLocations();
                setLocations(res.data.data);
            } catch (err) {
                console.error("Failed to fetch locations:", err);
                setApiError(
                    err.response?.data?.message ||
                    "Failed to load locations. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        if (token && !isAuthLoading) {
            loadLocations();
        } else if (!token && !isAuthLoading) {
            setApiError("You are not logged in. Please log in to view locations.");
        }
    }, [token, isAuthLoading]);

    useEffect(() => {
        const loadSchedules = async () => {
            if (!token || isAuthLoading) {
                setSchedules([]);
                return;
            }

            try {
                const currentYear = new Date().getFullYear();
                const startOfYear = new Date(currentYear, 0, 1);
                const endOfYear = new Date(currentYear, 11, 31);
                console.log(`Fetching schedules from ${startOfYear.toISOString().split('T')[0]} to ${endOfYear.toISOString().split('T')[0]}`);
                const res = await fetchSchedulesInRange(startOfYear, endOfYear);
                setSchedules(res.data.data);
                console.log("Fetched schedules:", res.data);
            } catch (err) {
                console.error("Failed to fetch schedules in range:", err);
                setApiError("Failed to load schedules. Please try again.");
            }
        };

        if (!isAuthLoading && token) {
            loadSchedules();
        } else if (!token && !isAuthLoading) {
            setSchedules([]);
        }
    }, [token, isAuthLoading]);

    const filteredLocations = useMemo(() => {
        return locations.filter((loc) =>
            loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loc.address?.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loc.address?.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loc.address?.postalCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loc.address?.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loc.workType.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [locations, searchTerm]);

    const scheduledWorkers = useMemo(() => {
        console.log("Processing schedules:", schedules);
        if (!schedules || schedules.length === 0) {
            console.log("No schedules available");
            return [];
        }

        if (!selectedLocation) {
            const allWorkers = schedules
                .filter(s => s.careWorker && s.location)
                .map(s => ({
                    name: getFirstName(s.careWorker),
                    location: s.location?.name || 'Unknown'
                }));
            const uniqueWorkers = [...new Set(allWorkers.map(w => w.name))].filter(name => name);
            console.log("All unique workers across locations:", uniqueWorkers);
            return uniqueWorkers;
        } else {
            const filteredSchedules = schedules.filter(s => {
                if (!s.location || !s.location.name) {
                    console.warn(`Schedule missing location data:`, s);
                    return false;
                }
                return s.location.name === selectedLocation;
            });
            const workersForLocation = filteredSchedules
                .filter(s => s.careWorker)
                .map(s => getFirstName(s.careWorker));
            const uniqueWorkersForLocation = [...new Set(workersForLocation)].filter(name => name);
            console.log(`Unique workers for ${selectedLocation}:`, uniqueWorkersForLocation);
            return uniqueWorkersForLocation;
        }
    }, [schedules, selectedLocation]);

    const handleOpenModal = () => {
        setIsModalOpen(true);
        setApiError(null);
        setSuccessMessage("");
        setFormError("");
        setForm({
            name: '',
            street: '',
            city: '',
            postalCode: '',
            country: '',
            workType: '',
        });
        setEditLocation(null);
    };

    const handleEditLocation = (location) => {
        setIsEditModalOpen(true);
        setApiError(null);
        setSuccessMessage("");
        setFormError("");
        setForm({
            name: location.name || '',
            street: location.address?.street || '',
            city: location.address?.city || '',
            postalCode: location.address?.postalCode || '',
            country: location.address?.country || '',
            workType: location.workType || '',
        });
        setEditLocation(location);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setApiError(null);
        setFormError('');
        setEditLocation(null);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleDeleteLocation = async () => {
        if (!editLocation) return;
        if (!token) {
            setApiError("You must be logged in to delete a location.");
            return;
        }

        setIsDeleteModalOpen(true);
    };

    const confirmDeleteLocation = async () => {
        setLoading(true);
        setApiError(null);

        try {
            await deleteLocation(editLocation._id);
            setLocations((prev) => prev.filter((loc) => loc._id !== editLocation._id));
            setSuccessMessage("Location deleted successfully!");
            handleCloseModal();
        } catch (err) {
            console.error("Failed to delete location:", {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data,
            });
            setApiError(err.response?.data?.msg || "Failed to delete location. Please try again.");
        } finally {
            setLoading(false);
            setTimeout(() => {
                setApiError(null);
                setSuccessMessage("");
            }, 5000);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setApiError(null);
        if (!token) {
            setApiError("You must be logged in to add or update a location.");
            setLoading(false);
            return;
        }

        if (!form.name || !form.street || !form.city || !form.postalCode || !form.country || !form.workType) {
            if (!form.workType) {
                setFormError('Work type is required.');
            } else {
                setFormError('All fields are required.');
            }
            return;
        }

        setLoading(true);

        const locationData = {
            name: form.name,
            address: {
                street: form.street,
                city: form.city,
                postalCode: form.postalCode,
                country: form.country,
            },
            workType: form.workType,
            isCustom: true,
        };

        console.log("Submitting Location:", locationData);

        try {
            if (editLocation) {
                const res = await updateLocation(editLocation._id, locationData);
                setLocations((prev) =>
                    prev.map((loc) =>
                        loc._id === editLocation._id ? { ...res.data, _id: res.data._id } : loc
                    )
                );
                setSuccessMessage("Location updated successfully!");
            } else {
                const res = await addLocation(locationData);
                setLocations((prev) => [...prev, { ...res.data.data, _id: res.data.data._id || Date.now() }]);
                setSuccessMessage("Location added successfully!");
            }
            handleCloseModal();
        } catch (err) {
            console.error("Failed to process location:", err);
            const serverErrors = err.response?.data?.errors;
            if (serverErrors && Array.isArray(serverErrors)) {
                setApiError(serverErrors.map((e) => e.msg).join(" | "));
            } else {
                setApiError(err.response?.data?.msg || "Failed to process location. Please check console.");
            }
        } finally {
            setLoading(false);
            setTimeout(() => {
                setApiError(null);
                setSuccessMessage("");
            }, 5000);
        }
    };

    const handleCSVUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            setApiError('Please upload a valid CSV file.');
            setTimeout(() => setApiError(null), 5000);
            return;
        }

        setLoading(true);
        setApiError(null); // Clear previous errors
        setSuccessMessage(""); // Clear previous success messages

        Papa.parse(file, {
            complete: async (result) => {
                const rows = result.data;
                console.log('Parsed CSV Rows:', rows); // Debug entire CSV

                // Validate headers
                const headers = rows[0];
                const expectedHeaders = ["Location Name", "Street", "City", "Postal Code", "Country", "Work Type"];
                if (!expectedHeaders.every((header, index) => headers[index] === header)) {
                    setApiError('Invalid CSV format. Expected headers: ' + expectedHeaders.join(', '));
                    setLoading(false);
                    setTimeout(() => setApiError(null), 5000);
                    return;
                }

                const newLocations = [];
                const errors = [];

                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i];
                    // Skip empty or invalid rows
                    if (!row || row.length < 6 || row.every(cell => !cell || cell.trim() === '')) {
                        console.log(`Skipping invalid or empty row ${i + 1}`);
                        continue;
                    }

                    const [name, street, city, postalCode, country, workType] = row.map(cell => cell ? cell.trim().replace(/^"|"$/g, '') : '');
                    console.log(`Processing row ${i + 1}:`, { name, street, city, postalCode, country, workType }); // Debug row data

                    // Validate required fields
                    if (!name || !street || !city || !workType) {
                        errors.push(`Row ${i + 1}: Missing required fields (name, street, city, work type)`);
                        console.log(`Validation failed for row ${i + 1}: Missing fields`);
                        continue;
                    }

                    // Validate workType (case-insensitive)
                    if (workType.toUpperCase() !== "SUPPORT WORKER") {
                        errors.push(`Row ${i + 1}: Invalid work type. Must be 'SUPPORT WORKER'`);
                        console.log(`Invalid workType for row ${i + 1}: ${workType}`);
                        continue;
                    }

                    const locationData = {
                        name,
                        address: {
                            street,
                            city,
                            postalCode: postalCode || '',
                            country: country || '',
                        },
                        workType: "SUPPORT WORKER",
                        isCustom: true,
                    };

                    try {
                        const res = await addLocation(locationData);
                        console.log(`API Response for row ${i + 1}:`, { status: res.status, data: res.data }); // Debug API response
                        if (res.status >= 200 && res.status < 300) {
                            newLocations.push({ ...res.data, _id: res.data._id || Date.now() });
                        } else {
                            errors.push(`Row ${i + 1}: Unexpected API response status ${res.status}`);
                        }
                    } catch (err) {
                        console.error(`Failed to add location at row ${i + 1}:`, {
                            message: err.message,
                            status: err.response?.status,
                            data: err.response?.data,
                        });
                        errors.push(`Row ${i + 1}: ${err.response?.data?.msg || 'Unknown error'}`);
                    }
                }

                // Update state based on results
                if (newLocations.length > 0) {
                    setLocations((prev) => [...prev, ...newLocations]);
                    let message = `Successfully imported ${newLocations.length} location(s)`;
                    if (errors.length > 0) {
                        message += `. ${errors.length} row(s) failed: ${errors.join('; ')}`;
                        setApiError(message);
                    } else {
                        setSuccessMessage(message);
                    }
                } else {
                    setApiError(errors.length > 0 ? `No locations imported. Errors: ${errors.join('; ')}` : 'No valid locations found in the CSV file.');
                }

                setLoading(false);
                fileInputRef.current.value = ''; // Reset file input
                setTimeout(() => {
                    setApiError(null);
                    setSuccessMessage("");
                }, 8000); // Extended timeout for longer error messages
            },
            error: (err) => {
                console.error('CSV Parsing Error:', err);
                setApiError('Failed to parse CSV file. Please ensure it is formatted correctly.');
                setLoading(false);
                setTimeout(() => setApiError(null), 5000);
            },
            header: false,
            skipEmptyLines: true,
        });
    };

    const isAuthorized = user && (user.role === "admin" || user.role === "manager");
    const isAdmin = user && user.role === "admin";

    return (
        <div className="flex flex-col h-screen bg-gray-100 font-sans">
            <div className="flex flex-1 flex-col md:flex-row">
                <div className="flex-1 px-4 py-4 md:px-10 md:py-6 bg-white overflow-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-0">Locations</h1>
                        {isAuthorized && isAdmin && (
                            <button
                                className="w-full md:w-auto bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center justify-center space-x-2 hover:bg-indigo-700 transition duration-200"
                                onClick={handleOpenModal}
                            >
                                <span className="text-xl">+</span>
                                <span>Add Location</span>
                            </button>
                        )}
                    </div>

                    {successMessage && (
                        <div
                            className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 text-sm"
                            role="alert"
                        >
                            <p className="font-bold">Success!</p>
                            <p>{successMessage}</p>
                        </div>
                    )}

                    {apiError && (
                        <div
                            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 text-sm"
                            role="alert"
                        >
                            <p className="font-bold">Error!</p>
                            <p>{apiError}</p>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row items-center justify-between mb-4 space-y-4 md:space-y-0">
                        <div className="relative w-full md:w-1/3">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="border border-gray-300 pl-10 pr-3 py-2 rounded-md w-full text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {isAdmin && (
                            <div className="flex items-center space-x-2 w-full md:w-auto">
                                <button
                                    className="p-2 border border-blue-500 bg-blue-50 text-blue-600 rounded-md w-full md:w-[120px] flex items-center justify-center hover:bg-blue-100 transition duration-200"
                                    onClick={async () => {
                                        const { jsPDF } = await import("jspdf");
                                        const autoTable = (await import("jspdf-autotable")).default;

                                        const doc = new jsPDF();
                                        const columns = [
                                            { header: "Location Name", dataKey: "name" },
                                            { header: "Street", dataKey: "street" },
                                            { header: "City", dataKey: "city" },
                                            { header: "Postal Code", dataKey: "postalCode" },
                                            { header: "Country", dataKey: "country" },
                                            { header: "Work Type", dataKey: "workType" },
                                        ];
                                        const rows = filteredLocations.map(loc => ({
                                            name: loc.name,
                                            street: loc.address?.street || "",
                                            city: loc.address?.city || "",
                                            postalCode: loc.address?.postalCode || "",
                                            country: loc.address?.country || "",
                                            workType: loc.workType || "",
                                        }));

                                        doc.text("Locations List", 14, 16);
                                        autoTable(doc, {
                                            startY: 22,
                                            head: [columns.map(col => col.header)],
                                            body: rows.map(row => columns.map(col => row[col.dataKey])),
                                            styles: { fontSize: 10 },
                                        });

                                        doc.save("locations.pdf");
                                    }}
                                >
                                    <span>
                                        <img src="/outbox.svg" alt="Export icon" className='w-[20px] mr-1'/>
                                    </span>
                                    <span className="font-medium">Export</span>
                                </button>
                                <div>
                                    <input
                                        type="file"
                                        accept=".csv"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleCSVUpload}
                                    />
                                    <button
                                        className="p-2 border border-blue-500 bg-blue-50 text-blue-600 rounded-md w-full md:w-[140px] flex items-center justify-center hover:bg-blue-100 transition duration-200"
                                        onClick={() => fileInputRef.current.click()}
                                    >
                                        <ArrowUpTrayIcon className="w-[20px] mr-1" />
                                        <span className="font-medium">Upload CSV</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <span className="text-sm text-gray-600 mb-4 block">
                        Showing {filteredLocations.length} Locations
                    </span>

                    <div className="hidden md:grid grid-cols-[2fr,3fr,1.5fr,1.5fr] gap-4 text-sm font-semibold text-gray-600 py-3 border-b border-gray-200">
                        <div>Location Name</div>
                        <div>Location Address</div>
                        <div>Areas</div>
                        {isAdmin && (
                            <div className="text-right">Actions</div>
                        )}
                    </div>

                    {loading && <p className="py-4 text-center text-gray-600">Loading locations...</p>}
                    {!loading && filteredLocations.length === 0 && (
                        <p className="py-4 text-center text-gray-600">No locations found.</p>
                    )}
                    {!loading &&
                        filteredLocations.map((loc) => (
                            <div
                                key={loc._id}
                                className="flex flex-col md:grid md:grid-cols-[2fr,3fr,1.5fr,1.5fr] gap-4 py-3 items-start md:items-center border-b border-gray-200 text-sm"
                            >
                                <div className="text-gray-900 font-medium">{loc.name}</div>
                                <div className="text-[#0034AD] flex items-center mt-2 md:mt-0">
                                    <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                                    <span className="">
                                        {loc.address?.street}, {loc.address?.city}, {loc.address?.postalCode}, {loc.address?.country}
                                    </span>
                                </div>
                                <div className="text-gray-700 mt-2 md:mt-0">{loc.workType}</div>
                                <div className="flex justify-start md:justify-end w-full mt-3 md:mt-0">
                                    {isAuthorized && isAdmin && (
                                        <button
                                            className="inline-flex justify-center w-full md:w-auto rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            onClick={() => handleEditLocation(loc)}
                                        >
                                            Edit Settings
                                            <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                </div>

                <div className="w-full md:w-72 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-200 px-4 py-4 md:px-5 md:py-6 shadow-md flex-shrink-0">
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">Teams</h2>
                        <select
                            className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                        >
                            <option value="">All Locations</option>
                            {locations.map((loc) => (
                                <option key={loc._id} value={loc.name}>
                                    {loc.name}
                                </option>
                            ))}
                        </select>
                        <div className="mt-6 md:mt-10 text-sm text-gray-700">
                            {scheduledWorkers.length > 0 ? (
                                <>
                                    <p className="font-semibold mb-2">
                                        Scheduled Workers at {selectedLocation || "All Locations"}:
                                    </p>
                                    <ul className="list-none list-inside space-y-1">
                                        {scheduledWorkers.map((worker, index) => (
                                            <li key={index} className="pt-[10px]">{worker}</li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <p className="text-gray-500">
                                    No workers are currently scheduled at{" "}
                                    {selectedLocation || "any locations"}.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {(isModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm md:max-w-md p-6 md:p-8 transform transition-all duration-300 ease-out scale-95 opacity-0 animate-scale-in">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6 text-center">
                            {isEditModalOpen ? 'Edit Location' : 'Add New Location'}
                        </h2>

                        {formError && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">
                                <strong className="font-bold">Error: </strong>
                                <span className="block sm:inline">{formError}</span>
                            </div>
                        )}
                        {apiError && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">
                                <strong className="font-bold">Error: </strong>
                                <span className="block sm:inline">{apiError}</span>
                            </div>
                        )}

                        <form onSubmit={handleFormSubmit} className="space-y-4 md:space-y-5">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Location Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
                                    placeholder="e.g., Central Office"
                                    required
                                />
                            </div>

                            <div className="space-y-3 md:space-y-4 pt-2">
                                <label className="block text-base md:text-lg font-semibold text-gray-800 border-b pb-2 mb-3">
                                    Location Address
                                </label>
                                <div>
                                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                                        Street
                                    </label>
                                    <input
                                        type="text"
                                        id="street"
                                        name="street"
                                        value={form.street}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
                                        placeholder="e.g., 123 Main Street"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            value={form.city}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
                                            placeholder="e.g., London"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                                            Postal Code
                                        </label>
                                        <input
                                            type="text"
                                            id="postalCode"
                                            name="postalCode"
                                            value={form.postalCode}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
                                            placeholder="e.g., SW1A 1AA"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        id="country"
                                        name="country"
                                        value={form.country}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
                                        placeholder="e.g., United Kingdom"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="workType" className="block text-sm font-medium text-gray-700 mb-1">
                                    Work Type
                                </label>
                                <select
                                    id="workType"
                                    name="workType"
                                    value={form.workType}
                                    onChange={handleFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
                                    required
                                >
                                    <option value="">Select a Work Type</option>
                                    <option value="SUPPORT WORKER">SUPPORT WORKER</option>
                                </select>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4 md:pt-6">
                                {isEditModalOpen && (
                                    <button
                                        type="button"
                                        onClick={handleDeleteLocation}
                                        className="px-4 py-2 border bg-red-600 border-gray-300 rounded-lg text-white hover:bg-red-700 transition duration-200 text-base font-medium"
                                        disabled={loading}
                                    >
                                        Delete
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200 text-base font-medium"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 text-base font-medium shadow-md flex items-center justify-center"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        isEditModalOpen ? 'Update Location' : 'Add Location'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm md:max-w-md p-6 md:p-8 transform transition-all duration-300 ease-out scale-95 opacity-0 animate-scale-in">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6 text-center">
                            Confirm Deletion
                        </h2>
                        <p className="text-sm text-gray-700 mb-6 text-center">
                            Are you sure you want to delete the location "{editLocation?.name}"? This action cannot be undone.
                        </p>
                        {apiError && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">
                                <strong className="font-bold">Error: </strong>
                                <span className="block sm:inline">{apiError}</span>
                            </div>
                        )}
                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200 text-base font-medium"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteLocation}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 text-base font-medium flex items-center justify-center"
                                disabled={loading}
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    'Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}