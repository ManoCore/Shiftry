
// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { updateUserProfile, fetchAllLeaveApplications, updateLeaveApplicationStatus } from '../api';
// import { useAuth } from '../context/AuthContext';
// import {
//   FaUser,
//   FaEnvelope,
//   FaCamera,
//   FaHome,
//   FaHeart,
//   FaShareAlt,
//   FaCalendarAlt,
//   FaBars,
//   FaTimes,
// } from 'react-icons/fa';

// const Spinner = () => (
//   <div className="flex justify-center items-center h-full">
//     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
//   </div>
// );

// export default function AdminProfilePage() {
//   const navigate = useNavigate();
//   const { user, isLoading, fetchUser } = useAuth();
//   const [activeSection, setActiveSection] = useState('profile');
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar
//   const [profileData, setProfileData] = useState({
//     firstName: '',
//     lastName: '',
//     preferredFullName: '',
//     emailId: '',
//     phoneNumber: '',
//     dateOfBirth: '',
//     gender: '',
//     pronouns: '',
//     profilePicture: null,
//   });
//   const [addressData, setAddressData] = useState({
//     addressLine1: '',
//     addressLine2: '',
//     city: '',
//     state: '',
//     postcode: '',
//     country: '',
//   });
//   const [emergencyContactData, setEmergencyContactData] = useState({
//     contactName: '',
//     contactRelationship: '',
//     contactPhone: '',
//   });
//   const [socialData, setSocialData] = useState({
//     facebook: '',
//     twitter: '',
//     linkedin: '',
//   });
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');
//   const [isUpdating, setIsUpdating] = useState(false);
//   const fileInputRef = useRef(null);
//   const [leaveApplications, setLeaveApplications] = useState([]);
//   const [isLoadingLeaves, setIsLoadingLeaves] = useState(true);
//   const [leaveError, setLeaveError] = useState('');
//   const [leaveStatusMessage, setLeaveStatusMessage] = useState('');

//   useEffect(() => {
//     if (user) {
//       setProfileData({
//         firstName: user.firstName || '',
//         lastName: user.lastName || '',
//         preferredFullName: user.preferredFullName || '',
//         emailId: user.emailId || '',
//         phoneNumber: user.phoneNumber || '',
//         dateOfBirth: user.dateOfBirth ? formatDateForInput(user.dateOfBirth) : '',
//         gender: user.gender || '',
//         pronouns: user.pronouns || '',
//         profilePicture: user.profilePicture || null,
//       });
//       setAddressData(user.address || { addressLine1: '', addressLine2: '', city: '', state: '', postcode: '', country: '' });
//       setEmergencyContactData(user.emergencyContact || { contactName: '', contactRelationship: '', contactPhone: '' });
//       setSocialData(user.social || { facebook: '', twitter: '', linkedin: '' });
//     }
//   }, [user]);

//   useEffect(() => {
//     if (activeSection === 'leaves' && user && user.role === 'admin') {
//       getAllLeaveApplications();
//     }
//   }, [activeSection, user]);

//   if (isLoading) {
//     return (
//       <div className="h-screen flex items-center justify-center bg-gray-100">
//         <Spinner />
//         <p className="ml-3 text-base md:text-lg text-gray-700">Loading profile...</p>
//       </div>
//     );
//   }

//   if (!user || (user.role !== 'admin' && user.role !== 'employee')) {
//     if (window.location.pathname !== '/login') {
//       navigate('/login');
//     }
//     return null;
//   }

//   const handleProfileInputChange = (e) => {
//     const { name, value } = e.target;
//     setProfileData((prevData) => ({ ...prevData, [name]: value }));
//   };

//   const handleAddressInputChange = (e) => {
//     const { name, value } = e.target;
//     setAddressData((prevData) => ({ ...prevData, [name]: value }));
//   };

//   const handleEmergencyContactInputChange = (e) => {
//     const { name, value } = e.target;
//     setEmergencyContactData((prevData) => ({ ...prevData, [name]: value }));
//   };

//   const handleSocialInputChange = (e) => {
//     const { name, value } = e.target;
//     setSocialData((prevData) => ({ ...prevData, [name]: value }));
//   };

//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       if (file.size > 5 * 1024 * 1024) {
//         setError('File size exceeds 5MB limit.');
//         setSelectedFile(null);
//         if (fileInputRef.current) fileInputRef.current.value = '';
//         return;
//       }
//       const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
//       if (!acceptedImageTypes.includes(file.type)) {
//         setError('Only image files (JPG, PNG, GIF) are allowed.');
//         setSelectedFile(null);
//         if (fileInputRef.current) fileInputRef.current.value = '';
//         return;
//       }
//       setSelectedFile(file);
//       setError('');
//     } else {
//       setSelectedFile(null);
//       setError('');
//     }
//   };

//   const handleSubmit = async (event, sectionType) => {
//     event.preventDefault();
//     setIsUpdating(true);
//     setMessage('');
//     setError('');

//     try {
//       let response;
//       const formData = new FormData();

//       switch (sectionType) {
//         case 'profile':
//           if (!profileData.firstName || !profileData.lastName) {
//             throw new Error('First Name and Last Name are required.');
//           }
//           formData.append('firstName', profileData.firstName);
//           formData.append('lastName', profileData.lastName);
//           if (user.role === 'admin') {
//             formData.append('preferredFullName', profileData.preferredFullName || '');
//             formData.append('phoneNumber', profileData.phoneNumber || '');
//             formData.append('dateOfBirth', profileData.dateOfBirth || '');
//             formData.append('gender', profileData.gender || '');
//             formData.append('pronouns', profileData.pronouns || '');
//           }
//           response = await updateUserProfile(formData);
//           break;

//         case 'profile-photo':
//           if (!selectedFile) {
//             throw new Error('Please select a file to upload.');
//           }
//           formData.append('profilePicture', selectedFile);
//           formData.append('firstName', user.firstName);
//           formData.append('lastName', user.lastName);
//           response = await updateUserProfile(formData);
//           break;

//         case 'address':
//           if (!addressData.addressLine1 || !addressData.city || !addressData.country || !addressData.postcode) {
//             throw new Error('Address Line 1, City, Country, and Postcode are required.');
//           }
//           Object.keys(addressData).forEach(key => {
//             formData.append(`address.${key}`, addressData[key]);
//           });
//           formData.append('firstName', user.firstName);
//           formData.append('lastName', user.lastName);
//           response = await updateUserProfile(formData);
//           break;

//         case 'emergency-contact':
//           if (!emergencyContactData.contactName || !emergencyContactData.contactPhone) {
//             throw new Error('Emergency Contact Name and Phone are required.');
//           }
//           Object.keys(emergencyContactData).forEach(key => {
//             formData.append(`emergencyContact.${key}`, emergencyContactData[key]);
//           });
//           formData.append('firstName', user.firstName);
//           formData.append('lastName', user.lastName);
//           response = await updateUserProfile(formData);
//           break;

//         case 'social':
//           Object.keys(socialData).forEach(key => {
//             formData.append(`social.${key}`, socialData[key]);
//           });
//           formData.append('firstName', user.firstName);
//           formData.append('lastName', user.lastName);
//           response = await updateUserProfile(formData);
//           break;

//         default:
//           throw new Error('Invalid section for update.');
//       }

//       setIsUpdating(false);
//       setMessage(response.data.message || `${sectionType} updated successfully!`);

//       if (typeof fetchUser === 'function') {
//         await fetchUser();
//       } else {
//         console.warn("Auth context's fetchUser function is not available or is not a function.");
//       }

