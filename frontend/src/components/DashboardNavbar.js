// // // import React, { useState, useEffect, useRef } from "react";
// // // import NavTabs from "./NavTabs";
// // // import UserAvatarDropdown from "./UserAvatarDropdown";
// // // import { useAuth } from "../context/AuthContext";
// // // import {
// // //   fetchUnreadNotificationCount,
// // //   fetchNotifications,
// // //   markNotificationAsRead,
// // //   markAllNotificationsAsRead,
// // //   deleteNotification,
// // //   clearAllNotifications,
// // // } from "../api";

// // // export default function DashboardNavbar() {
// // //   const { user, isLoading, logout } = useAuth();

// // //   const [unreadCount, setUnreadCount] = useState(0);
// // //   const [notifications, setNotifications] = useState([]);
// // //   const [showDropdown, setShowDropdown] = useState(false);
// // //   const dropdownRef = useRef(null);

// // //   // --- Notification Logic ---

// // //   useEffect(() => {
// // //     console.log("DashboardNavbar: useEffect triggered. User:", user, "isLoading:", isLoading);

// // //     if (!isLoading && user && user.id) {
// // //       console.log("DashboardNavbar: User is loaded and valid. Fetching initial unread count.");
// // //       fetchInitialUnreadCount();
// // //     } else if (!isLoading && !user) {
// // //       console.log("DashboardNavbar: User not logged in, skipping notification fetch.");
// // //     }

// // //     document.addEventListener("mousedown", handleClickOutside);

// // //     return () => {
// // //       document.removeEventListener("mousedown", handleClickOutside);
// // //     };
// // //   }, [user, isLoading]);

// // //   const fetchInitialUnreadCount = async () => {
// // //     if (!user || !user.id) {
// // //       console.warn("fetchInitialUnreadCount: User or user ID missing. Aborting fetch.");
// // //       setUnreadCount(0);
// // //       return;
// // //     }

// // //     try {
// // //       console.log("fetchInitialUnreadCount: Calling fetchUnreadNotificationCount API...");
// // //       // FIX 1: Directly use the data returned by api.js function
// // //       const responseData = await fetchUnreadNotificationCount(user.id);
// // //       console.log("fetchInitialUnreadCount: API Response (direct data):", responseData);

// // //       if (responseData && typeof responseData.count === 'number') {
// // //         console.log("fetchInitialUnreadCount: Successfully received count:", responseData.count);
// // //         setUnreadCount(responseData.count);
// // //       } else {
// // //         console.warn("fetchInitialUnreadCount: Expected unread count data to have a 'count' property, but received:", responseData);
// // //         setUnreadCount(0);
// // //       }
// // //     } catch (error) {
// // //       console.error("fetchInitialUnreadCount: Error fetching initial unread count:", error.response?.data || error.message);
// // //       setUnreadCount(0);
// // //     }
// // //   };

// // //   const fetchAllNotifications = async () => {
// // //     if (!user || !user.id) {
// // //       console.warn("fetchAllNotifications: User or user ID missing. Aborting fetch.");
// // //       setNotifications([]);
// // //       return;
// // //     }

// // //     try {
// // //       console.log("fetchAllNotifications: Calling fetchNotifications API...");
// // //       // FIX 2: Directly use the data returned by api.js function
// // //       const data = await fetchNotifications(user.id) || [];
// // //       console.log("fetchAllNotifications: API Response (direct data):", data);

// // //       if (Array.isArray(data)) {
// // //         console.log("fetchAllNotifications: Received array of notifications, count:", data.length);
// // //         const sortedNotifications = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
// // //         setNotifications(sortedNotifications);
// // //       } else {
// // //         console.error("fetchAllNotifications: Expected an array of notifications, but received non-array data:", data);
// // //         setNotifications([]);
// // //       }
// // //     } catch (error) {
// // //       console.error("fetchAllNotifications: Error fetching all notifications:", error.response?.data || error.message);
// // //       setNotifications([]);
// // //     }
// // //   };

// // //   const toggleDropdown = async () => {
// // //     console.log("toggleDropdown: showDropdown was:", showDropdown);
// // //     if (!showDropdown) {
// // //       console.log("toggleDropdown: Dropdown is about to open, fetching all notifications.");
// // //       await fetchAllNotifications();
// // //     }
// // //     setShowDropdown((prev) => !prev);
// // //     console.log("toggleDropdown: showDropdown is now:", !showDropdown);
// // //   };

// // //   const handleMarkAsRead = async (id) => {
// // //     try {
// // //       await markNotificationAsRead(id);
// // //       setNotifications((prev) =>
// // //         prev.map((notif) => (notif._id === id ? { ...notif, isRead: true } : notif))
// // //       );
// // //       setUnreadCount((prev) => Math.max(0, prev - 1));
// // //     } catch (error) {
// // //       console.error(`Error marking notification ${id} as read:`, error);
// // //     }
// // //   };

// // //   const handleMarkAllAsRead = async () => {
// // //     try {
// // //       if (!user || !user.id) {
// // //         console.warn("User not loaded or user ID missing, cannot mark all notifications as read.");
// // //         return;
// // //       }
// // //       await markAllNotificationsAsRead(user.id);
// // //       setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
// // //       setUnreadCount(0);
// // //     } catch (error) {
// // //       console.error("Error marking all notifications as read:", error);
// // //     }
// // //   };

