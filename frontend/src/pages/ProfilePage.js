

// // src/pages/ProfilePage.js
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { updateUserProfile } from '../api'; // Assuming you have this API call
// import { useAuth } from '../context/AuthContext'; // Import useAuth!

// // Import the new components
// import UserProfileContent from './UserProfileContent';
// import LeaveApplicationForm from './LeaveApplicationForm';

// export default function ProfilePage() {
//     const navigate = useNavigate();
    
//     const { user, isLoading, updateUser } = useAuth(); 
    
//     const [firstName, setFirstName] = useState('');
//     const [lastName, setLastName] = useState('');
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [message, setMessage] = useState('');
//     const [error, setError] = useState('');
//     const [isUpdating, setIsUpdating] = useState(false); 

//     // State to manage which tab is active: 'profile' or 'leaves'
//     const [activeTab, setActiveTab] = useState('profile');

//     useEffect(() => {
//         if (user) {
//             setFirstName(user.firstName || '');
//             setLastName(user.lastName || '');
//         }
//     }, [user]);

//     if (isLoading) {
//         return <div className="text-center mt-20 text-lg">Loading profile...</div>;
//     }

//     if (!user) {
//         navigate('/login'); 
//         return null;
//     }

//     const handleFileChange = (event) => {
//         const file = event.target.files[0];
//         setSelectedFile(file);
//         console.log("[Frontend] Selected file in handleFileChange:", file);
//         setError('');
//     };

//     const handleProfileUpdate = async (event) => {
//         event.preventDefault();
//         setIsUpdating(true);
//         setMessage('');
//         setError('');

//         const formData = new FormData();
//         if (selectedFile) {
//             formData.append('profilePicture', selectedFile);
//         }
//         formData.append('firstName', firstName);
//         formData.append('lastName', lastName);

//         console.log("[Frontend] FormData content before API call:");
//         for (let [key, value] of formData.entries()) {
//             console.log(`${key}:`, value);
//         }

//         try {
//             const response = await updateUserProfile(formData);
//             setIsUpdating(false);

//             if (response.status === 200) {
//                 setMessage(response.data.message);
                
//                 console.log("ProfilePage: API success, response.data.user:", response.data.user); 
//                 updateUser(response.data.user); 
//                 console.log("ProfilePage: updateUser called from AuthContext.");
                
//                 setFirstName(response.data.user.firstName);
//                 setLastName(response.data.user.lastName);

//                 setSelectedFile(null);
//                 document.getElementById('profilePicture').value = '';
//             } else {
//                 setError(response.data?.message || 'Failed to update profile.');
//             }
//         } catch (err) {
//             setIsUpdating(false);
//             const errMsg = err.response?.data?.message || 'Network error or server unavailable.';
//             setError(errMsg);
//             console.error('Profile update error:', err);
//         }
//     };
    
//     return (
//         <div className="flex min-h-screen bg-gray-100"> {/* Main container with flex */}
//             {/* Sidebar */}
//             <aside className="w-64 bg-white-800 text-white flex flex-col p-4">
//                 <div className="mb-8">
//                     <h3 className="text-xl text-black font-semibold mb-4">Dashboard</h3>
//                     <nav>
//                         <ul>
//                             <li className="mb-2">
//                                 <button
//                                     onClick={() => setActiveTab('profile')}
//                                     className={`w-full text-left py-2 px-4 rounded-md transition-colors duration-200 text-black
//                                         ${activeTab === 'profile' ? 'bg-blue-600 text-black' : 'hover:bg-orange-400'}`}
//                                 >
//                                     User Profile
//                                 </button>
//                             </li>
//                             <li className="mb-2">
//                                 <button
//                                     onClick={() => setActiveTab('leaves')}
//                                     className={`w-full text-left py-2 px-4 rounded-md transition-colors duration-200 text-black
//                                         ${activeTab === 'leaves' ? 'bg-blue-600 text-black' : 'hover:bg-orange-400'}`}
//                                 >
//                                     Leaves
//                                 </button>
//                             </li>
//                             {/* Add more sidebar items here if needed */}
//                         </ul>
//                     </nav>
//                 </div>
//             </aside>

//             {/* Main Content Area */}
//             <main className="flex-1 p-6 overflow-y-auto">
//                 {activeTab === 'profile' && (
//                     <UserProfileContent
//                         user={user}
//                         firstName={firstName}
//                         setFirstName={setFirstName}
//                         lastName={lastName}
//                         setLastName={setLastName}
//                         selectedFile={selectedFile}
//                         handleFileChange={handleFileChange}
//                         message={message}
//                         error={error}
//                         handleProfileUpdate={handleProfileUpdate}
//                         isUpdating={isUpdating}
//                     />
//                 )}
//                 {activeTab === 'leaves' && (
//                     <LeaveApplicationForm />
//                 )}
//             </main>
//         </div>
//     );
// }

// // src/pages/ProfilePage.js
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { updateUserProfile } from '../api'; // Only updateUserProfile is needed here
// import { useAuth } from '../context/AuthContext'; // Import useAuth!