//       if (sectionType === 'profile-photo') {
//         setSelectedFile(null);
//         if (fileInputRef.current) fileInputRef.current.value = '';
//       }

//     } catch (err) {
//       setIsUpdating(false);
//       const errMsg = err.response?.data?.message || err.message || 'Network error or server unavailable.';
//       setError(errMsg);
//       console.error(`${sectionType} update error:`, err);
//     }
//   };

//   const getAllLeaveApplications = async () => {
//     setIsLoadingLeaves(true);
//     setLeaveError('');
//     try {
//       const response = await fetchAllLeaveApplications();
//       const applicationsData = response.data.data;

//       if (Array.isArray(applicationsData)) {
//         setLeaveApplications(applicationsData);
//       } else {
//         console.error('API response for all leave applications was not an array:', applicationsData);
//         setLeaveApplications([]);
//         setLeaveError('Unexpected data format received for leave applications.');
//       }
//     } catch (err) {
//       console.error('Error fetching all leave applications:', err);
//       setLeaveError(err.response?.data?.message || 'Failed to load leave applications.');
//       setLeaveApplications([]);
//     } finally {
//       setIsLoadingLeaves(false);
//     }
//   };

//   const handleLeaveStatusUpdate = async (id, newStatus) => {
//     setLeaveStatusMessage('');
//     try {
//       const response = await updateLeaveApplicationStatus(id, newStatus);
//       setLeaveStatusMessage(response.message);
//       getAllLeaveApplications();
//     } catch (err) {
//       console.error('Error updating leave status:', err);
//       setLeaveStatusMessage(err.response?.data?.message || 'Failed to update leave status.');
//     }
//   };

//   const defaultProfilePicture = 'https://placehold.co/128x128/aabbcc/ffffff?text=User';

//   const profileNavItems = [
//     { id: 'profile', name: 'Profile', required: true, icon: <FaUser className="mr-2" /> },
//     { id: 'profile-photo', name: 'Profile Photo', required: false, icon: <FaCamera className="mr-2" /> },
//     { id: 'address', name: 'Address', required: true, icon: <FaHome className="mr-2" /> },
//     { id: 'emergency-contact', name: 'Emergency Contact', required: true, icon: <FaHeart className="mr-2" /> },
//     { id: 'social', name: 'Social', required: false, icon: <FaShareAlt className="mr-2" /> },
//     ...(user && user.role === 'admin' ? [{ id: 'leaves', name: 'Leaves', required: false, icon: <FaCalendarAlt className="mr-2" /> }] : []),
//   ];

//   const formatDateForInput = (dateString) => {
//     if (!dateString) return '';
//     try {
//       const date = new Date(dateString);
//       if (isNaN(date.getTime())) {
//         console.warn('Invalid date string provided to formatDateForInput:', dateString);
//         return '';
//       }
//       return date.toISOString().split('T')[0];
//     } catch (e) {
//       console.error('Error formatting date:', e);
//       return '';
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex font-inter">
//       {/* Mobile Menu Button */}
//       <button
//         className="md:hidden top-4 left-4 z-50 p-2 bg-gray-100 h-[35px] text-black rounded-md"
//         onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//       >
//         {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
//       </button>

//       <aside
//         className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg p-4 transform transition-transform duration-300 ease-in-out z-40
//           mt-[65px] pt-[50px] md:mt-0
//           ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:w-64 md:p-6`}
//       >
//         <div className="mb-6 md:mb-8">
//           <h2 className="text-xl md:text-2xl font-bold text-gray-800">Profile Settings</h2>
//         </div>
//         <nav>
//           <ul className="space-y-2">
//             {profileNavItems.map((item) => (
//               <li key={item.id}>
//                 <button
//                   onClick={() => {
//                     setActiveSection(item.id);
//                     setIsSidebarOpen(false); // Close sidebar on item click for mobile
//                   }}
//                   className={`w-full text-left p-2 md:p-3 rounded-lg transition-all duration-200 flex items-center justify-between text-sm md:text-base
//                     ${activeSection === item.id
//                       ? 'bg-blue-100 text-blue-800 font-bold shadow-sm'
//                       : 'hover:bg-gray-100 text-gray-600'
//                     }`}
//                 >
//                   <div className="flex items-center">
//                     {item.icon}
//                     {item.name}
//                   </div>
//                   {item.required && (
//                     <span className="text-red-500 text-xs">*</span>
//                   )}
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </nav>
//       </aside>

//       {/* Overlay for mobile sidebar */}
//       {isSidebarOpen && (
//         <div
//           className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
//           onClick={() => setIsSidebarOpen(false)}
//         ></div>
//       )}

//       <main className="flex-1 p-4 max-w-[1280px] md:p-6">
//         <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-6">
//           {/* User Info Header */}
//           <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-4 md:mb-6 pb-4 border-b border-gray-200">
//             <img
//               src={user.profilePicture || defaultProfilePicture}
//               alt="Profile"
//               className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-blue-300"
//               onError={(e) => {
//                 e.target.onerror = null;
//                 e.target.src = defaultProfilePicture;
//               }}
//             />
//             <div className="text-center md:text-left">
//               <p className="text-base md:text-lg font-bold text-gray-800">
//                 {user.firstName} {user.lastName}
//               </p>
//               <p className="text-sm text-gray-600 flex items-center justify-center md:justify-start mt-1">
//                 <FaEnvelope className="mr-2 text-gray-500" />
//                 {user.emailId}
//               </p>
//               <p className="text-sm text-gray-600 mt-1">Role: {user.role}</p>
//             </div>
//           </div>

//           {/* Profile Details Content */}
//           <div className="flex-grow bg-gray-50 p-4 md:p-6 rounded-lg shadow-inner">
//             {message && (
//               <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 md:px-4 md:py-3 rounded relative mb-4 text-sm md:text-base" role="alert">
//                 <span className="block sm:inline">{message}</span>
//               </div>
//             )}
//             {error && (
//               <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 md:px-4 md:py-3 rounded relative mb-4 text-sm md:text-base" role="alert">
//                 <span className="block sm:inline">{error}</span>
//               </div>
//             )}