// // //   const handleDeleteNotification = async (id) => {
// // //     try {
// // //       await deleteNotification(id);
// // //       setNotifications((prev) => prev.filter((notif) => notif._id !== id));
// // //       const deletedNotif = notifications.find(notif => notif._id === id);
// // //       if (deletedNotif && !deletedNotif.isRead) {
// // //         setUnreadCount((prev) => Math.max(0, prev - 1));
// // //       }
// // //     } catch (error) {
// // //       console.error(`Error deleting notification ${id}:`, error);
// // //     }
// // //   };

// // //   const handleClearAllNotifications = async () => {
// // //     try {
// // //       if (!user || !user.id) {
// // //         console.warn("User not loaded or user ID missing, cannot clear all notifications.");
// // //         return;
// // //       }
// // //       await clearAllNotifications(user.id);
// // //       setNotifications([]);
// // //       setUnreadCount(0);
// // //       setShowDropdown(false);
// // //     } catch (error) {
// // //       console.error("Error clearing all notifications:", error);
// // //     }
// // //   };

// // //   const handleClickOutside = (event) => {
// // //     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
// // //       setShowDropdown(false);
// // //     }
// // //   };

// // //   console.log("DashboardNavbar: Current unreadCount state:", unreadCount);
// // //   console.log("DashboardNavbar: Current notifications state (array length):", notifications.length);

// // //   return (
// // //     <nav className="bg-white shadow px-6 py-0 border-b">
// // //       <div className="flex items-center justify-between w-full">
// // //         <div className="h-20 w-48">
// // //           <img src="/shiftrylogo.png" alt="logo" className="h-full w-[150px] object-contain" />
// // //         </div>

// // //         <NavTabs />

// // //         <div className="flex items-center space-x-4">
// // //           <div className="relative" ref={dropdownRef}>
// // //             <button
// // //               className="text-gray-600 hover:text-gray-900 text-xl relative"
// // //               onClick={toggleDropdown}
// // //               aria-label="Notifications"
// // //             >
// // //               <img src="/notification.svg" alt="Notifications" className="w-6 h-6" />
// // //               {unreadCount > 0 && (
// // //                 <span
// // //                   className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs"
// // //                   style={{ padding: "2px 6px", minWidth: "20px", textAlign: "center", lineHeight: "1" }}
// // //                 >
// // //                   {unreadCount}
// // //                 </span>
// // //               )}
// // //             </button>

// // //             {showDropdown && (
// // //               <div
// // //                 className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
// // //                 style={{ maxHeight: '400px' }}
// // //               >
// // //                 <div className="px-4 py-2 border-b flex justify-between items-center">
// // //                   <h3 className="text-lg font-semibold">Notifications</h3>
// // //                   {notifications.length > 0 && (
// // //                     <button
// // //                       onClick={handleClearAllNotifications}
// // //                       className="text-red-600 hover:underline text-[10px]"
// // //                     >
// // //                       Clear All
// // //                     </button>
// // //                   )}
// // //                   {unreadCount > 0 && (
// // //                     <button
// // //                       onClick={handleMarkAllAsRead}
// // //                       className="text-blue-600 hover:underline text-[10px]"
// // //                     >
// // //                       Mark All as Read
// // //                     </button>
// // //                   )}
// // //                 </div>
// // //                 <ul className="divide-y divide-gray-200 overflow-y-auto" style={{ maxHeight: 'calc(400px - 56px)' }}>
// // //                   {notifications.length === 0 ? (
// // //                     <li className="p-4 text-gray-500 text-center">No notifications.</li>
// // //                   ) : (
// // //                     notifications.map((notif) => (
// // //                       <li
// // //                         key={notif._id}
// // //                         className={`p-4 flex items-center justify-between transition-colors ${
// // //                           notif.isRead ? "bg-gray-50 text-gray-600" : "bg-white font-medium text-gray-900"
// // //                         }`}
// // //                       >
// // //                         <div>
// // //                           <p className="text-sm leading-snug">{notif.message}</p>
// // //                           <span className="text-xs text-gray-400 mt-1 block">
// // //                             {new Date(notif.createdAt).toLocaleString()}
// // //                           </span>
// // //                         </div>
// // //                         <div className="flex items-center space-x-2">
// // //                             {!notif.isRead && (
// // //                                 <button
// // //                                     onClick={() => handleMarkAsRead(notif._id)}
// // //                                     className="flex-shrink-0 text-blue-500 hover:text-blue-700 text-sm border border-blue-500 rounded-md px-2 py-1"
// // //                                 >
// // //                                     Mark Read
// // //                                 </button>
// // //                             )}
// // //                             <button
// // //                                 onClick={() => handleDeleteNotification(notif._id)}
// // //                                 className="flex-shrink-0 text-red-500 hover:text-red-700 text-sm border border-red-500 rounded-md px-2 py-1"
// // //                                 title="Delete Notification"
// // //                             >
// // //                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
// // //                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
// // //                                 </svg>
// // //                             </button>
// // //                         </div>
// // //                       </li>
// // //                     ))
// // //                   )}
// // //                 </ul>
// // //               </div>
// // //             )}
// // //           </div>

// // //           {/* User Name and Dropdown */}
// // //           <div className="text-gray-700 font-medium">
// // //             {isLoading
// // //               ? "Loading..."
// // //               : user?.firstName
// // //               ? user.firstName
// // //               : "Guest"}
// // //           </div>

