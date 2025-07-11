

// import React, { useState, useEffect, useContext } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { AuthContext } from '../context/AuthContext'; // Import your AuthContext

// // Define all possible tabs
// const allTabs = ["Me", "News Feed", "Locations", "People", "Schedule", "Open Schedules", "Reports", "Super Admin"];

// // Map routes to tab names for precise matching
// const routeToTabMap = {
//     "/me": "Me",
//     "/newsfeed": "News Feed",
//     "/locations": "Locations",
//     "/people": "People",
//     "/schedule": "Schedule",
//     "/openschedules": "Open Schedules",
//     "/reports": "Reports",
//     "/superadmin": "Super Admin" // Ensure this route matches your SuperAdminPage
// };

// // Add prop `isMobile` to control rendering for mobile view
// // Add prop `onLinkClick` to handle closing the mobile menu after a link is clicked
// export default function NavTabs({ isMobile, onLinkClick }) {
//     const navigate = useNavigate();
//     const location = useLocation();
//     const currentPath = location.pathname.toLowerCase();
//     const { user } = useContext(AuthContext); // Get the user object from AuthContext

//     // Function to determine the active tab based on the current path
//     const getTab = () => {
//         const matchingTab = routeToTabMap[currentPath] ||
//             Object.keys(routeToTabMap).find(key => currentPath.startsWith(key))
//             ? routeToTabMap[Object.keys(routeToTabMap).find(key => currentPath.startsWith(key))]
//             : "Me"; // Default to "Me" if no match
//         return matchingTab;
//     };

//     const [activeTab, setActiveTab] = useState(getTab());

//     // Update activeTab whenever the URL changes
//     useEffect(() => {
//         const newActiveTab = getTab();
//         setActiveTab(newActiveTab);
//     }, [currentPath]); // Re-run when currentPath changes

//     const handleTabClick = (tab) => {
//         setActiveTab(tab);
//         navigate(`/${tab.toLowerCase().replace(" ", "")}`);
//         if (onLinkClick) { // Call the provided callback to close the mobile menu
//             onLinkClick();
//         }
//     };

//     // Filter tabs based on user role
//     const filteredTabs = allTabs.filter(tab => {
//         if (user && user.role === 'superadmin') {
//             // If the user is a superadmin, ONLY show the "Super Admin" tab
//             return tab === "Super Admin";
//         } else {
//             // If the user is NOT a superadmin (e.g., admin, employee, or not logged in),
//             // show all tabs EXCEPT "Super Admin"
//             return tab !== "Super Admin";
//         }
//     });
//     return (
//         // Conditional styling based on isMobile prop
//         <div className={`flex ${isMobile ? 'flex-col space-y-2 w-full' : 'items-center space-x-4'}`}>
//             {filteredTabs.map((tab) => ( // Use filteredTabs here
//                 <button
//                     key={tab}
//                     onClick={() => handleTabClick(tab)}
//                     className={`
//                         transition duration-200 ease-in-out
//                         ${isMobile
//                             ? `w-full text-left py-2 px-4 rounded-md text-base
//                                 ${activeTab === tab
//                                     ? "bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600"
//                                     : "text-gray-700 hover:bg-gray-100"
//                                 }`
//                             : `text-sm px-3 py-1 rounded
//                                 ${activeTab === tab
//                                     ? "bg-blue-100 text-blue-700 border-b-[3px] border-blue-500"
//                                     : "text-gray-600 hover:text-gray-900"
//                                 }`
//                         }
//                     `}
//                 >
//                     {tab}
//                 </button>
//             ))}
//         </div>
//     );
// }


import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from '../context/AuthContext'; // Import your AuthContext

// Define all possible tabs
const allTabs = ["Me", "News Feed", "Locations", "People", "Schedule", "Open Schedules", "Reports", "Super Admin"];

// Map routes to tab names for precise matching
const routeToTabMap = {
    "/me": "Me",
    "/newsfeed": "News Feed",
    "/locations": "Locations",
    "/people": "People",
    "/schedule": "Schedule",
    "/openschedules": "Open Schedules",
    "/reports": "Reports",
    "/superadmin": "Super Admin" // Ensure this route matches your SuperAdminPage
};

// Add prop `isMobile` to control rendering for mobile view
// Add prop `onLinkClick` to handle closing the mobile menu after a link is clicked
export default function NavTabs({ isMobile, onLinkClick }) {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname.toLowerCase();
    const { user } = useContext(AuthContext); // Get the user object from AuthContext

    // Function to determine the active tab based on the current path
    const getTab = () => {
        const matchingTab = routeToTabMap[currentPath] ||
            Object.keys(routeToTabMap).find(key => currentPath.startsWith(key))
            ? routeToTabMap[Object.keys(routeToTabMap).find(key => currentPath.startsWith(key))]
            : "Me"; // Default to "Me" if no match
        return matchingTab;
    };

    const [activeTab, setActiveTab] = useState(getTab());

    // Update activeTab whenever the URL changes
    useEffect(() => {
        const newActiveTab = getTab();
        setActiveTab(newActiveTab);
    }, [currentPath]); // Re-run when currentPath changes

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        navigate(`/${tab.toLowerCase().replace(" ", "")}`);
        if (onLinkClick) { // Call the provided callback to close the mobile menu
            onLinkClick();
        }
    };

    // Filter tabs based on user role
    const filteredTabs = allTabs.filter(tab => {
        if (user && user.role === 'superadmin') {
            // If the user is a superadmin, ONLY show the "Super Admin" tab
            return tab === "Super Admin";
        } else {
            // If the user is NOT a superadmin (e.g., admin, employee, or not logged in),
            // show all tabs EXCEPT "Super Admin"
            return tab !== "Super Admin";
        }
    });
    return (
        // Conditional styling based on isMobile prop
        <div className={`flex ${isMobile ? 'flex-col space-y-2 w-full' : 'items-center space-x-4'}`}>
            {filteredTabs.map((tab) => ( // Use filteredTabs here
                <button
                    key={tab}
                    onClick={() => handleTabClick(tab)}
                    className={`
                        transition duration-200 ease-in-out
                        ${isMobile
                            ? `w-full text-left py-2 px-4 rounded-md text-base
                                ${activeTab === tab
                                    ? "bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`
                            : `text-sm px-3 py-1 rounded
                                ${activeTab === tab
                                    ? "bg-blue-100 text-blue-700 border-b-[3px] border-blue-500"
                                    : "text-gray-600 hover:text-gray-900"
                                }`
                        }
                    `}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
}