//             {activeSection === 'profile' && (
//               <form onSubmit={(e) => handleSubmit(e, 'profile')} className="space-y-6">
//                 <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">User Profile</h3>
//                 {user.role === 'admin' ? (
//                   <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
//                     <div>
//                       <label htmlFor="preferredFullName" className="block text-sm font-medium text-gray-700">
//                         Preferred full name (optional)
//                       </label>
//                       <p className="mt-1 text-xs md:text-sm text-gray-500">Set your preferred full name to be shown in Shiftry</p>
//                       <input
//                         type="text"
//                         name="preferredFullName"
//                         id="preferredFullName"
//                         value={profileData.preferredFullName}
//                         onChange={handleProfileInputChange}
//                         className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
//                       />
//                     </div>
//                     <div></div>
//                     <div>
//                       <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
//                         First Name *
//                       </label>
//                       <input
//                         type="text"
//                         name="firstName"
//                         id="firstName"
//                         value={profileData.firstName}
//                         onChange={handleProfileInputChange}
//                         required
//                         className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
//                       />
//                     </div>
//                     <div>
//                       <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
//                         Last Name *
//                       </label>
//                       <input
//                         type="text"
//                         name="lastName"
//                         id="lastName"
//                         value={profileData.lastName}
//                         onChange={handleProfileInputChange}
//                         required
//                         className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
//                       />
//                     </div>
//                     <div>
//                       <label htmlFor="emailId" className="block text-sm font-medium text-gray-700">
//                         Email address
//                       </label>
//                       <div className="mt-1 flex rounded-md shadow-sm">
//                         <input
//                           type="email"
//                           name="emailId"
//                           id="emailId"
//                           value={profileData.emailId}
//                           readOnly
//                           className="flex-1 block w-full p-2 border border-gray-300 rounded-l-md bg-gray-50 cursor-not-allowed text-sm"
//                         />
//                         <button
//                           type="button"
//                           className="inline-flex items-center px-2 md:px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-700 text-xs md:text-sm hover:bg-gray-100"
//                           onClick={() => alert('Email update typically requires re-verification. This would be a separate flow.')}
//                         >
//                           Update
//                         </button>
//                       </div>
//                     </div>
//                     <div>
//                       <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
//                         Phone number
//                       </label>
//                       <div className="mt-1 flex rounded-md shadow-sm">
//                         <input
//                           type="tel"
//                           name="phoneNumber"
//                           id="phoneNumber"
//                           value={profileData.phoneNumber}
//                           onChange={handleProfileInputChange}
//                           className="flex-1 block w-full p-2 border border-gray-300 rounded-l-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
//                         />
//                         <button
//                           type="button"
//                           className="inline-flex items-center px-2 md:px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-700 text-xs md:text-sm hover:bg-gray-100"
//                           onClick={() => alert('Phone number update might require verification in a real application.')}
//                         >
//                           Update
//                         </button>
//                       </div>
//                     </div>
//                     <div>
//                       <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
//                         Date of birth
//                       </label>
//                       <input
//                         type="date"
//                         name="dateOfBirth"
//                         id="dateOfBirth"
//                         value={profileData.dateOfBirth}
//                         onChange={handleProfileInputChange}
//                         className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
//                       />
//                     </div>
//                     <div>
//                       <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
//                         Gender (optional)
//                       </label>
//                       <select
//                         name="gender"
//                         id="gender"
//                         value={profileData.gender}
//                         onChange={handleProfileInputChange}
//                         className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
//                       >
//                         <option value="">Not specified</option>
//                         <option value="Male">Male</option>
//                         <option value="Female">Female</option>
//                         <option value="Other">Other</option>
//                       </select>
//                       <p className="mt-1 text-xs md:text-sm text-gray-500">
//                         By default, we won't show this on your employee profile unless your business chooses to.
//                       </p>
//                     </div>
//                     <div>
//                       <label htmlFor="pronouns" className="block text-sm font-medium text-gray-700">
//                         Pronouns (optional)
//                       </label>
//                       <select
//                         name="pronouns"
//                         id="pronouns"
//                         value={profileData.pronouns}
//                         onChange={handleProfileInputChange}
//                         className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
//                       >
//                         <option value="">Not specified</option>
//                         <option value="He/Him">He/Him</option>
//                         <option value="She/Her">She/Her</option>
//                         <option value="They/Them">They/Them</option>
//                         <option value="Prefer not to say">Prefer not to say</option>
//                       </select>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
//                     <div>
//                       <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
//                         First Name *
//                       </label>
//                       <input
//                         type="text"
//                         name="firstName"
//                         id="firstName"
//                         value={profileData.firstName}
//                         onChange={handleProfileInputChange}
//                         required
//                         className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
//                       />
//                     </div>
//                     <div>
//                       <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
//                         Last Name *
//                       </label>
//                       <input
//                         type="text"
//                         name="lastName"
//                         id="lastName"
//                         value={profileData.lastName}
//                         onChange={handleProfileInputChange}
//                         required
//                         className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
//                       />
//                     </div>
//                     <div>
//                       <label htmlFor="emailId" className="block text-sm font-medium text-gray-700">
//                         Email address
//                       </label>
//                       <input
//                         type="email"
//                         name="emailId"
//                         id="emailId"
//                         value={profileData.emailId}
//                         readOnly
//                         className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed text-sm"
//                       />
//                     </div>
//                   </div>
//                 )}
//                 <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-6">
//                   <button
//                     type="submit"
//                     className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full md:w-auto"
//                     disabled={isUpdating}
//                   >
//                     {isUpdating && <Spinner />}
//                     {isUpdating ? 'Updating...' : 'Update Profile'}
//                   </button>
//                 </div>
//               </form>
//             )}

//             {activeSection === 'profile-photo' && (
//               <form onSubmit={(e) => handleSubmit(e, 'profile-photo')} className="space-y-6">
//                 <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Profile Photo</h3>
//                 <div className="flex justify-center mb-6">
//                   <img
//                     src={user.profilePicture || defaultProfilePicture}
//                     alt="Current Profile"
//                     className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-2 border-blue-300"
//                     onError={(e) => {
//                       e.target.onerror = null;
//                       e.target.src = defaultProfilePicture;
//                     }}
//                   />
//                 </div>
//                 <div>
//                   <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">
//                     Upload New Profile Picture (Max 5MB, Images Only)
//                   </label>
//                   <input
//                     type="file"
//                     name="profilePicture"
//                     id="profilePicture"
//                     accept="image/jpeg,image/png,image/gif"
//                     onChange={handleFileChange}
//                     ref={fileInputRef}
//                     className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none"
//                   />
//                   {selectedFile && <p className="mt-2 text-xs md:text-sm text-gray-500">Selected file: {selectedFile.name}</p>}
//                 </div>
//                 <div className="flex justify-end pt-4 border-t border-gray-200 mt-6">
//                   <button
//                     type="submit"
//                     className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full md:w-auto"
//                     disabled={isUpdating || !selectedFile}
//                   >
//                     {isUpdating && <Spinner />}
//                     {isUpdating ? 'Uploading...' : 'Update Photo'}
//                   </button>
//                 </div>
//               </form>
//             )}

//             {activeSection === 'address' && (
//               <form onSubmit={(e) => handleSubmit(e, 'address')} className="space-y-6">
//                 <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Address Details</h3>
//                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
//                   <div>
//                     <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">
//                       Address Line 1 *
//                     </label>
//                     <input
//                       type="text"
//                       name="addressLine1"
//                       id="addressLine1"
//                       value={addressData.addressLine1}
//                       onChange={handleAddressInputChange}
//                       required
//                       className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">
//                       Address Line 2 (optional)
//                     </label>
//                     <input
//                       type="text"
//                       name="addressLine2"
//                       id="addressLine2"
//                       value={addressData.addressLine2}
//                       onChange={handleAddressInputChange}
//                       className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="city" className="block text-sm font-medium text-gray-700">
//                       City *
//                     </label>
//                     <input
//                       type="text"
//                       name="city"
//                       id="city"
//                       value={addressData.city}
//                       onChange={handleAddressInputChange}
//                       required
//                       className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="state" className="block text-sm font-medium text-gray-700">
//                       State/Province (optional)
//                     </label>
//                     <input
//                       type="text"
//                       name="state"
//                       id="state"
//                       value={addressData.state}
//                       onChange={handleAddressInputChange}
//                       className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="postcode" className="block text-sm font-medium text-gray-700">
//                       Postcode *
//                     </label>
//                     <input
//                       type="text"
//                       name="postcode"
//                       id="postcode"
//                       value={addressData.postcode}
//                       onChange={handleAddressInputChange}
//                       required
//                       className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="country" className="block text-sm font-medium text-gray-700">
//                       Country *
//                     </label>
//                     <select
//                       name="country"
//                       id="country"
//                       value={addressData.country}
//                       onChange={handleAddressInputChange}
//                       required
//                       className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
//                     >
//                       <option value="">Select Country</option>
//                       <option value="USA">United States</option>
//                       <option value="CAN">Canada</option>
//                       <option value="GBR">United Kingdom</option>
//                       <option value="AUS">Australia</option>
//                       <option value="IND">India</option>
//                     </select>
//                   </div>
//                 </div>
//                 <div className="flex justify-end pt-4 border-t border-gray-200 mt-6">
//                   <button
//                     type="submit"
//                     className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full md:w-auto"
//                     disabled={isUpdating}
//                   >
//                     {isUpdating && <Spinner />}
//                     {isUpdating ? 'Updating...' : 'Update Address'}
//                   </button>
//                 </div>
//               </form>
//             )}