// // //           <UserAvatarDropdown onLogout={logout} />
// // //         </div>
// // //       </div>
// // //     </nav>
// // //   );
// // // }

// // import React, { useState, useEffect, useRef } from "react";
// // import NavTabs from "./NavTabs";
// // import UserAvatarDropdown from "./UserAvatarDropdown";
// // import { useAuth } from "../context/AuthContext";
// // import {
// //   fetchUnreadNotificationCount,
// //   fetchNotifications,
// //   markNotificationAsRead,
// //   markAllNotificationsAsRead,
// //   deleteNotification,
// //   clearAllNotifications,
// // } from "../api";

// // export default function DashboardNavbar() {
// //   const { user, isLoading, logout } = useAuth();

// //   const [unreadCount, setUnreadCount] = useState(0);
// //   const [notifications, setNotifications] = useState([]);
// //   const [showDropdown, setShowDropdown] = useState(false); // For Notification dropdown
// //   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // For mobile navigation menu
// //   const dropdownRef = useRef(null); // For Notification dropdown
// //   const mobileMenuRef = useRef(null); // For mobile menu (NavTabs)

// //   // --- Notification Logic ---

// //   useEffect(() => {
// //     console.log("DashboardNavbar: useEffect triggered. User:", user, "isLoading:", isLoading);

// //     if (!isLoading && user && user.id) {
// //       console.log("DashboardNavbar: User is loaded and valid. Fetching initial unread count.");
// //       fetchInitialUnreadCount();
// //     } else if (!isLoading && !user) {
// //       console.log("DashboardNavbar: User not logged in, skipping notification fetch.");
// //     }

// //     document.addEventListener("mousedown", handleClickOutside);

// //     return () => {
// //       document.removeEventListener("mousedown", handleClickOutside);
// //     };
// //   }, [user, isLoading]);

// //   const fetchInitialUnreadCount = async () => {
// //     if (!user || !user.id) {
// //       console.warn("fetchInitialUnreadCount: User or user ID missing. Aborting fetch.");
// //       setUnreadCount(0);
// //       return;
// //     }

// //     try {
// //       console.log("fetchInitialUnreadCount: Calling fetchUnreadNotificationCount API...");
// //       const responseData = await fetchUnreadNotificationCount(user.id);
// //       console.log("fetchInitialUnreadCount: API Response (direct data):", responseData);

// //       if (responseData && typeof responseData.count === 'number') {
// //         console.log("fetchInitialUnreadCount: Successfully received count:", responseData.count);
// //         setUnreadCount(responseData.count);
// //       } else {
// //         console.warn("fetchInitialUnreadCount: Expected unread count data to have a 'count' property, but received:", responseData);
// //         setUnreadCount(0);
// //       }
// //     } catch (error) {
// //       console.error("fetchInitialUnreadCount: Error fetching initial unread count:", error.response?.data || error.message);
// //       setUnreadCount(0);
// //     }
// //   };

// //   const fetchAllNotifications = async () => {
// //     if (!user || !user.id) {
// //       console.warn("fetchAllNotifications: User or user ID missing. Aborting fetch.");
// //       setNotifications([]);
// //       return;
// //     }

// //     try {
// //       console.log("fetchAllNotifications: Calling fetchNotifications API...");
// //       const data = await fetchNotifications(user.id) || [];
// //       console.log("fetchAllNotifications: API Response (direct data):", data);

// //       if (Array.isArray(data)) {
// //         console.log("fetchAllNotifications: Received array of notifications, count:", data.length);
// //         const sortedNotifications = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
// //         setNotifications(sortedNotifications);
// //       } else {
// //         console.error("fetchAllNotifications: Expected an array of notifications, but received non-array data:", data);
// //         setNotifications([]);
// //       }
// //     } catch (error) {
// //       console.error("fetchAllNotifications: Error fetching all notifications:", error.response?.data || error.message);
// //       setNotifications([]);
// //     }
// //   };

// //   const toggleNotificationDropdown = async () => {
// //     console.log("toggleNotificationDropdown: showDropdown was:", showDropdown);
// //     if (!showDropdown) {
// //       console.log("toggleNotificationDropdown: Dropdown is about to open, fetching all notifications.");
// //       await fetchAllNotifications();
// //     }
// //     setShowDropdown((prev) => !prev);
// //     // Close mobile menu if open when notification dropdown is toggled
// //     if (isMobileMenuOpen) setIsMobileMenuOpen(false);
// //   };

// //   const handleMarkAsRead = async (id) => {
// //     try {
// //       await markNotificationAsRead(id);
// //       setNotifications((prev) =>
// //         prev.map((notif) => (notif._id === id ? { ...notif, isRead: true } : notif))
// //       );
// //       setUnreadCount((prev) => Math.max(0, prev - 1));
// //     } catch (error) {
// //       console.error(`Error marking notification ${id} as read:`, error);
// //     }
// //   };

// //   const handleMarkAllAsRead = async () => {
// //     try {
// //       if (!user || !user.id) {
// //         console.warn("User not loaded or user ID missing, cannot mark all notifications as read.");
// //         return;
// //       }
// //       await markAllNotificationsAsRead(user.id);
// //       setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
// //       setUnreadCount(0);
// //     } catch (error) {
// //       console.error("Error marking all notifications as read:", error);
// //     }
// //   };