// export default function ProfilePage() {
//     const navigate = useNavigate();
    
//     // ✅ This is the correct way to get the user and loading state
//     // from your centralized AuthContext.
//     const { user, isLoading, updateUser } = useAuth(); 
    

//     // Local state for the form inputs (firstName, lastName) and file selection.
//     // These are *local* to the form, but their initial values are set from the global 'user' object.
//     const [firstName, setFirstName] = useState('');
//     const [lastName, setLastName] = useState('');
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [message, setMessage] = useState('');
//     const [error, setError] = useState('');
    
//     // Use a separate loading state specifically for the profile *update submission*.
//     // This is different from the global 'isLoading' which refers to the *initial authentication load*.
//     const [isUpdating, setIsUpdating] = useState(false); 

//     // --- Synchronize Local Form State with Global User Data ---
//     // This useEffect will run whenever the 'user' object from AuthContext changes.
//     // It ensures that the form fields are pre-filled with the current user's data.
//     useEffect(() => {
//         if (user) {
//             setFirstName(user.firstName || ''); // Initialize with current user's first name
//             setLastName(user.lastName || '');   // Initialize with current user's last name
//         }
//     }, [user]); // Dependency on 'user' ensures this effect reacts to changes in the global user object

//     // --- Handle Initial Page Loading and Authentication Status ---
//     // If the AuthContext is still loading the user data, show a loading message.
//     // This covers the initial fetch or token validation.
//     if (isLoading) {
//         return <div className="text-center mt-20 text-lg">Loading profile...</div>;
//     }

//     // If the AuthContext has finished loading (isLoading is false) but no user object is available,
//     // it means the user is not authenticated or their session is invalid. Redirect them to login.
//     if (!user) {
//         navigate('/login'); 
//         return null; // Don't render the profile content if we're redirecting
//     }

//     // --- File Input Change Handler ---
//     const handleFileChange = (event) => {
//         const file = event.target.files[0];
//         setSelectedFile(file);
//         console.log("[Frontend] Selected file in handleFileChange:", file);
//         setError(''); // Clear any previous file-related errors when a new file is chosen
//     };

//     // --- Profile Update Form Submission Handler ---
//     const handleProfileUpdate = async (event) => {
//         event.preventDefault(); // Prevent default browser form submission (page reload)
//         setIsUpdating(true); // Start the local update loading animation
//         setMessage('');      // Clear previous success messages
//         setError('');        // Clear previous error messages

//         const formData = new FormData();
//         if (selectedFile) {
//             formData.append('profilePicture', selectedFile); // Add the selected image file
//         }
//         formData.append('firstName', firstName); // Add the first name from the form
//         formData.append('lastName', lastName);   // Add the last name from the form

//         console.log("[Frontend] FormData content before API call:");
//         for (let [key, value] of formData.entries()) {
//             console.log(`${key}:`, value); // Log form data for debugging
//         }

//         try {
//             // Call your API to update the user profile.
//             // Your API should be set up to send the token automatically (e.g., via Axios interceptors).
//             const response = await updateUserProfile(formData);
//             setIsUpdating(false); // Stop the local update loading animation

//             if (response.status === 200) {
//                 setMessage(response.data.message); // Display success message
                
//                 console.log("ProfilePage: API success, response.data.user:", response.data.user); 
//                 updateUser(response.data.user); 
//                 console.log("ProfilePage: updateUser called from AuthContext.");
                
//                 // Also update the local form states to show the new data immediately in the inputs.
//                 setFirstName(response.data.user.firstName);
//                 setLastName(response.data.user.lastName);

//                 setSelectedFile(null); // Clear the selected file from state
//                 document.getElementById('profilePicture').value = ''; // Clear the file input visually
//             } else {
//                 // Handle non-successful API responses
//                 setError(response.data?.message || 'Failed to update profile.');
//             }
//         } catch (err) {
//             // Handle network errors or errors thrown during the API call
//             setIsUpdating(false);
//             const errMsg = err.response?.data?.message || 'Network error or server unavailable.';
//             setError(errMsg);
//             console.error('Profile update error:', err);
            
//         }
//     };
    
//     return (
//         <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
//             <h2 className="text-2xl font-bold mb-6 text-center">User Profile</h2>
//             {message && <p className="text-green-600 text-center mb-4">{message}</p>}
//             {error && <p className="text-red-600 text-center mb-4">{error}</p>}

//             {/* Profile Picture and User Info Display */}
//             {/* These elements now consistently display data from the 'user' object provided by AuthContext */}
//             <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-400 shadow-md mx-auto mb-4">
//                 <img
//                     src={user.profilePicture} // Display current profile picture from AuthContext's user
//                     alt="Profile"
//                     className="w-full h-full object-cover"
//                     onError={(e) => {
//                         e.target.onerror = null; // Prevent infinite loop if fallback also fails
//                         e.target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'; // Fallback to a default image
//                     }}
//                 />
//             </div>
//             <p className="text-xl font-semibold mt-4 text-center">{user.firstName} {user.lastName}</p>
//             <p className="text-gray-600 text-center">{user.emailId}</p>
//             <p className="text-gray-500 capitalize text-center">Role: {user.role}</p>