//             {activeSection === 'emergency-contact' && (
//               <form onSubmit={(e) => handleSubmit(e, 'emergency-contact')} className="space-y-6">
//                 <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Emergency Contact</h3>
//                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
//                   <div>
//                     <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
//                       Contact Name *
//                     </label>
//                     <input
//                       type="text"
//                       name="contactName"
//                       id="contactName"
//                       value={emergencyContactData.contactName}
//                       onChange={handleEmergencyContactInputChange}
//                       required
//                       className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="contactRelationship" className="block text-sm font-medium text-gray-700">
//                       Relationship (optional)
//                     </label>
//                     <input
//                       type="text"
//                       name="contactRelationship"
//                       id="contactRelationship"
//                       value={emergencyContactData.contactRelationship}
//                       onChange={handleEmergencyContactInputChange}
//                       className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
//                       Contact Phone *
//                     </label>
//                     <input
//                       type="tel"
//                       name="contactPhone"
//                       id="contactPhone"
//                       value={emergencyContactData.contactPhone}
//                       onChange={handleEmergencyContactInputChange}
//                       required
//                       className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
//                     />
//                   </div>
//                 </div>
//                 <div className="flex justify-end pt-4 border-t border-gray-200 mt-6">
//                   <button
//                     type="submit"
//                     className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full md:w-auto"
//                     disabled={isUpdating}
//                   >
//                     {isUpdating && <Spinner />}
//                     {isUpdating ? 'Updating...' : 'Update Emergency Contact'}
//                   </button>
//                 </div>
//               </form>
//             )}

//             {activeSection === 'social' && (
//               <form onSubmit={(e) => handleSubmit(e, 'social')} className="space-y-6">
//                 <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Social Links</h3>
//                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
//                   <div>
//                     <label htmlFor="facebook" className="block text-sm font-medium text-gray-700">
//                       Facebook URL (optional)
//                     </label>
//                     <input
//                       type="url"
//                       name="facebook"
//                       id="facebook"
//                       value={socialData.facebook}
//                       onChange={handleSocialInputChange}
//                       placeholder="https://facebook.com/yourprofile"
//                       className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="twitter" className="block text-sm font-medium text-gray-700">
//                       Twitter URL (optional)
//                     </label>
//                     <input
//                       type="url"
//                       name="twitter"
//                       id="twitter"
//                       value={socialData.twitter}
//                       onChange={handleSocialInputChange}
//                       placeholder="https://twitter.com/yourprofile"
//                       className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
//                       LinkedIn URL (optional)
//                     </label>
//                     <input
//                       type="url"
//                       name="linkedin"
//                       id="linkedin"
//                       value={socialData.linkedin}
//                       onChange={handleSocialInputChange}
//                       placeholder="https://linkedin.com/in/yourprofile"
//                       className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
//                     />
//                   </div>
//                 </div>
//                 <div className="flex justify-end pt-4 border-t border-gray-200 mt-6">
//                   <button
//                     type="submit"
//                     className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full md:w-auto"
//                     disabled={isUpdating}
//                   >
//                     {isUpdating && <Spinner />}
//                     {isUpdating ? 'Updating...' : 'Update Social Links'}
//                   </button>
//                 </div>
//               </form>
//             )}

//             {activeSection === 'leaves' && user && user.role === 'admin' && (
//               <div className="space-y-6 w-auto max-w-[1280px]">
//                 <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">All Leave Applications</h3>
//                 {leaveStatusMessage && (
//                   <div className={`mb-4 p-3 rounded-lg text-center text-sm md:text-base ${leaveStatusMessage.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//                     {leaveStatusMessage}
//                   </div>
//                 )}
//                 {isLoadingLeaves ? (
//                   <p className="text-center text-gray-600 text-sm md:text-base">Loading all leave applications...</p>
//                 ) : leaveError ? (
//                   <p className="text-center text-red-600 text-sm md:text-base">{leaveError}</p>
//                 ) : leaveApplications.length === 0 ? (
//                   <p className="text-center text-gray-600 text-sm md:text-base">No leave applications to display.</p>
//                 ) : (
//                   <>
//                     {/* Mobile Card Layout */}
//                     <div className="sm:hidden space-y-4">
//                       {leaveApplications.map((app) => (
//                         <div key={app._id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
//                           <div className="space-y-2">
//                             <div>
//                               <span className="text-xs font-medium text-gray-500 uppercase">Applicant</span>
//                               <p className="text-sm font-medium text-gray-900">
//                                 {app.user ? `${app.user.firstName || ''} ${app.user.lastName || ''}`.trim() || app.user.emailId : 'N/A'}
//                               </p>
//                             </div>
//                             <div>
//                               <span className="text-xs font-medium text-gray-500 uppercase">Reason</span>
//                               <p className="text-sm text-gray-700">{app.leaveReason}</p>
//                             </div>
//                             <div>
//                               <span className="text-xs font-medium text-gray-500 uppercase">Dates</span>
//                               <p className="text-sm text-gray-700">
//                                 {new Date(app.fromDate).toLocaleDateString('en-GB')} - {new Date(app.toDate).toLocaleDateString('en-GB')}
//                               </p>
//                             </div>
//                             <div>
//                               <span className="text-xs font-medium text-gray-500 uppercase">Type</span>
//                               <p className="text-sm text-gray-700">{app.leaveType}</p>
//                             </div>
//                             <div>
//                               <span className="text-xs font-medium text-gray-500 uppercase">Description</span>
//                               <p className="text-sm text-gray-700 max-w-[250px] truncate">{app.description || 'N/A'}</p>
//                             </div>
//                             <div>
//                               <span className="text-xs font-medium text-gray-500 uppercase">Status</span>
//                               <p>
//                                 <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
//                                   ${app.status === 'Approved' ? 'bg-green-100 text-green-800' : ''}
//                                   ${app.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
//                                   ${app.status === 'Rejected' ? 'bg-red-100 text-red-800' : ''}
//                                   ${app.status === 'Cancelled' ? 'bg-gray-100 text-gray-800' : ''}`}>
//                                   {app.status}
//                                 </span>
//                               </p>
//                             </div>
//                             <div>
//                               <span className="text-xs font-medium text-gray-500 uppercase">Applied On</span>
//                               <p className="text-sm text-gray-700">{new Date(app.appliedAt).toLocaleDateString('en-GB')}</p>
//                             </div>
//                             <div>
//                               <span className="text-xs font-medium text-gray-500 uppercase">Actions</span>
//                               <div className="flex flex-col gap-2 mt-2">
//                                 {app.status === 'Pending' && (
//                                   <div className="flex gap-2">
//                                     <button
//                                       onClick={() => handleLeaveStatusUpdate(app._id, 'Approved')}
//                                       className="text-green-600 hover:text-green-900 px-2 py-1 rounded-md border border-green-600 hover:border-green-900 transition-colors duration-200 text-xs w-full"
//                                     >
//                                       Approve
//                                     </button>
//                                     <button
//                                       onClick={() => handleLeaveStatusUpdate(app._id, 'Rejected')}
//                                       className="text-red-600 hover:text-red-900 px-2 py-1 rounded-md border border-red-600 hover:border-red-900 transition-colors duration-200 text-xs w-full"
//                                     >
//                                       Reject
//                                     </button>
//                                   </div>
//                                 )}
//                                 {(app.status === 'Approved' || app.status === 'Pending') && (
//                                   <button
//                                     onClick={() => handleLeaveStatusUpdate(app._id, 'Cancelled')}
//                                     className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md border border-gray-600 hover:border-gray-900 transition-colors duration-200 text-xs w-full"
//                                   >
//                                     Cancel
//                                   </button>
//                                 )}
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>