// //   const handleDeleteNotification = async (id) => {
// //     try {
// //       await deleteNotification(id);
// //       setNotifications((prev) => prev.filter((notif) => notif._id !== id));
// //       const deletedNotif = notifications.find(notif => notif._id === id);
// //       if (deletedNotif && !deletedNotif.isRead) {
// //         setUnreadCount((prev) => Math.max(0, prev - 1));
// //       }
// //     } catch (error) {
// //       console.error(`Error deleting notification ${id}:`, error);
// //     }
// //   };

// //   const handleClearAllNotifications = async () => {
// //     try {
// //       if (!user || !user.id) {
// //         console.warn("User not loaded or user ID missing, cannot clear all notifications.");
// //         return;
// //       }
// //       await clearAllNotifications(user.id);
// //       setNotifications([]);
// //       setUnreadCount(0);
// //       setShowDropdown(false);
// //     } catch (error) {
// //       console.error("Error clearing all notifications:", error);
// //     }
// //   };

// //   const handleClickOutside = (event) => {
// //     // Close notification dropdown if click is outside
// //     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
// //       setShowDropdown(false);
// //     }
// //     // Close mobile menu if click is outside
// //     if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && event.target.closest('.hamburger-button') === null) {
// //         setIsMobileMenuOpen(false);
// //     }
// //   };

// //   const toggleMobileMenu = () => {
// //     setIsMobileMenuOpen((prev) => !prev);
// //     // Close notification dropdown if open when mobile menu is toggled
// //     if (showDropdown) setShowDropdown(false);
// //   };


// //   console.log("DashboardNavbar: Current unreadCount state:", unreadCount);
// //   console.log("DashboardNavbar: Current notifications state (array length):", notifications.length);

// //   return (
// //     <nav className="bg-white shadow px-4 md:px-6 py-0 border-b relative z-50"> {/* Added relative and z-index */}
// //       <div className="flex items-center justify-between w-full h-20"> {/* Fixed height for the navbar */}
// //         {/* Logo (left-aligned) */}
// //         <div className="h-full w-auto flex-shrink-0">
// //           <img src="/shiftrylogo.png" alt="logo" className="h-full w-[150px] object-contain py-2" /> {/* Added py-2 for vertical centering */}
// //         </div>

// //         {/* Desktop NavTabs (hidden on small screens) */}
// //         <div className="hidden md:flex flex-grow justify-center h-full"> {/* flex-grow to push tabs to center */}
// //           <NavTabs />
// //         </div>

// //         {/* Right-aligned items (Hamburger, Notification, User) */}
// //         <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0"> {/* Adjusted spacing */}
// //           {/* Hamburger Menu Icon (visible on small screens) */}
// //           <button
// //             className="md:hidden p-2 text-gray-600 hover:text-gray-900 hamburger-button" // Added class for clickOutside exclusion
// //             onClick={toggleMobileMenu}
// //             aria-label="Toggle Navigation Menu"
// //           >
// //             <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
// //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
// //             </svg>
// //           </button>

// //           {/* Notification Icon and Dropdown */}
// //           <div className="relative" ref={dropdownRef}>
// //             <button
// //               className="text-gray-600 hover:text-gray-900 text-xl relative p-2" // Added padding for better hit area
// //               onClick={toggleNotificationDropdown}
// //               aria-label="Notifications"
// //             >
// //               <img src="/notification.svg" alt="Notifications" className="w-6 h-6" />
// //               {unreadCount > 0 && (
// //                 <span
// //                   className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs"
// //                   style={{ padding: "2px 6px", minWidth: "20px", textAlign: "center", lineHeight: "1" }}
// //                 >
// //                   {unreadCount}
// //                 </span>
// //               )}
// //             </button>

// //             {showDropdown && (
// //               <div
// //                 className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden" // Adjusted width
// //                 style={{ maxHeight: '400px' }}
// //               >
// //                 <div className="px-4 py-2 border-b flex justify-between items-center text-sm"> {/* Smaller font for controls */}
// //                   <h3 className="text-lg font-semibold">Notifications</h3>
// //                   <div className="flex space-x-2">
// //                     {notifications.length > 0 && (
// //                       <button
// //                         onClick={handleClearAllNotifications}
// //                         className="text-red-600 hover:underline text-[10px]"
// //                       >
// //                         Clear All
// //                       </button>
// //                     )}
// //                     {unreadCount > 0 && (
// //                       <button
// //                         onClick={handleMarkAllAsRead}
// //                         className="text-blue-600 hover:underline text-[10px]"
// //                       >
// //                         Mark All as Read
// //                       </button>
// //                     )}
// //                   </div>
// //                 </div>
// //                 <ul className="divide-y divide-gray-200 overflow-y-auto" style={{ maxHeight: 'calc(400px - 56px)' }}>
// //                   {notifications.length === 0 ? (
// //                     <li className="p-4 text-gray-500 text-center text-sm">No notifications.</li>
// //                   ) : (
// //                     notifications.map((notif) => (
// //                       <li
// //                         key={notif._id}
// //                         className={`p-3 flex items-center justify-between transition-colors text-sm ${ // Smaller padding and font
// //                           notif.isRead ? "bg-gray-50 text-gray-600" : "bg-white font-medium text-gray-900"
// //                         }`}
// //                       >
// //                         <div>
// //                           <p className="leading-snug">{notif.message}</p>
// //                           <span className="text-xs text-gray-400 mt-1 block">
// //                             {new Date(notif.createdAt).toLocaleString()}
// //                           </span>
// //                         </div>
// //                         <div className="flex items-center space-x-2 flex-shrink-0 ml-2"> {/* Added ml-2 for spacing */}
// //                             {!notif.isRead && (
// //                                 <button
// //                                     onClick={() => handleMarkAsRead(notif._id)}
// //                                     className="flex-shrink-0 text-blue-500 hover:text-blue-700 text-xs border border-blue-500 rounded-md px-1.5 py-0.5" // Smaller button
// //                                 >
// //                                     Read
// //                                 </button>
// //                             )}
// //                             <button
// //                                 onClick={() => handleDeleteNotification(notif._id)}
// //                                 className="flex-shrink-0 text-red-500 hover:text-red-700 text-xs border border-red-500 rounded-md px-1.5 py-0.5" // Smaller button
// //                                 title="Delete Notification"
// //                             >
// //                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
// //                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
// //                                 </svg>
// //                             </button>
// //                         </div>
// //                       </li>
// //                     ))
// //                   )}
// //                 </ul>
// //               </div>
// //             )}
// //           </div>

