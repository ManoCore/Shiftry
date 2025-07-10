
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