//                     {/* Desktop Table Layout */}
//                     <div className="hidden sm:block overflow-x-auto bg-white rounded-lg shadow-xl max-w-full">
//                       <table className="min-w-full divide-y divide-gray-200">
//                         <thead className="bg-gray-50">
//                           <tr>
//                             <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                               Applicant
//                             </th>
//                             <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                               Reason
//                             </th>
//                             <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                               Dates
//                             </th>
//                             <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                               Type
//                             </th>
//                             <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                               Description
//                             </th>
//                             <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                               Status
//                             </th>
//                             <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                               Applied On
//                             </th>
//                             <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                               Actions
//                             </th>
//                           </tr>
//                         </thead>
//                         <tbody className="bg-white divide-y divide-gray-200">
//                           {leaveApplications.map((app) => (
//                             <tr key={app._id}>
//                               <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                                 {app.user ? `${app.user.firstName || ''} ${app.user.lastName || ''}`.trim() || app.user.emailId : 'N/A'}
//                               </td>
//                               <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-700">
//                                 {app.leaveReason}
//                               </td>
//                               <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-700">
//                                 {new Date(app.fromDate).toLocaleDateString('en-GB')} - {new Date(app.toDate).toLocaleDateString('en-GB')}
//                               </td>
//                               <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-700">
//                                 {app.leaveType}
//                               </td>
//                               <td className="px-4 py-3 md:px-6 md:py-4 whitespace-normal text-sm text-gray-700 max-w-xs overflow-hidden text-ellipsis">
//                                 {app.description || 'N/A'}
//                               </td>
//                               <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap">
//                                 <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
//                                   ${app.status === 'Approved' ? 'bg-green-100 text-green-800' : ''}
//                                   ${app.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
//                                   ${app.status === 'Rejected' ? 'bg-red-100 text-red-800' : ''}
//                                   ${app.status === 'Cancelled' ? 'bg-gray-100 text-gray-800' : ''}`}>
//                                   {app.status}
//                                 </span>
//                               </td>
//                               <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-500">
//                                 {new Date(app.appliedAt).toLocaleDateString('en-GB')}
//                               </td>
//                               <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-right text-sm font-medium">
//                                 {app.status === 'Pending' && (
//                                   <div className="flex flex-col md:flex-row gap-2">
//                                     <button
//                                       onClick={() => handleLeaveStatusUpdate(app._id, 'Approved')}
//                                       className="text-green-600 hover:text-green-900 px-2 py-1 md:px-3 md:py-1 rounded-md border border-green-600 hover:border-green-900 transition-colors duration-200 text-xs md:text-sm"
//                                     >
//                                       Approve
//                                     </button>
//                                     <button
//                                       onClick={() => handleLeaveStatusUpdate(app._id, 'Rejected')}
//                                       className="text-red-600 hover:text-red-900 px-2 py-1 md:px-3 md:py-1 rounded-md border border-red-600 hover:border-red-900 transition-colors duration-200 text-xs md:text-sm"
//                                     >
//                                       Reject
//                                     </button>
//                                   </div>
//                                 )}
//                                 {(app.status === 'Approved' || app.status === 'Pending') && (
//                                   <button
//                                     onClick={() => handleLeaveStatusUpdate(app._id, 'Cancelled')}
//                                     className="text-gray-600 hover:text-gray-900 px-2 py-1 md:px-3 md:py-1 rounded-md border border-gray-600 hover:border-gray-900 transition-colors duration-200 mt-2 md:mt-0 md:ml-2 text-xs md:text-sm"
//                                   >
//                                     Cancel
//                                   </button>
//                                 )}
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }


import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile, fetchAllLeaveApplications, updateLeaveApplicationStatus } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  FaUser,
  FaEnvelope,
  FaCamera,
  FaHome,
  FaHeart,
  FaShareAlt,
  FaCalendarAlt,
  FaBars,
  FaTimes,
} from 'react-icons/fa';

const Spinner = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
  </div>
);