// //           {/* User Name (Optional, can be hidden on mobile or integrated into dropdown) */}
// //           <div className="text-gray-700 font-medium hidden sm:block text-sm"> {/* Hidden on extra small screens */}
// //             {isLoading
// //               ? "Loading..."
// //               : user?.firstName
// //               ? user.firstName
// //               : "Guest"}
// //           </div>

// //           {/* User Avatar Dropdown */}
// //           <UserAvatarDropdown onLogout={logout} />
// //         </div>
// //       </div>

// //       {/* Mobile Navigation Menu (hidden by default, slides in) */}
// //       <div
// //         ref={mobileMenuRef}
// //         className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg p-6 transform transition-transform duration-300 ease-in-out z-40
// //                     md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
// //       >
// //         <button
// //           className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
// //           onClick={() => setIsMobileMenuOpen(false)}
// //           aria-label="Close menu"
// //         >
// //           <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
// //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
// //           </svg>
// //         </button>
// //         <div className="mt-8"> {/* Spacing for the close button */}
// //           <NavTabs isMobile={true} onLinkClick={() => setIsMobileMenuOpen(false)} /> {/* Pass prop to NavTabs */}
// //         </div>
// //       </div>

// //       {/* Overlay when mobile menu is open */}
// //       {isMobileMenuOpen && (
// //         <div
// //           className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
// //           onClick={() => setIsMobileMenuOpen(false)}
// //         ></div>
// //       )}
// //     </nav>
// //   );
// // }

// import React, { useState, useEffect, useRef } from "react";
// import NavTabs from "./NavTabs";
// import UserAvatarDropdown from "./UserAvatarDropdown";
// import { useAuth } from "../context/AuthContext";
// import {
//   fetchUnreadNotificationCount,
//   fetchNotifications,
//   markNotificationAsRead,
//   markAllNotificationsAsRead,
//   deleteNotification,
//   clearAllNotifications,
// } from "../api";

// export default function DashboardNavbar() {
//   const { user, isLoading, logout } = useAuth();

//   const [unreadCount, setUnreadCount] = useState(0);
//   const [notifications, setNotifications] = useState([]);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const dropdownRef = useRef(null);

//   // --- Notification Logic ---

//   useEffect(() => {
//     console.log("DashboardNavbar: useEffect triggered. User:", user, "isLoading:", isLoading);

//     if (!isLoading && user && user.id) {
//       console.log("DashboardNavbar: User is loaded and valid. Fetching initial unread count.");
//       fetchInitialUnreadCount();
//     } else if (!isLoading && !user) {
//       console.log("DashboardNavbar: User not logged in, skipping notification fetch.");
//     }

//     document.addEventListener("mousedown", handleClickOutside);

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [user, isLoading]);

//   const fetchInitialUnreadCount = async () => {
//     if (!user || !user.id) {
//       console.warn("fetchInitialUnreadCount: User or user ID missing. Aborting fetch.");
//       setUnreadCount(0);
//       return;
//     }

//     try {
//       console.log("fetchInitialUnreadCount: Calling fetchUnreadNotificationCount API...");
//       // FIX 1: Directly use the data returned by api.js function
//       const responseData = await fetchUnreadNotificationCount(user.id);
//       console.log("fetchInitialUnreadCount: API Response (direct data):", responseData);

//       if (responseData && typeof responseData.count === 'number') {
//         console.log("fetchInitialUnreadCount: Successfully received count:", responseData.count);
//         setUnreadCount(responseData.count);
//       } else {
//         console.warn("fetchInitialUnreadCount: Expected unread count data to have a 'count' property, but received:", responseData);
//         setUnreadCount(0);
//       }
//     } catch (error) {
//       console.error("fetchInitialUnreadCount: Error fetching initial unread count:", error.response?.data || error.message);
//       setUnreadCount(0);
//     }
//   };

//   const fetchAllNotifications = async () => {
//     if (!user || !user.id) {
//       console.warn("fetchAllNotifications: User or user ID missing. Aborting fetch.");
//       setNotifications([]);
//       return;
//     }

