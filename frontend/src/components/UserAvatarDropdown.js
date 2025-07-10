// src/components/UserAvatarDropdown.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import useAuth

export default function UserAvatarDropdown({ onLogout }) {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const { user, isLoading } = useAuth(); // ✅ Get user and isLoading from AuthContext

    // Define a default/fallback image URL
    const defaultProfilePicture = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

    const toggleDropdown = () => setIsOpen(!isOpen);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (isOpen && !event.target.closest('.relative')) { // Assuming the dropdown is contained within a div with relative positioning
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isOpen]);


    return (
        <div className="relative">
            <div
                className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 shadow-sm cursor-pointer"
                onClick={toggleDropdown}
            >
                {isLoading ? (
                    // Show a loading state or placeholder while user data is loading
                    <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center text-xs text-gray-500">
                        {/* Optionally a spinner or just background */}
                    </div>
                ) : (
                    <img
                        // Use the user's profile picture from AuthContext, or the default if not available
                        src={user?.profilePicture || defaultProfilePicture}
                        alt={`${user?.firstName || 'User'}'s Profile Icon`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.onerror = null; // Prevent infinite loop if fallback also fails
                            e.target.src = defaultProfilePicture; // Fallback to a default image
                        }}
                    />
                )}
            </div>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-50">
                    <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                            navigate("/profile");
                            setIsOpen(false);
                        }}
                    >
                        Profile
                    </button>
                    {user && user.role === 'admin' && (<button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                            navigate("/businessprofile"); // Consider if this route is appropriate in a logged-in user's dropdown
                            setIsOpen(false);
                        }}
                    >
                        Business Profile
                    </button>)}
                    <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                            navigate("/forgot-password"); // Consider if this route is appropriate in a logged-in user's dropdown
                            setIsOpen(false);
                        }}
                    >
                        Forgot Password
                    </button>
                    <button
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
                        onClick={() => {
                            onLogout();
                            setIsOpen(false);
                        }}
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}