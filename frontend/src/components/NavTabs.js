// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";

// const tabs = ["Me", "News Feed", "Locations", "People", "Schedule", "Open Schedules", "Reports"];

// // Map routes to tab names for precise matching
// const routeToTabMap = {
//   "/me": "Me",
//   "/newsfeed": "News Feed",
//   "/locations": "Locations",
//   "/people": "People",
//   "/schedule": "Schedule",
//   "/openschedules": "Open Schedules",
//   "/reports": "Reports",
// };

// export default function NavTabs() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const currentPath = location.pathname.toLowerCase();

//   // Function to determine the active tab based on the current path
//   const getTab = () => {
//     // Look for an exact match in the routeToTabMap
//     const matchingTab = routeToTabMap[currentPath] || 
//       Object.keys(routeToTabMap).find(key => currentPath.startsWith(key))
//         ? routeToTabMap[Object.keys(routeToTabMap).find(key => currentPath.startsWith(key))]
//         : "Me"; // Default to "Me" if no match
//     console.log('Current path:', currentPath, 'Active tab:', matchingTab); // Debug log
//     return matchingTab;
//   };

//   const [activeTab, setActiveTab] = useState(getTab());

//   // Update activeTab whenever the URL changes
//   useEffect(() => {
//     const newActiveTab = getTab();
//     setActiveTab(newActiveTab);
//   }, [currentPath]); // Re-run when currentPath changes

//   const handleTabClick = (tab) => {
//     setActiveTab(tab);
//     navigate(`/${tab.toLowerCase().replace(" ", "")}`);
//   };

//   return (
//     <div className="flex items-center space-x-4">
//       {tabs.map((tab) => (
//         <button
//           key={tab}
//           onClick={() => handleTabClick(tab)}
//           className={`text-sm px-3 py-1 rounded transition ${
//             activeTab === tab
//               ? "bg-blue-100 text-blue-700 border-b-[3px] border-blue-500"
//               : "text-gray-600 hover:text-gray-900"
//           }`}
//         >
//           {tab}
//         </button>
//       ))}
//     </div>
//   );
// }


import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const tabs = ["Me", "News Feed", "Locations", "People", "Schedule", "Open Schedules", "Reports"];

// Map routes to tab names for precise matching
const routeToTabMap = {
  "/me": "Me",
  "/newsfeed": "News Feed",
  "/locations": "Locations",
  "/people": "People",
  "/schedule": "Schedule",
  "/openschedules": "Open Schedules",
  "/reports": "Reports",
};

// Add prop `isMobile` to control rendering for mobile view
// Add prop `onLinkClick` to handle closing the mobile menu after a link is clicked
export default function NavTabs({ isMobile, onLinkClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase();

  // Function to determine the active tab based on the current path
  const getTab = () => {
    // Look for an exact match in the routeToTabMap
    const matchingTab = routeToTabMap[currentPath] ||
      Object.keys(routeToTabMap).find(key => currentPath.startsWith(key))
        ? routeToTabMap[Object.keys(routeToTabMap).find(key => currentPath.startsWith(key))]
        : "Me"; // Default to "Me" if no match
    // console.log('Current path:', currentPath, 'Active tab:', matchingTab); // Debug log
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

  return (
    // Conditional styling based on isMobile prop
    <div className={`flex ${isMobile ? 'flex-col space-y-2 w-full' : 'items-center space-x-4'}`}>
      {tabs.map((tab) => (
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