//             {/* Profile Update Form */}
//             <form onSubmit={handleProfileUpdate} className="space-y-4 mt-6">
//                 <div>
//                     <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
//                         First Name
//                     </label>
//                     <input
//                         type="text"
//                         id="firstName"
//                         name="firstName"
//                         value={firstName} // Controlled by local 'firstName' state
//                         onChange={(e) => setFirstName(e.target.value)}
//                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                     />
//                 </div>
//                 <div>
//                     <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
//                         Last Name
//                     </label>
//                     <input
//                         type="text"
//                         id="lastName"
//                         name="lastName"
//                         value={lastName} // Controlled by local 'lastName' state
//                         onChange={(e) => setLastName(e.target.value)}
//                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                     />
//                 </div>
//                 <div>
//                     <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">
//                         Upload New Profile Picture (Max 5MB, Images Only)
//                     </label>
//                     <input
//                         type="file"
//                         id="profilePicture"
//                         name="profilePicture"
//                         accept="image/*"
//                         onChange={handleFileChange}
//                         className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
//                     />
//                 </div>
//                 <button
//                     type="submit"
//                     className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
//                     disabled={isUpdating} // Disable button while the update is in progress
//                 >
//                     {isUpdating ? 'Updating...' : 'Update Profile'}
//                 </button>
//             </form>
//         </div>
//     );
// }



// src/pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile } from '../api'; // Assuming you have this API call
import { useAuth } from '../context/AuthContext'; // Import useAuth!

// Import the new components
import UserProfileContent from './UserProfileContent';
import LeaveApplicationForm from './LeaveApplicationForm';

export default function ProfilePage() {
    const navigate = useNavigate();
    
    const { user, isLoading, updateUser } = useAuth(); 
    
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isUpdating, setIsUpdating] = useState(false); 

    // State to manage which tab is active: 'profile' or 'leaves'
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
        }
    }, [user]);

    if (isLoading) {
        return <div className="text-center mt-20 text-lg">Loading profile...</div>;
    }

    if (!user) {
        navigate('/login'); 
        return null;
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        console.log("[Frontend] Selected file in handleFileChange:", file);
        setError('');
    };

    const handleProfileUpdate = async (event) => {
        event.preventDefault();
        setIsUpdating(true);
        setMessage('');
        setError('');

        const formData = new FormData();
        if (selectedFile) {
            formData.append('profilePicture', selectedFile);
        }
        formData.append('firstName', firstName);
        formData.append('lastName', lastName);

        console.log("[Frontend] FormData content before API call:");
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        try {
            const response = await updateUserProfile(formData);
            setIsUpdating(false);

            if (response.status === 200) {
                setMessage(response.data.message);
                
                console.log("ProfilePage: API success, response.data.user:", response.data.user); 
                updateUser(response.data.user); 
                console.log("ProfilePage: updateUser called from AuthContext.");
                
                setFirstName(response.data.user.firstName);
                setLastName(response.data.user.lastName);

                setSelectedFile(null);
                document.getElementById('profilePicture').value = '';
            } else {
                setError(response.data?.message || 'Failed to update profile.');
            }
        } catch (err) {
            setIsUpdating(false);
            const errMsg = err.response?.data?.message || 'Network error or server unavailable.';
            setError(errMsg);
            console.error('Profile update error:', err);
        }
    };
    
    return (
        <div className="flex min-h-screen bg-gray-100"> {/* Main container with flex */}
            {/* Sidebar */}
            <aside className="w-64 bg-white-800 text-white flex flex-col p-4">
                <div className="mb-8">
                    <h3 className="text-xl text-black font-semibold mb-4">Dashboard</h3>
                    <nav>
                        <ul>
                            <li className="mb-2">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full text-left py-2 px-4 rounded-md transition-colors duration-200 text-black
                                        ${activeTab === 'profile' ? 'bg-blue-600 text-black' : 'hover:bg-orange-400'}`}
                                >
                                    User Profile
                                </button>
                            </li>
                            <li className="mb-2">
                                <button
                                    onClick={() => setActiveTab('leaves')}
                                    className={`w-full text-left py-2 px-4 rounded-md transition-colors duration-200 text-black
                                        ${activeTab === 'leaves' ? 'bg-blue-600 text-black' : 'hover:bg-orange-400'}`}
                                >
                                    Leaves
                                </button>
                            </li>
                            {/* Add more sidebar items here if needed */}
                        </ul>
                    </nav>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-6 overflow-y-auto">
                {activeTab === 'profile' && (
                    <UserProfileContent
                        user={user}
                        firstName={firstName}
                        setFirstName={setFirstName}
                        lastName={lastName}
                        setLastName={setLastName}
                        selectedFile={selectedFile}
                        handleFileChange={handleFileChange}
                        message={message}
                        error={error}
                        handleProfileUpdate={handleProfileUpdate}
                        isUpdating={isUpdating}
                    />
                )}
                {activeTab === 'leaves' && (
                    <LeaveApplicationForm />
                )}
            </main>
        </div>
    );
}