//     try {
//       console.log("fetchAllNotifications: Calling fetchNotifications API...");
//       // FIX 2: Directly use the data returned by api.js function
//       const data = await fetchNotifications(user.id) || [];
//       console.log("fetchAllNotifications: API Response (direct data):", data);

//       if (Array.isArray(data)) {
//         console.log("fetchAllNotifications: Received array of notifications, count:", data.length);
//         const sortedNotifications = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//         setNotifications(sortedNotifications);
//       } else {
//         console.error("fetchAllNotifications: Expected an array of notifications, but received non-array data:", data);
//         setNotifications([]);
//       }
//     } catch (error) {
//       console.error("fetchAllNotifications: Error fetching all notifications:", error.response?.data || error.message);
//       setNotifications([]);
//     }
//   };

//   const toggleDropdown = async () => {
//     console.log("toggleDropdown: showDropdown was:", showDropdown);
//     if (!showDropdown) {
//       console.log("toggleDropdown: Dropdown is about to open, fetching all notifications.");
//       await fetchAllNotifications();
//     }
//     setShowDropdown((prev) => !prev);
//     console.log("toggleDropdown: showDropdown is now:", !showDropdown);
//   };

//   const handleMarkAsRead = async (id) => {
//     try {
//       await markNotificationAsRead(id);
//       setNotifications((prev) =>
//         prev.map((notif) => (notif._id === id ? { ...notif, isRead: true } : notif))
//       );
//       setUnreadCount((prev) => Math.max(0, prev - 1));
//     } catch (error) {
//       console.error(`Error marking notification ${id} as read:`, error);
//     }
//   };

//   const handleMarkAllAsRead = async () => {
//     try {
//       if (!user || !user.id) {
//         console.warn("User not loaded or user ID missing, cannot mark all notifications as read.");
//         return;
//       }
//       await markAllNotificationsAsRead(user.id);
//       setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
//       setUnreadCount(0);
//     } catch (error) {
//       console.error("Error marking all notifications as read:", error);
//     }
//   };

//   const handleDeleteNotification = async (id) => {
//     try {
//       await deleteNotification(id);
//       setNotifications((prev) => prev.filter((notif) => notif._id !== id));
//       const deletedNotif = notifications.find(notif => notif._id === id);
//       if (deletedNotif && !deletedNotif.isRead) {
//         setUnreadCount((prev) => Math.max(0, prev - 1));
//       }
//     } catch (error) {
//       console.error(`Error deleting notification ${id}:`, error);
//     }
//   };

//   const handleClearAllNotifications = async () => {
//     try {
//       if (!user || !user.id) {
//         console.warn("User not loaded or user ID missing, cannot clear all notifications.");
//         return;
//       }
//       await clearAllNotifications(user.id);
//       setNotifications([]);
//       setUnreadCount(0);
//       setShowDropdown(false);
//     } catch (error) {
//       console.error("Error clearing all notifications:", error);
//     }
//   };

//   const handleClickOutside = (event) => {
//     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//       setShowDropdown(false);
//     }
//   };

//   console.log("DashboardNavbar: Current unreadCount state:", unreadCount);
//   console.log("DashboardNavbar: Current notifications state (array length):", notifications.length);

//   return (
//     <nav className="bg-white shadow px-6 py-4 border-b">
//       <div className="flex items-center justify-between w-full">
//         <div className="h-20 w-48">
//           <img src="/shiftrylogo.png" alt="logo" className="h-full w-[150px] object-contain" />
//         </div>

//         <NavTabs />

//         <div className="flex items-center space-x-4">
//           <div className="relative" ref={dropdownRef}>
//             <button
//               className="text-gray-600 hover:text-gray-900 text-xl relative"
//               onClick={toggleDropdown}
//               aria-label="Notifications"
//             >
//               <img src="/notification.svg" alt="Notifications" className="w-6 h-6" />
//               {unreadCount > 0 && (
//                 <span
//                   className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs"
//                   style={{ padding: "2px 6px", minWidth: "20px", textAlign: "center", lineHeight: "1" }}
//                 >
//                   {unreadCount}
//                 </span>
//               )}
//             </button>