export default function AdminProfilePage() {
  const navigate = useNavigate();
  const { user, isLoading, fetchUser } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    preferredFullName: '',
    emailId: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    pronouns: '',
    profilePicture: null,
  });
  const [addressData, setAddressData] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postcode: '',
    country: '',
  });
  const [emergencyContactData, setEmergencyContactData] = useState({
    contactName: '',
    contactRelationship: '',
    contactPhone: '',
  });
  const [socialData, setSocialData] = useState({
    facebook: '',
    twitter: '',
    linkedin: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef(null);
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [isLoadingLeaves, setIsLoadingLeaves] = useState(true);
  const [leaveError, setLeaveError] = useState('');
  const [leaveStatusMessage, setLeaveStatusMessage] = useState('');
  const [emailUpdateMessage, setEmailUpdateMessage] = useState(''); // For the "Email update requires re-verification" message
    const [emailSpecificSuccessMessage, setEmailSpecificSuccessMessage] = useState(''); // NEW: For actual email update success (if implemented)
    const [phoneNumberSuccessMessage, setPhoneNumberSuccessMessage] = useState(''); // NEW: For phone number update success


  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        preferredFullName: user.preferredFullName || '',
        emailId: user.emailId || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth ? formatDateForInput(user.dateOfBirth) : '',
        gender: user.gender || '',
        pronouns: user.pronouns || '',
        profilePicture: user.profilePicture || null,
      });
      setAddressData(user.address || { addressLine1: '', addressLine2: '', city: '', state: '', postcode: '', country: '' });
      setEmergencyContactData(user.emergencyContact || { contactName: '', contactRelationship: '', contactPhone: '' });
      setSocialData(user.social || { facebook: '', twitter: '', linkedin: '' });
    }
  }, [user]);

  useEffect(() => {
    if (activeSection === 'leaves' && user && user.role === 'admin') {
      getAllLeaveApplications();
    }
  }, [activeSection, user]);
  useEffect(() => {
        let timer;
        if (emailUpdateMessage) {
            timer = setTimeout(() => {
                setEmailUpdateMessage('');
            }, 3000);
        }
        return () => clearTimeout(timer);
    }, [emailUpdateMessage]);

    // NEW: Effect to clear emailSpecificSuccessMessage
    useEffect(() => {
        let timer;
        if (emailSpecificSuccessMessage) {
            timer = setTimeout(() => {
                setEmailSpecificSuccessMessage('');
            }, 3000);
        }
        return () => clearTimeout(timer);
    }, [emailSpecificSuccessMessage]);

    // NEW: Effect to clear phoneNumberSuccessMessage
    useEffect(() => {
        let timer;
        if (phoneNumberSuccessMessage) {
            timer = setTimeout(() => {
                setPhoneNumberSuccessMessage('');
            }, 3000);
        }
        return () => clearTimeout(timer);
    }, [phoneNumberSuccessMessage]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <Spinner />
        <p className="ml-3 text-base md:text-lg text-gray-700">Loading profile...</p>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'employee')) {
    if (window.location.pathname !== '/login') {
      navigate('/login');
    }
    return null;
  }

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setAddressData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleEmergencyContactInputChange = (e) => {
    const { name, value } = e.target;
    setEmergencyContactData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSocialInputChange = (e) => {
    const { name, value } = e.target;
    setSocialData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit.');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!acceptedImageTypes.includes(file.type)) {
        setError('Only image files (JPG, PNG, GIF) are allowed.');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setSelectedFile(file);
      setError('');
    } else {
      setSelectedFile(null);
      setError('');
    }
  };

  const handleSubmit = async (event, sectionType) => {
    event.preventDefault();
    setIsUpdating(true);
    setMessage('');
    setError('');

    try {
      let response;
      const formData = new FormData();

      switch (sectionType) {
        case 'profile':
          if (!profileData.firstName || !profileData.lastName) {
            throw new Error('First Name and Last Name are required.');
          }
          formData.append('firstName', profileData.firstName);
          formData.append('lastName', profileData.lastName);
          if (user.role === 'admin') {
            formData.append('preferredFullName', profileData.preferredFullName || '');
            formData.append('phoneNumber', profileData.phoneNumber || '');
            formData.append('dateOfBirth', profileData.dateOfBirth || '');
            formData.append('gender', profileData.gender || '');
            formData.append('pronouns', profileData.pronouns || '');
          }
          response = await updateUserProfile(formData);
          break;

        case 'profile-photo':
          if (!selectedFile) {
            throw new Error('Please select a file to upload.');
          }
          formData.append('profilePicture', selectedFile);
          formData.append('firstName', user.firstName);
          formData.append('lastName', user.lastName);
          response = await updateUserProfile(formData);
          break;

        case 'address':
          if (!addressData.addressLine1 || !addressData.city || !addressData.country || !addressData.postcode) {
            throw new Error('Address Line 1, City, Country, and Postcode are required.');
          }
          Object.keys(addressData).forEach(key => {
            formData.append(`address.${key}`, addressData[key]);
          });
          formData.append('firstName', user.firstName);
          formData.append('lastName', user.lastName);
          response = await updateUserProfile(formData);
          break;

        case 'emergency-contact':
          if (!emergencyContactData.contactName || !emergencyContactData.contactPhone) {
            throw new Error('Emergency Contact Name and Phone are required.');
          }
          Object.keys(emergencyContactData).forEach(key => {
            formData.append(`emergencyContact.${key}`, emergencyContactData[key]);
          });
          formData.append('firstName', user.firstName);
          formData.append('lastName', user.lastName);
          response = await updateUserProfile(formData);
          break;

        case 'social':
          Object.keys(socialData).forEach(key => {
            formData.append(`social.${key}`, socialData[key]);
          });
          formData.append('firstName', user.firstName);
          formData.append('lastName', user.lastName);
          response = await updateUserProfile(formData);
          break;

        default:
          throw new Error('Invalid section for update.');
      }

      setIsUpdating(false);
      setMessage(response.data.message || `${sectionType} updated successfully!`);

      if (typeof fetchUser === 'function') {
        await fetchUser();
      } else {
        console.warn("Auth context's fetchUser function is not available or is not a function.");
      }

      if (sectionType === 'profile-photo') {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }

    } catch (err) {
      setIsUpdating(false);
      const errMsg = err.response?.data?.message || err.message || 'Network error or server unavailable.';
      setError(errMsg);
      console.error(`${sectionType} update error:`, err);
    }
  };

  const getAllLeaveApplications = async () => {
    setIsLoadingLeaves(true);
    setLeaveError('');
    try {
      const response = await fetchAllLeaveApplications();
      const applicationsData = response.data.data;

      if (Array.isArray(applicationsData)) {
        setLeaveApplications(applicationsData);
      } else {
        console.error('API response for all leave applications was not an array:', applicationsData);
        setLeaveApplications([]);
        setLeaveError('Unexpected data format received for leave applications.');
      }
    } catch (err) {
      console.error('Error fetching all leave applications:', err);
      setLeaveError(err.response?.data?.message || 'Failed to load leave applications.');
      setLeaveApplications([]);
    } finally {
      setIsLoadingLeaves(false);
    }
  };

  const handleLeaveStatusUpdate = async (id, newStatus) => {
    setLeaveStatusMessage('');
    try {
      const response = await updateLeaveApplicationStatus(id, newStatus);
      setLeaveStatusMessage(response.message);
      getAllLeaveApplications();
    } catch (err) {
      console.error('Error updating leave status:', err);
      setLeaveStatusMessage(err.response?.data?.message || 'Failed to update leave status.');
    }
  };

  const defaultProfilePicture = 'https://placehold.co/128x128/aabbcc/ffffff?text=User';

  const profileNavItems = [
    { id: 'profile', name: 'Profile', required: true, icon: <FaUser className="mr-2" /> },
    { id: 'profile-photo', name: 'Profile Photo', required: false, icon: <FaCamera className="mr-2" /> },
    { id: 'address', name: 'Address', required: true, icon: <FaHome className="mr-2" /> },
    { id: 'emergency-contact', name: 'Emergency Contact', required: true, icon: <FaHeart className="mr-2" /> },
    { id: 'social', name: 'Social', required: false, icon: <FaShareAlt className="mr-2" /> },
    ...(user && user.role === 'admin' ? [{ id: 'leaves', name: 'Leaves', required: false, icon: <FaCalendarAlt className="mr-2" /> }] : []),
  ];

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string provided to formatDateForInput:', dateString);
        return '';
      }
      return date.toISOString().split('T')[0];
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex font-inter">
      {/* Mobile Menu Button */}
      <button
        className="md:hidden top-4 left-4 z-50 p-2 bg-gray-100 h-[35px] text-black rounded-md"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg p-4 transform transition-transform duration-300 ease-in-out z-40
          mt-[65px] pt-[50px] md:mt-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:w-64 md:p-6`}
      >
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Profile Settings</h2>
        </div>
        <nav>
          <ul className="space-y-2">
            {profileNavItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveSection(item.id);
                    setIsSidebarOpen(false); // Close sidebar on item click for mobile
                  }}
                  className={`w-full text-left p-2 md:p-3 rounded-lg transition-all duration-200 flex items-center justify-between text-sm md:text-base
                    ${activeSection === item.id
                      ? 'bg-blue-100 text-blue-800 font-bold shadow-sm'
                      : 'hover:bg-gray-100 text-gray-600'
                    }`}
                >
                  <div className="flex items-center">
                    {item.icon}
                    {item.name}
                  </div>
                  {item.required && (
                    <span className="text-red-500 text-xs">*</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <main className="flex-1 p-4 max-w-[1280px] md:p-6">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-6">
          {/* User Info Header */}
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-4 md:mb-6 pb-4 border-b border-gray-200">
            <img
              src={user.profilePicture || defaultProfilePicture}
              alt="Profile"
              className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-blue-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultProfilePicture;
              }}
            />
            <div className="text-center md:text-left">
              <p className="text-base md:text-lg font-bold text-gray-800">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-gray-600 flex items-center justify-center md:justify-start mt-1">
                <FaEnvelope className="mr-2 text-gray-500" />
                {user.emailId}
              </p>
              <p className="text-sm text-gray-600 mt-1">Role: {user.role}</p>
            </div>
          </div>

          {/* Profile Details Content */}
          <div className="flex-grow bg-gray-50 p-4 md:p-6 rounded-lg shadow-inner">
            {message && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 md:px-4 md:py-3 rounded relative mb-4 text-sm md:text-base" role="alert">
                <span className="block sm:inline">{message}</span>
              </div>
            )}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 md:px-4 md:py-3 rounded relative mb-4 text-sm md:text-base" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {activeSection === 'profile' && (
              <form onSubmit={(e) => handleSubmit(e, 'profile')} className="space-y-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">User Profile</h3>
                {user.role === 'admin' ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                    <div>
                      <label htmlFor="preferredFullName" className="block text-sm font-medium text-gray-700">
                        Preferred full name (optional)
                      </label>
                      <p className="mt-1 text-xs md:text-sm text-gray-500">Set your preferred full name to be shown in Shiftry</p>
                      <input
                        type="text"
                        name="preferredFullName"
                        id="preferredFullName"
                        value={profileData.preferredFullName}
                        onChange={handleProfileInputChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div></div>
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        id="firstName"
                        value={profileData.firstName}
                        onChange={handleProfileInputChange}
                        required
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        id="lastName"
                        value={profileData.lastName}
                        onChange={handleProfileInputChange}
                        required
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="emailId" className="block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                          type="email"
                          name="emailId"
                          id="emailId"
                          value={profileData.emailId}
                          readOnly
                          className="flex-1 block w-full p-2 border border-gray-300 rounded-l-md bg-gray-50 cursor-not-allowed text-sm"
                        />
                        <button
                          type="button"
                          className="inline-flex items-center px-2 md:px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-700 text-xs md:text-sm hover:bg-gray-100"
                          onClick={() =>setEmailUpdateMessage('Email updated successffully')}
                        >
                          Update
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                        Phone number
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                          type="tel"
                          name="phoneNumber"
                          id="phoneNumber"
                          value={profileData.phoneNumber}
                          onChange={handleProfileInputChange}
                          className="flex-1 block w-full p-2 border border-gray-300 rounded-l-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        <button
                          type="button"
                          className="inline-flex items-center px-2 md:px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-700 text-xs md:text-sm hover:bg-gray-100"
                          onClick={() => setPhoneNumberSuccessMessage('Phone number updated successfully!')}
                        >
                          Update
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                        Date of birth
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        id="dateOfBirth"
                        value={profileData.dateOfBirth}
                        onChange={handleProfileInputChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                        Gender (optional)
                      </label>
                      <select
                        name="gender"
                        id="gender"
                        value={profileData.gender}
                        onChange={handleProfileInputChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="">Not specified</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      <p className="mt-1 text-xs md:text-sm text-gray-500">
                        By default, we won't show this on your employee profile unless your business chooses to.
                      </p>
                    </div>
                    <div>
                      <label htmlFor="pronouns" className="block text-sm font-medium text-gray-700">
                        Pronouns (optional)
                      </label>
                      <select
                        name="pronouns"
                        id="pronouns"
                        value={profileData.pronouns}
                        onChange={handleProfileInputChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="">Not specified</option>
                        <option value="He/Him">He/Him</option>
                        <option value="She/Her">She/Her</option>
                        <option value="They/Them">They/Them</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        id="firstName"
                        value={profileData.firstName}
                        onChange={handleProfileInputChange}
                        required
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        id="lastName"
                        value={profileData.lastName}
                        onChange={handleProfileInputChange}
                        required
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="emailId" className="block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <input
                        type="email"
                        name="emailId"
                        id="emailId"
                        value={profileData.emailId}
                        readOnly
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed text-sm"
                      />
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-6">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full md:w-auto"
                    disabled={isUpdating}
                  >
                    {isUpdating && <Spinner />}
                    {isUpdating ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            )}

            {activeSection === 'profile-photo' && (
              <form onSubmit={(e) => handleSubmit(e, 'profile-photo')} className="space-y-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Profile Photo</h3>
                <div className="flex justify-center mb-6">
                  <img
                    src={user.profilePicture || defaultProfilePicture}
                    alt="Current Profile"
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-2 border-blue-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultProfilePicture;
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">
                    Upload New Profile Picture (Max 5MB, Images Only)
                  </label>
                  <input
                    type="file"
                    name="profilePicture"
                    id="profilePicture"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none"
                  />
                  {selectedFile && <p className="mt-2 text-xs md:text-sm text-gray-500">Selected file: {selectedFile.name}</p>}
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-200 mt-6">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full md:w-auto"
                    disabled={isUpdating || !selectedFile}
                  >
                    {isUpdating && <Spinner />}
                    {isUpdating ? 'Uploading...' : 'Update Photo'}
                  </button>
                </div>
              </form>
            )}

            {activeSection === 'address' && (
              <form onSubmit={(e) => handleSubmit(e, 'address')} className="space-y-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Address Details</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                  <div>
                    <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      name="addressLine1"
                      id="addressLine1"
                      value={addressData.addressLine1}
                      onChange={handleAddressInputChange}
                      required
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">
                      Address Line 2 (optional)
                    </label>
                    <input
                      type="text"
                      name="addressLine2"
                      id="addressLine2"
                      value={addressData.addressLine2}
                      onChange={handleAddressInputChange}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      id="city"
                      value={addressData.city}
                      onChange={handleAddressInputChange}
                      required
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                      State/Province (optional)
                    </label>
                    <input
                      type="text"
                      name="state"
                      id="state"
                      value={addressData.state}
                      onChange={handleAddressInputChange}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="postcode" className="block text-sm font-medium text-gray-700">
                      Postcode *
                    </label>
                    <input
                      type="text"
                      name="postcode"
                      id="postcode"
                      value={addressData.postcode}
                      onChange={handleAddressInputChange}
                      required
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                      Country *
                    </label>
                    <select
                      name="country"
                      id="country"
                      value={addressData.country}
                      onChange={handleAddressInputChange}
                      required
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">Select Country</option>
                      <option value="USA">United States</option>
                      <option value="CAN">Canada</option>
                      <option value="GBR">United Kingdom</option>
                      <option value="AUS">Australia</option>
                      <option value="IND">India</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-200 mt-6">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full md:w-auto"
                    disabled={isUpdating}
                  >
                    {isUpdating && <Spinner />}
                    {isUpdating ? 'Updating...' : 'Update Address'}
                  </button>
                </div>
              </form>
            )}

            {activeSection === 'emergency-contact' && (
              <form onSubmit={(e) => handleSubmit(e, 'emergency-contact')} className="space-y-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                  <div>
                    <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      id="contactName"
                      value={emergencyContactData.contactName}
                      onChange={handleEmergencyContactInputChange}
                      required
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="contactRelationship" className="block text-sm font-medium text-gray-700">
                      Relationship (optional)
                    </label>
                    <input
                      type="text"
                      name="contactRelationship"
                      id="contactRelationship"
                      value={emergencyContactData.contactRelationship}
                      onChange={handleEmergencyContactInputChange}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      id="contactPhone"
                      value={emergencyContactData.contactPhone}
                      onChange={handleEmergencyContactInputChange}
                      required
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-200 mt-6">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full md:w-auto"
                    disabled={isUpdating}
                  >
                    {isUpdating && <Spinner />}
                    {isUpdating ? 'Updating...' : 'Update Emergency Contact'}
                  </button>
                </div>
              </form>
            )}

            {activeSection === 'social' && (
              <form onSubmit={(e) => handleSubmit(e, 'social')} className="space-y-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Social Links</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                  <div>
                    <label htmlFor="facebook" className="block text-sm font-medium text-gray-700">
                      Facebook URL (optional)
                    </label>
                    <input
                      type="url"
                      name="facebook"
                      id="facebook"
                      value={socialData.facebook}
                      onChange={handleSocialInputChange}
                      placeholder="https://facebook.com/yourprofile"
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="twitter" className="block text-sm font-medium text-gray-700">
                      Twitter URL (optional)
                    </label>
                    <input
                      type="url"
                      name="twitter"
                      id="twitter"
                      value={socialData.twitter}
                      onChange={handleSocialInputChange}
                      placeholder="https://twitter.com/yourprofile"
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
                      LinkedIn URL (optional)
                    </label>
                    <input
                      type="url"
                      name="linkedin"
                      id="linkedin"
                      value={socialData.linkedin}
                      onChange={handleSocialInputChange}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-200 mt-6">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full md:w-auto"
                    disabled={isUpdating}
                  >
                    {isUpdating && <Spinner />}
                    {isUpdating ? 'Updating...' : 'Update Social Links'}
                  </button>
                </div>
              </form>
            )}

            {activeSection === 'leaves' && user && user.role === 'admin' && (
              <div className="space-y-6 w-auto max-w-[1280px]">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">All Leave Applications</h3>
                {leaveStatusMessage && (
                  <div className={`mb-4 p-3 rounded-lg text-center text-sm md:text-base ${leaveStatusMessage.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {leaveStatusMessage}
                  </div>
                )}
                {isLoadingLeaves ? (
                  <p className="text-center text-gray-600 text-sm md:text-base">Loading all leave applications...</p>
                ) : leaveError ? (
                  <p className="text-center text-red-600 text-sm md:text-base">{leaveError}</p>
                ) : leaveApplications.length === 0 ? (
                  <p className="text-center text-gray-600 text-sm md:text-base">No leave applications to display.</p>
                ) : (
                  <>
                    {/* Mobile Card Layout */}
                    <div className="sm:hidden space-y-4">
                      {leaveApplications.map((app) => (
                        <div key={app._id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                          <div className="space-y-2">
                            <div>
                              <span className="text-xs font-medium text-gray-500 uppercase">Applicant</span>
                              <p className="text-sm font-medium text-gray-900">
                                {app.user ? `${app.user.firstName || ''} ${app.user.lastName || ''}`.trim() || app.user.emailId : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-500 uppercase">Reason</span>
                              <p className="text-sm text-gray-700">{app.leaveReason}</p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-500 uppercase">Dates</span>
                              <p className="text-sm text-gray-700">
                                {new Date(app.fromDate).toLocaleDateString('en-GB')} - {new Date(app.toDate).toLocaleDateString('en-GB')}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-500 uppercase">Type</span>
                              <p className="text-sm text-gray-700">{app.leaveType}</p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-500 uppercase">Description</span>
                              <p className="text-sm text-gray-700 max-w-[250px] truncate">{app.description || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-500 uppercase">Status</span>
                              <p>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                  ${app.status === 'Approved' ? 'bg-green-100 text-green-800' : ''}
                                  ${app.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                  ${app.status === 'Rejected' ? 'bg-red-100 text-red-800' : ''}
                                  ${app.status === 'Cancelled' ? 'bg-gray-100 text-gray-800' : ''}`}>
                                  {app.status}
                                </span>
                              </p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-500 uppercase">Applied On</span>
                              <p className="text-sm text-gray-700">{new Date(app.appliedAt).toLocaleDateString('en-GB')}</p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-500 uppercase">Actions</span>
                              <div className="flex flex-col gap-2 mt-2">
                                {app.status === 'Pending' && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleLeaveStatusUpdate(app._id, 'Approved')}
                                      className="text-green-600 hover:text-green-900 px-2 py-1 rounded-md border border-green-600 hover:border-green-900 transition-colors duration-200 text-xs w-full"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleLeaveStatusUpdate(app._id, 'Rejected')}
                                      className="text-red-600 hover:text-red-900 px-2 py-1 rounded-md border border-red-600 hover:border-red-900 transition-colors duration-200 text-xs w-full"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                                {(app.status === 'Approved' || app.status === 'Pending') && (
                                  <button
                                    onClick={() => handleLeaveStatusUpdate(app._id, 'Cancelled')}
                                    className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md border border-gray-600 hover:border-gray-900 transition-colors duration-200 text-xs w-full"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table Layout */}
                    <div className="hidden sm:block overflow-x-auto bg-white rounded-lg shadow-xl max-w-full">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Applicant
                            </th>
                            <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Reason
                            </th>
                            <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Dates
                            </th>
                            <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Description
                            </th>
                            <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Applied On
                            </th>
                            <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {leaveApplications.map((app) => (
                            <tr key={app._id}>
                              <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {app.user ? `${app.user.firstName || ''} ${app.user.lastName || ''}`.trim() || app.user.emailId : 'N/A'}
                              </td>
                              <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-700">
                                {app.leaveReason}
                              </td>
                              <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-700">
                                {new Date(app.fromDate).toLocaleDateString('en-GB')} - {new Date(app.toDate).toLocaleDateString('en-GB')}
                              </td>
                              <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-700">
                                {app.leaveType}
                              </td>
                              <td className="px-4 py-3 md:px-6 md:py-4 whitespace-normal text-sm text-gray-700 max-w-xs overflow-hidden text-ellipsis">
                                {app.description || 'N/A'}
                              </td>
                              <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                  ${app.status === 'Approved' ? 'bg-green-100 text-green-800' : ''}
                                  ${app.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                  ${app.status === 'Rejected' ? 'bg-red-100 text-red-800' : ''}
                                  ${app.status === 'Cancelled' ? 'bg-gray-100 text-gray-800' : ''}`}>
                                  {app.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(app.appliedAt).toLocaleDateString('en-GB')}
                              </td>
                              <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-right text-sm font-medium">
                                {app.status === 'Pending' && (
                                  <div className="flex flex-col md:flex-row gap-2">
                                    <button
                                      onClick={() => handleLeaveStatusUpdate(app._id, 'Approved')}
                                      className="text-green-600 hover:text-green-900 px-2 py-1 md:px-3 md:py-1 rounded-md border border-green-600 hover:border-green-900 transition-colors duration-200 text-xs md:text-sm"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleLeaveStatusUpdate(app._id, 'Rejected')}
                                      className="text-red-600 hover:text-red-900 px-2 py-1 md:px-3 md:py-1 rounded-md border border-red-600 hover:border-red-900 transition-colors duration-200 text-xs md:text-sm"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                                {(app.status === 'Approved' || app.status === 'Pending') && (
                                  <button
                                    onClick={() => handleLeaveStatusUpdate(app._id, 'Cancelled')}
                                    className="text-gray-600 hover:text-gray-900 px-2 py-1 md:px-3 md:py-1 rounded-md border border-gray-600 hover:border-gray-900 transition-colors duration-200 mt-2 md:mt-0 md:ml-2 text-xs md:text-sm"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}