//             {showDropdown && (
//               <div
//                 className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
//                 style={{ maxHeight: '400px' }}
//               >
//                 <div className="px-4 py-2 border-b flex justify-between items-center">
//                   <h3 className="text-lg font-semibold">Notifications</h3>
//                   {notifications.length > 0 && (
//                     <button
//                       onClick={handleClearAllNotifications}
//                       className="text-red-600 hover:underline text-sm"
//                     >
//                       Clear All
//                     </button>
//                   )}
//                   {unreadCount > 0 && (
//                     <button
//                       onClick={handleMarkAllAsRead}
//                       className="text-blue-600 hover:underline text-sm ml-2"
//                     >
//                       Mark All as Read
//                     </button>
//                   )}
//                 </div>
//                 <ul className="divide-y divide-gray-200 overflow-y-auto" style={{ maxHeight: 'calc(400px - 56px)' }}>
//                   {notifications.length === 0 ? (
//                     <li className="p-4 text-gray-500 text-center">No notifications.</li>
//                   ) : (
//                     notifications.map((notif) => (
//                       <li
//                         key={notif._id}
//                         className={`p-4 flex items-center justify-between transition-colors ${
//                           notif.isRead ? "bg-gray-50 text-gray-600" : "bg-white font-medium text-gray-900"
//                         }`}
//                       >
//                         <div>
//                           <p className="text-sm leading-snug">{notif.message}</p>
//                           <span className="text-xs text-gray-400 mt-1 block">
//                             {new Date(notif.createdAt).toLocaleString()}
//                           </span>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                             {!notif.isRead && (
//                                 <button
//                                     onClick={() => handleMarkAsRead(notif._id)}
//                                     className="flex-shrink-0 text-blue-500 hover:text-blue-700 text-sm border border-blue-500 rounded-md px-2 py-1"
//                                 >
//                                     Mark Read
//                                 </button>
//                             )}
//                             <button
//                                 onClick={() => handleDeleteNotification(notif._id)}
//                                 className="flex-shrink-0 text-red-500 hover:text-red-700 text-sm border border-red-500 rounded-md px-2 py-1"
//                                 title="Delete Notification"
//                             >
//                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                 </svg>
//                             </button>
//                         </div>
//                       </li>
//                     ))
//                   )}
//                 </ul>
//               </div>
//             )}
//           </div>

//           {/* User Name and Dropdown */}
//           <div className="text-gray-700 font-medium">
//             {isLoading
//               ? "Loading..."
//               : user?.firstName
//               ? user.firstName
//               : "Guest"}
//           </div>

//           <UserAvatarDropdown onLogout={logout} />
//         </div>
//       </div>
//     </nav>
//   );
// }


import React, { useState, useEffect, useRef } from "react";
import NavTabs from "./NavTabs"; // Assuming NavTabs component exists
import UserAvatarDropdown from "./UserAvatarDropdown"; // Assuming UserAvatarDropdown component exists
import { useAuth } from "../context/AuthContext";
import {
  fetchUnreadNotificationCount,
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../api"; // Assuming api.js functions exist

export default function DashboardNavbar() {
  const { user, isLoading, logout } = useAuth();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false); // For Notification dropdown
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // For mobile navigation menu
  const dropdownRef = useRef(null); // For Notification dropdown
  const mobileMenuRef = useRef(null); // For mobile menu (NavTabs)

  // --- Notification Logic ---

  useEffect(() => {
    // console.log("DashboardNavbar: useEffect triggered. User:", user, "isLoading:", isLoading);

    if (!isLoading && user && user.id) {
      // console.log("DashboardNavbar: User is loaded and valid. Fetching initial unread count.");
      fetchInitialUnreadCount();
    } else if (!isLoading && !user) {
      // console.log("DashboardNavbar: User not logged in, skipping notification fetch.");
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [user, isLoading]);

  const fetchInitialUnreadCount = async () => {
    if (!user || !user.id) {
      // console.warn("fetchInitialUnreadCount: User or user ID missing. Aborting fetch.");
      setUnreadCount(0);
      return;
    }

    try {
      // console.log("fetchInitialUnreadCount: Calling fetchUnreadNotificationCount API...");
      const responseData = await fetchUnreadNotificationCount(user.id);
      // console.log("fetchInitialUnreadCount: API Response (direct data):", responseData);

      if (responseData && typeof responseData.count === 'number') {
        // console.log("fetchInitialUnreadCount: Successfully received count:", responseData.count);
        setUnreadCount(responseData.count);
      } else {
        // console.warn("fetchInitialUnreadCount: Expected unread count data to have a 'count' property, but received:", responseData);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("fetchInitialUnreadCount: Error fetching initial unread count:", error.response?.data || error.message);
      setUnreadCount(0);
    }
  };

  const fetchAllNotifications = async () => {
    if (!user || !user.id) {
      // console.warn("fetchAllNotifications: User or user ID missing. Aborting fetch.");
      setNotifications([]);
      return;
    }

    try {
      // console.log("fetchAllNotifications: Calling fetchNotifications API...");
      const data = await fetchNotifications(user.id) || [];
      // console.log("fetchAllNotifications: API Response (direct data):", data);

      if (Array.isArray(data)) {
        // console.log("fetchAllNotifications: Received array of notifications, count:", data.length);
        const sortedNotifications = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotifications(sortedNotifications);
      } else {
        console.error("fetchAllNotifications: Expected an array of notifications, but received non-array data:", data);
        setNotifications([]);
      }
    } catch (error) {
      console.error("fetchAllNotifications: Error fetching all notifications:", error.response?.data || error.message);
      setNotifications([]);
    }
  };

  const toggleNotificationDropdown = async () => {
    // console.log("toggleNotificationDropdown: showDropdown was:", showDropdown);
    if (!showDropdown) {
      // console.log("toggleNotificationDropdown: Dropdown is about to open, fetching all notifications.");
      await fetchAllNotifications();
    }
    setShowDropdown((prev) => !prev);
    // Close mobile menu if open when notification dropdown is toggled
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    // console.log("toggleNotificationDropdown: showDropdown is now:", !showDropdown);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) => (notif._id === id ? { ...notif, isRead: true } : notif))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      if (!user || !user.id) {
        console.warn("User not loaded or user ID missing, cannot mark all notifications as read.");
        return;
      }
      await markAllNotificationsAsRead(user.id);
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((notif) => notif._id !== id));
      const deletedNotif = notifications.find(notif => notif._id === id);
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error(`Error deleting notification ${id}:`, error);
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      if (!user || !user.id) {
        console.warn("User not loaded or user ID missing, cannot clear all notifications.");
        return;
      }
      await clearAllNotifications(user.id);
      setNotifications([]);
      setUnreadCount(0);
      setShowDropdown(false);
    } catch (error) {
      console.error("Error clearing all notifications:", error);
    }
  };

  const handleClickOutside = (event) => {
    // Close notification dropdown if click is outside
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
    // Close mobile menu if click is outside and not on the hamburger button itself
    if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && event.target.closest('.hamburger-button') === null) {
        setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    // Close notification dropdown if open when mobile menu is toggled
    if (showDropdown) setShowDropdown(false);
  };


  // console.log("DashboardNavbar: Current unreadCount state:", unreadCount);
  // console.log("DashboardNavbar: Current notifications state (array length):", notifications.length);

  return (
    <nav className="bg-white shadow px-4 md:px-6 py-0 border-b relative z-50"> {/* Adjusted padding, added relative and z-index */}
      <div className="flex items-center justify-between w-full h-20"> {/* Fixed height for the navbar */}
        {/* Logo (left-aligned) */}
        <div className="h-full w-auto flex-shrink-0">
          <img src="/shiftrylogo.png" alt="logo" className="h-full w-[150px] object-contain py-2" /> {/* Added py-2 for vertical centering */}
        </div>

        {/* Desktop NavTabs (hidden on small screens) */}
        <div className="hidden md:flex flex-grow justify-center h-full"> {/* flex-grow to push tabs to center */}
          <NavTabs />
        </div>

        {/* Right-aligned items (Hamburger, Notification, User) */}
        <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0"> {/* Adjusted spacing */}
          {/* Hamburger Menu Icon (visible on small screens) */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 hamburger-button" // Added class for clickOutside exclusion
            onClick={toggleMobileMenu}
            aria-label="Toggle Navigation Menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Notification Icon and Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="text-gray-600 hover:text-gray-900 text-xl relative p-2" // Added padding for better hit area
              onClick={toggleNotificationDropdown}
              aria-label="Notifications"
            >
              <img src="/notification.svg" alt="Notifications" className="w-6 h-6" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs"
                  style={{ padding: "2px 6px", minWidth: "20px", textAlign: "center", lineHeight: "1" }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {showDropdown && (
              <div
                className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden" // Adjusted width
                style={{ maxHeight: '400px' }} // Default max height
              >
                <div className="px-4 py-2 border-b flex justify-between items-center text-sm"> {/* Smaller font for controls */}
                  <h3 className="text-lg font-semibold">Notifications</h3>
                  <div className="flex space-x-2">
                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearAllNotifications}
                        className="text-red-600 hover:underline text-[10px]"
                      >
                        Clear All
                      </button>
                    )}
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-blue-600 hover:underline text-[10px]"
                      >
                        Mark All as Read
                      </button>
                    )}
                  </div>
                </div>
                <ul className="divide-y divide-gray-200 overflow-y-auto" style={{ maxHeight: 'calc(400px - 56px)' }}>
                  {notifications.length === 0 ? (
                    <li className="p-4 text-gray-500 text-center text-sm">No notifications.</li>
                  ) : (
                    notifications.map((notif) => (
                      <li
                        key={notif._id}
                        className={`p-3 flex items-center justify-between transition-colors text-sm ${ // Smaller padding and font
                          notif.isRead ? "bg-gray-50 text-gray-600" : "bg-white font-medium text-gray-900"
                        }`}
                      >
                        <div>
                          <p className="leading-snug">{notif.message}</p>
                          <span className="text-xs text-gray-400 mt-1 block">
                            {new Date(notif.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0 ml-2"> {/* Added ml-2 for spacing */}
                            {!notif.isRead && (
                                <button
                                    onClick={() => handleMarkAsRead(notif._id)}
                                    className="flex-shrink-0 text-blue-500 hover:text-blue-700 text-xs border border-blue-500 rounded-md px-1.5 py-0.5" // Smaller button
                                >
                                    Read
                                </button>
                            )}
                            <button
                                onClick={() => handleDeleteNotification(notif._id)}
                                className="flex-shrink-0 text-red-500 hover:text-red-700 text-xs border border-red-500 rounded-md px-1.5 py-0.5" // Smaller button
                                title="Delete Notification"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* User Name (Optional, can be hidden on mobile or integrated into dropdown) */}
          <div className="text-gray-700 font-medium hidden sm:block text-sm"> {/* Hidden on extra small screens */}
            {isLoading
              ? "Loading..."
              : user?.firstName
              ? user.firstName
              : "Guest"}
          </div>

          {/* User Avatar Dropdown */}
          <UserAvatarDropdown onLogout={logout} />
        </div>
      </div>

      {/* Mobile Navigation Menu (hidden by default, slides in) */}
      <div
        ref={mobileMenuRef}
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg p-6 transform transition-transform duration-300 ease-in-out z-40
                    md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="mt-8"> {/* Spacing for the close button */}
          {/* Assuming NavTabs can handle a prop like isMobile to render differently if needed */}
          <NavTabs isMobile={true} onLinkClick={() => setIsMobileMenuOpen(false)} />
        </div>
      </div>

      {/* Overlay when mobile menu is open */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
}
