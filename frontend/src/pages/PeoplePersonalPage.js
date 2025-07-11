
import React, { useState, useEffect } from 'react';
import { useNavigate,useParams } from 'react-router-dom';
import {
  fetchUserById,
  // updateUserProfile,
  updateUserById,
  fetchUserLeaves,
  updateLeaveApplicationStatus,
  sendPasswordResetEmailForUser, 
  resetUserLoginCredentials,
inviteUser
} from '../api';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaCamera, FaHome, FaHeart, FaShareAlt, FaCalendarAlt, FaKey } from 'react-icons/fa';

// Define a default structure for user data to ensure all fields are present
const defaultUserDataStructure = {
  firstName: '',
  lastName: '',
  emailId: '',
  phoneNumber: '',
  dateOfBirth: '',
  gender: '',
  pronouns: '',
  profilePicture: null,
  role: '',
  status: '',
  address: {
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postcode: '',
    country: '',
  },
  emergencyContact: {
    contactName: '',
    contactRelationship: '',
    contactPhone: '',
  },
  social: {
    facebook: '',
    twitter: '',
    linkedin: '',
  },
};

// Helper component for loading spinner
const Spinner = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
  </div>
);

// Login Assistance Modal Component (Updated to use actual APIs)
const LoginAssistanceModal = ({ isOpen, onClose, userEmail, userId ,userFirstName, userLastName, userRole,userStatus}) => {
  const [modalMessage, setModalMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [newEmail, setNewEmail] = useState(''); // State for new email input
  const [newPassword, setNewPassword] = useState(''); // State for new password input
  const [showResetCredentialsForm, setShowResetCredentialsForm] = useState(false); // Toggle form visibility

  useEffect(() => {
    // Reset states when modal opens/closes
    if (isOpen) {
      setModalMessage('');
      setIsSending(false);
      setNewEmail('');
      setNewPassword('');
      setShowResetCredentialsForm(false);
    }
  }, [isOpen]);

  const handleSendResetEmail = async () => {
    setIsSending(true);
    setModalMessage('');
    try {
      const response = await sendPasswordResetEmailForUser(userId); // Call the actual API
      setModalMessage(response.data.message || 'Password reset email sent successfully!');
console.log(response.data.message);
    } catch (error) {
      console.error('Error sending reset email:', error);
      setModalMessage(error.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleResetCredentialsSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setModalMessage('');

    if (!newEmail && !newPassword) {
      setModalMessage('Please provide either a new email or a new password.');
      setIsSending(false);
      return;
    }

    try {
      const response = await resetUserLoginCredentials(userId, newEmail, newPassword); // Call the actual API
      setModalMessage(response.data.message || 'Login credentials reset successfully!');
      setNewEmail('');
      setNewPassword('');
      setShowResetCredentialsForm(false); // Hide form on success
    } catch (error) {
      console.error('Error resetting credentials:', error);
      setModalMessage(error.response?.data?.message || 'Failed to reset login credentials. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendUniqueInviteLink = async () => {
    setIsSending(true);
    setModalMessage(''); // Clear any previous modal messages for this action
    try {
      const payload = {
        firstName: userFirstName,
        lastName: userLastName,
        emailId: userEmail, 
        role: userRole 
      };

      // Ensure 'inviteUser' is imported in the parent and passed down, or imported directly here
      // For this example, assuming inviteUser is imported at the top of this file
      const res = await inviteUser(payload);

      setModalMessage(res.message || 'Unique invite link sent successfully!');
    
    } catch (error) {
        console.error('Error in handleSendUniqueInviteLink:', error);

        let errorMessage = 'Failed to send unique invite link. An unknown error occurred.';

        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);

            // --- IMPORTANT CHANGE HERE ---
            // First, check for the 'error' field, which your backend uses
            if (error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data) {
                errorMessage = error.response.data.error;
            }
            // Fallback to 'message' if 'error' is not present (for other potential backend responses)
            else if (error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
                errorMessage = error.response.data.message;
            }
            // If the response data is a plain string (less common with your current backend setup, but good for robustness)
            else if (typeof error.response.data === 'string' && error.response.data.trim() !== '') {
                errorMessage = error.response.data;
            }
            // Fallback to status text if no specific message is found in data
            else {
                errorMessage = error.response.statusText || `Error ${error.response.status}`;
            }
        } else if (error.request) {
            // The request was made but no response was received (e.g., network error)
            errorMessage = 'No response from server. Check your network connection or server status.';
        } else {
            // Something happened in setting up the request that triggered an Error
            errorMessage = error.message;
        }

        setModalMessage(errorMessage); // Display extracted error in modal
    } finally {
        setIsSending(false);
    }
};


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm sm:max-w-md mx-auto overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-t-lg">
          <h2 className="text-xl font-semibold">Manage Login Assistance</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {modalMessage && (
            <div className={`mb-4 p-3 rounded-lg text-center ${modalMessage.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {modalMessage}
            </div>
          )}
          {/* Issue 1: Send Reset Email */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Issue 1</h3>
            <p className="text-gray-700 mb-3">
              Unable to log in? Click below to send a new password reset email to {userEmail}.
            </p>
            <button
              onClick={handleSendResetEmail}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSending}
            >
              {isSending ? <Spinner /> : 'Send Reset Email'}
            </button>
          </div>

          {/* Issue 2: Reset Login Credentials */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Issue 2</h3>
            <p className="text-gray-700 mb-3">
              Email access unavailable? Reset this team member's login credentials with a fresh email address.
            </p>
            <button
              onClick={() => setShowResetCredentialsForm(!showResetCredentialsForm)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {showResetCredentialsForm ? 'Hide Reset Form' : 'Reset Login Credentials'}
            </button>

            {showResetCredentialsForm && (
              <form onSubmit={handleResetCredentialsSubmit} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-1">New Email (Optional)</label>
                  <input
                    type="email"
                    id="newEmail"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter new email"
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password (Optional)</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter new password"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave blank if only changing email.</p>
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSending}
                >
                  {isSending ? <Spinner /> : 'Apply Changes'}
                </button>
              </form>
            )}
          </div>

          {/* New Issue 3: Send Unique Invite Link */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Issue 3: Re-send Invite Link</h3>
            <p className="text-gray-700 mb-3">
              Has this user not completed their registration? Send them a new unique invite link.
            </p>
            <button
              onClick={handleSendUniqueInviteLink}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSending}
            >
              {isSending ? <Spinner /> : 'Send Unique Invite Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default function PeoplePersonalPage({ targetUserId }) {
  const navigate = useNavigate();
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();

  const [activeSubSection, setActiveSubSection] = useState('personal');
  const [targetUser, setTargetUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...defaultUserDataStructure });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  const [isLoginAssistanceModalOpen, setIsLoginAssistanceModalOpen] = useState(false);

  // --- State for User's Leave Applications ---
  const [userLeaveApplications, setUserLeaveApplications] = useState([]);
  const [isLoadingUserLeaves, setIsLoadingUserLeaves] = useState(true);
  const [userLeaveError, setUserLeaveError] = useState('');
  const [userLeaveStatusMessage, setUserLeaveStatusMessage] = useState('');

  // --- Function to fetch user's leave applications ---
  const getTargetUserLeaves = async () => {
    if (targetUserId) {
      setIsLoadingUserLeaves(true);
      setUserLeaveError('');
      try {
        const response = await fetchUserLeaves(targetUserId);
        const leavesData = response.data.data;
        console.log(leavesData)

        if (Array.isArray(leavesData)) {
          setUserLeaveApplications(leavesData);
        } else {
          console.error('API response for user leaves was not an array:', leavesData);
          setUserLeaveApplications([]);
          setUserLeaveError('Unexpected data format received for user leave applications.');
        }
      } catch (err) {
        console.error('Error fetching user leaves:', err);
        setUserLeaveError(err.response?.data?.message || 'Failed to load user leave applications.');
        setUserLeaveApplications([]);
      } finally {
        setIsLoadingUserLeaves(false);
      }
    }
  };


  // --- Fetch User Data ---
  useEffect(() => {
    const getUserDetails = async () => {
      if (!targetUserId) {
        setError('User ID is missing.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');
      try {
        const response = await fetchUserById(targetUserId);
        const userData = response.data.data;
        console.log(userData);
        if (userData) {
          setTargetUser(userData);
          setFormData({
            ...defaultUserDataStructure,
            ...userData,
            address: userData.address || defaultUserDataStructure.address,
            emergencyContact: userData.emergencyContact || defaultUserDataStructure.emergencyContact,
            social: userData.social || defaultUserDataStructure.social,
            dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
          });
        } else {
          setError('User data not found.');
          setTargetUser(null);
          setFormData({ ...defaultUserDataStructure });
        }
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError(err.response?.data?.message || 'Failed to load user details.');
        setTargetUser(null);
        setFormData({ ...defaultUserDataStructure });
      } finally {
        setIsLoading(false);
      }
    };

    getUserDetails();
  }, [targetUserId]);

  // --- Effect to trigger leave applications fetch when 'Leaves' section is active ---
  useEffect(() => {
    if (activeSubSection === 'leaves' && targetUserId) {
      getTargetUserLeaves();
    }
  }, [activeSubSection, targetUserId]);


  // --- Handle Leave Status Update for Specific User ---
  const handleUserLeaveStatusUpdate = async (leaveId, newStatus) => {
    setUserLeaveStatusMessage('');
    try {
      const response = await updateLeaveApplicationStatus(leaveId, newStatus);
      setUserLeaveStatusMessage(response.message);
      await getTargetUserLeaves();
    } catch (err) {
      console.error('Error updating user leave status:', err);
      setUserLeaveStatusMessage(err.response?.data?.message || 'Failed to update leave status.');
    }
  };


  // --- Authorization Check ---
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Spinner />
        <p className="ml-3 text-lg text-gray-700">Checking authorization...</p>
      </div>
    );
  }

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.id !== targetUserId)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-700">You do not have permission to view this user's profile.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Spinner />
        <p className="ml-3 text-lg text-gray-700">Loading user data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">User Not Found</h2>
          <p className="text-gray-700">The user you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  // Helper function to safely get nested data
  const getNestedValue = (obj, path, defaultValue = 'N/A') => {
    return path.split('.').reduce((acc, part) => acc && acc[part] !== undefined ? acc[part] : undefined, obj) || defaultValue;
  };

  const defaultProfilePicture = 'https://placehold.co/128x128/aabbcc/ffffff?text=User';

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

 const handleSave = async () => {
  setIsUpdating(true);
  setUpdateMessage('');
  setError('');

  try {
    const dataToSend = new FormData();

    dataToSend.append('firstName', formData.firstName);
    dataToSend.append('lastName', formData.lastName);
    dataToSend.append('emailId', formData.emailId);
    dataToSend.append('phoneNumber', formData.phoneNumber);
    dataToSend.append('dateOfBirth', formData.dateOfBirth);
    dataToSend.append('gender', formData.gender);
    dataToSend.append('pronouns', formData.pronouns);

    // Nested fields
    Object.keys(formData.address || {}).forEach(key => {
      dataToSend.append(`address.${key}`, formData.address[key]);
    });
    Object.keys(formData.emergencyContact || {}).forEach(key => {
      dataToSend.append(`emergencyContact.${key}`, formData.emergencyContact[key]);
    });
    Object.keys(formData.social || {}).forEach(key => {
      dataToSend.append(`social.${key}`, formData.social[key]);
    });

    // 🔁 Call your backend with the imported API function
    await updateUserById(targetUserId, dataToSend);

    setUpdateMessage('Profile updated successfully!');
    setIsEditing(false);

    const updatedResponse = await fetchUserById(targetUserId); // Refresh updated user
    setTargetUser(updatedResponse.data);

  } catch (err) {
    console.error('Error saving profile:', err);
    setError(err.response?.data?.message || 'Failed to save changes.');
  } finally {
    setIsUpdating(false);
  }
};


  return (
    <div className="flex flex-col sm:flex-row min-h-screen bg-gray-100 font-inter">
      {/* Sidebar */}
      <aside className="w-full sm:w-64 bg-white p-4 sm:p-6 shadow-md border-b sm:border-r border-gray-200">
        <div className="flex items-center mb-6">
          <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold mr-3">
            {targetUser.firstName ? targetUser.firstName[0].toUpperCase() : 'N/A'}
          </div>
          <span className="text-gray-800 font-semibold">{`${targetUser.firstName || ''} ${targetUser.lastName || ''}`.trim() || 'Employee'}</span>
        </div>
        <nav className="space-y-2">
          {/* Manage Login Issues Link */}
          <button
            onClick={() => setActiveSubSection('login-issues')}
            className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center ${activeSubSection === 'login-issues'
              ? 'bg-blue-100 text-blue-800 font-bold shadow-sm'
              : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <FaKey className="mr-2" /> Manage Login Issues
          </button>
          {/* Leaves Link (Only for Admin) */}
          {currentUser && currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveSubSection('leaves')}
              className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center ${activeSubSection === 'leaves'
                ? 'bg-blue-100 text-blue-800 font-bold shadow-sm'
                : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FaCalendarAlt className="mr-2" /> Leaves
            </button>
          )}
          {/* Personal Link */}
          <button
            onClick={() => setActiveSubSection('personal')}
            className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center ${activeSubSection === 'personal'
              ? 'bg-blue-100 text-blue-800 font-bold shadow-sm'
              : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <FaUser className="mr-2" /> Personal
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8">
        <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
          {/* Conditional Rendering for Sub-Sections */}
          {activeSubSection === 'personal' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Personal Details for {`${targetUser.firstName || ''} ${targetUser.lastName || ''}`.trim()}</h1>
                <button
                  onClick={() => {
                    if (isEditing) {
                      handleSave();
                    }
                    setIsEditing(!isEditing);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm"
                  disabled={isUpdating}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    ></path>
                  </svg>
                  {isUpdating ? 'Saving...' : (isEditing ? 'Save' : 'Edit')}
                </button>
              </div>

              {updateMessage && (
                <div className={`mb-4 p-3 rounded-lg text-center ${updateMessage.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {updateMessage}
                </div>
              )}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              {/* Personal Details Section */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Personal details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
                        isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
                      }`}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
                        isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
                      }`}
                    />
                  </div>
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
                        isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
                      }`}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="pronouns" className="block text-sm font-medium text-gray-700 mb-1">
                      Pronouns
                    </label>
                    <select
                      id="pronouns"
                      name="pronouns"
                      value={formData.pronouns}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
                        isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
                      }`}
                    >
                      <option value="">Select Pronouns</option>
                      <option value="He/Him">He/Him</option>
                      <option value="She/Her">She/Her</option>
                      <option value="They/Them">They/Them</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                      Date Of Birth
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
                        isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>
              </section>

              {/* Contact Section */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Contact</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="emailId" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="emailId"
                      name="emailId"
                      value={formData.emailId}
                      onChange={handleChange}
                      readOnly // Email is typically read-only or requires special update flow
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-100 cursor-not-allowed`}
                    />
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
                        isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
                      }`}
                    />
                  </div>
                  <div>
                    <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      id="addressLine1"
                      name="address.addressLine1" // Nested name
                      value={formData.address.addressLine1}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
                        isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
                      }`}
                    />
                  </div>
                  <div>
                    <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      id="addressLine2"
                      name="address.addressLine2" // Nested name
                      value={formData.address.addressLine2}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
                        isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
                      }`}
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="address.city" // Nested name
                      value={formData.address.city}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
                        isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
                      }`}
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="address.state" // Nested name
                      value={formData.address.state}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
                        isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
                      }`}
                    />
                  </div>
                  <div>
                    <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-1">
                      Postcode
                    </label>
                    <input
                      type="text"
                      id="postcode"
                      name="address.postcode" // Nested name
                      value={formData.address.postcode}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
                        isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
                      }`}
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="address.country" // Nested name
                      value={formData.address.country}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
                        isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>
              </section>

              {/* Emergency Contact Section */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Emergency Contact</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      id="contactName"
                      name="emergencyContact.contactName" // Nested name
                      value={formData.emergencyContact.contactName}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
                        isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
                      }`}
                    />
                  </div>
                  <div>
                    <label htmlFor="contactRelationship" className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Relationship
                    </label>
                    <input
                      type="text"
                      id="contactRelationship"
                      name="emergencyContact.contactRelationship" // Nested name
                      value={formData.emergencyContact.contactRelationship}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
                        isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
                      }`}
                    />
                  </div>
                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      id="contactPhone"
                      name="emergencyContact.contactPhone" // Nested name
                      value={formData.emergencyContact.contactPhone}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
                        isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>
              </section>
            </>
          )}

          {activeSubSection === 'login-issues' && (
            <div className="p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Manage Login Issues for {`${targetUser.firstName || ''} ${targetUser.lastName || ''}`.trim()}</h2>
              <p className="text-gray-700 mb-3">
                This section allows an administrator to assist with login issues for {targetUser.firstName}.
              </p>
              <button
                onClick={() => setIsLoginAssistanceModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Open Login Assistance Tools
              </button>
            </div>
          )}

          {activeSubSection === 'leaves' && currentUser && currentUser.role === 'admin' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Leave Applications for {`${targetUser.firstName || ''} ${targetUser.lastName || ''}`.trim()}</h3>

              {userLeaveStatusMessage && (
                <div className={`mb-4 p-3 rounded-lg text-center ${userLeaveStatusMessage.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {userLeaveStatusMessage}
                </div>
              )}

              {isLoadingUserLeaves ? (
                <p className="text-center text-gray-600">Loading leave applications...</p>
              ) : userLeaveError ? (
                <p className="text-center text-red-600">{userLeaveError}</p>
              ) : userLeaveApplications.length === 0 ? (
                <p className="text-center text-gray-600">No leave applications found for this user.</p>
              ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow-xl">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dates
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applied On
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userLeaveApplications.map((app) => (
                        <tr key={app._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {app.leaveReason}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {new Date(app.fromDate).toLocaleDateString('en-GB')} - {new Date(app.toDate).toLocaleDateString('en-GB')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {app.leaveType}
                          </td>
                          <td className="px-6 py-4 whitespace-normal text-sm text-gray-700 max-w-xs overflow-hidden text-ellipsis">
                            {app.description || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                              ${app.status === 'Approved' ? 'bg-green-100 text-green-800' : ''}
                              ${app.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                              ${app.status === 'Rejected' ? 'bg-red-100 text-red-800' : ''}
                              ${app.status === 'Cancelled' ? 'bg-gray-100 text-gray-800' : ''}
                            `}>
                              {app.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(app.appliedAt).toLocaleDateString('en-GB')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {app.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => handleUserLeaveStatusUpdate(app._id, 'approved')}
                                  className="text-green-600 hover:text-green-900 mr-3 px-3 py-1 rounded-md border border-green-600 hover:border-green-900 transition-colors duration-200"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleUserLeaveStatusUpdate(app._id, 'rejected')}
                                  className="text-red-600 hover:text-red-900 px-3 py-1 rounded-md border border-red-600 hover:border-red-900 transition-colors duration-200"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {(app.status === 'Approved' || app.status === 'Pending') && (
                              <button
                                onClick={() => handleUserLeaveStatusUpdate(app._id, 'cancelled')}
                                className="text-gray-600 hover:text-gray-900 ml-3 px-3 py-1 rounded-md border border-gray-600 hover:border-gray-900 transition-colors duration-200"
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
              )}
            </div>
          )}
        </div>
      </main>

      {/* Login Assistance Modal */}
      <LoginAssistanceModal
        isOpen={isLoginAssistanceModalOpen}
        onClose={() => setIsLoginAssistanceModalOpen(false)}
        userEmail={targetUser.emailId}
        userId={targetUser._id}
        userFirstName={targetUser.firstName} // Pass first name
          userLastName={targetUser.lastName}   // Pass last name
          userRole={targetUser.role}
      />
    </div>
  );
}



// import React, { useState, useEffect } from 'react';
// import { useNavigate,useParams } from 'react-router-dom';
// import {
//   fetchUserById,
//   // updateUserProfile,
//   updateUserById,
//   fetchUserLeaves,
//   updateLeaveApplicationStatus,
//   sendPasswordResetEmailForUser, 
//   resetUserLoginCredentials,
// inviteUser
// } from '../api';
// import { useAuth } from '../context/AuthContext';
// import { FaUser, FaEnvelope, FaCamera, FaHome, FaHeart, FaShareAlt, FaCalendarAlt, FaKey } from 'react-icons/fa';

// // Define a default structure for user data to ensure all fields are present
// const defaultUserDataStructure = {
//   firstName: '',
//   lastName: '',
//   emailId: '',
//   phoneNumber: '',
//   dateOfBirth: '',
//   gender: '',
//   pronouns: '',
//   profilePicture: null,
//   role: '',
//   status: '',
//   address: {
//     addressLine1: '',
//     addressLine2: '',
//     city: '',
//     state: '',
//     postcode: '',
//     country: '',
//   },
//   emergencyContact: {
//     contactName: '',
//     contactRelationship: '',
//     contactPhone: '',
//   },
//   social: {
//     facebook: '',
//     twitter: '',
//     linkedin: '',
//   },
// };

// // Helper component for loading spinner
// const Spinner = () => (
//   <div className="flex justify-center items-center h-full">
//     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
//   </div>
// );

// // Login Assistance Modal Component (Updated to use actual APIs)
// const LoginAssistanceModal = ({ isOpen, onClose, userEmail, userId ,userFirstName, userLastName, userRole,userStatus}) => {
//   const [modalMessage, setModalMessage] = useState('');
//   const [isSending, setIsSending] = useState(false);
//   const [newEmail, setNewEmail] = useState(''); // State for new email input
//   const [newPassword, setNewPassword] = useState(''); // State for new password input
//   const [showResetCredentialsForm, setShowResetCredentialsForm] = useState(false); // Toggle form visibility

//   useEffect(() => {
//     // Reset states when modal opens/closes
//     if (isOpen) {
//       setModalMessage('');
//       setIsSending(false);
//       setNewEmail('');
//       setNewPassword('');
//       setShowResetCredentialsForm(false);
//     }
//   }, [isOpen]);

//   const handleSendResetEmail = async () => {
//     setIsSending(true);
//     setModalMessage('');
//     try {
//       const response = await sendPasswordResetEmailForUser(userId); // Call the actual API
//       setModalMessage(response.data.message || 'Password reset email sent successfully!');
// console.log(response.data.message);
//     } catch (error) {
//       console.error('Error sending reset email:', error);
//       setModalMessage(error.response?.data?.message || 'Failed to send reset email. Please try again.');
//     } finally {
//       setIsSending(false);
//     }
//   };

//   const handleResetCredentialsSubmit = async (e) => {
//     e.preventDefault();
//     setIsSending(true);
//     setModalMessage('');

//     if (!newEmail && !newPassword) {
//       setModalMessage('Please provide either a new email or a new password.');
//       setIsSending(false);
//       return;
//     }

//     try {
//       const response = await resetUserLoginCredentials(userId, newEmail, newPassword); // Call the actual API
//       setModalMessage(response.data.message || 'Login credentials reset successfully!');
//       setNewEmail('');
//       setNewPassword('');
//       setShowResetCredentialsForm(false); // Hide form on success
//     } catch (error) {
//       console.error('Error resetting credentials:', error);
//       setModalMessage(error.response?.data?.message || 'Failed to reset login credentials. Please try again.');
//     } finally {
//       setIsSending(false);
//     }
//   };

//   const handleSendUniqueInviteLink = async () => {
//     setIsSending(true);
//     setModalMessage(''); // Clear any previous modal messages for this action
//     try {
//       const payload = {
//         firstName: userFirstName,
//         lastName: userLastName,
//         emailId: userEmail, 
//         role: userRole 
//       };

//       // Ensure 'inviteUser' is imported in the parent and passed down, or imported directly here
//       // For this example, assuming inviteUser is imported at the top of this file
//       const res = await inviteUser(payload);

//       setModalMessage(res.message || 'Unique invite link sent successfully!');
    
//     } catch (error) {
//         console.error('Error in handleSendUniqueInviteLink:', error);

//         let errorMessage = 'Failed to send unique invite link. An unknown error occurred.';

//         if (error.response) {
//             // The request was made and the server responded with a status code
//             // that falls out of the range of 2xx
//             console.error('Error response data:', error.response.data);
//             console.error('Error response status:', error.response.status);

//             // --- IMPORTANT CHANGE HERE ---
//             // First, check for the 'error' field, which your backend uses
//             if (error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data) {
//                 errorMessage = error.response.data.error;
//             }
//             // Fallback to 'message' if 'error' is not present (for other potential backend responses)
//             else if (error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
//                 errorMessage = error.response.data.message;
//             }
//             // If the response data is a plain string (less common with your current backend setup, but good for robustness)
//             else if (typeof error.response.data === 'string' && error.response.data.trim() !== '') {
//                 errorMessage = error.response.data;
//             }
//             // Fallback to status text if no specific message is found in data
//             else {
//                 errorMessage = error.response.statusText || `Error ${error.response.status}`;
//             }
//         } else if (error.request) {
//             // The request was made but no response was received (e.g., network error)
//             errorMessage = 'No response from server. Check your network connection or server status.';
//         } else {
//             // Something happened in setting up the request that triggered an Error
//             errorMessage = error.message;
//         }

//         setModalMessage(errorMessage); // Display extracted error in modal
//     } finally {
//         setIsSending(false);
//     }
// };


//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl w-full max-w-sm sm:max-w-md mx-auto overflow-hidden">
//         {/* Modal Header */}
//         <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-t-lg">
//           <h2 className="text-xl font-semibold">Manage Login Assistance</h2>
//           <button onClick={onClose} className="text-white hover:text-gray-200 focus:outline-none">
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
//             </svg>
//           </button>
//         </div>

//         {/* Modal Body */}
//         <div className="p-6 space-y-6">
//           {modalMessage && (
//             <div className={`mb-4 p-3 rounded-lg text-center ${modalMessage.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//               {modalMessage}
//             </div>
//           )}
//           {/* Issue 1: Send Reset Email */}
//           <div>
//             <h3 className="text-lg font-semibold text-gray-800 mb-2">Issue 1</h3>
//             <p className="text-gray-700 mb-3">
//               Unable to log in? Click below to send a new password reset email to {userEmail}.
//             </p>
//             <button
//               onClick={handleSendResetEmail}
//               className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               disabled={isSending}
//             >
//               {isSending ? <Spinner /> : 'Send Reset Email'}
//             </button>
//           </div>

//           {/* Issue 2: Reset Login Credentials */}
//           <div>
//             <h3 className="text-lg font-semibold text-gray-800 mb-2">Issue 2</h3>
//             <p className="text-gray-700 mb-3">
//               Email access unavailable? Reset this team member's login credentials with a fresh email address.
//             </p>
//             <button
//               onClick={() => setShowResetCredentialsForm(!showResetCredentialsForm)}
//               className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
//             >
//               {showResetCredentialsForm ? 'Hide Reset Form' : 'Reset Login Credentials'}
//             </button>

//             {showResetCredentialsForm && (
//               <form onSubmit={handleResetCredentialsSubmit} className="mt-4 space-y-4">
//                 <div>
//                   <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-1">New Email (Optional)</label>
//                   <input
//                     type="email"
//                     id="newEmail"
//                     value={newEmail}
//                     onChange={(e) => setNewEmail(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
//                     placeholder="Enter new email"
//                   />
//                 </div>
//                 <div>
//                   <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password (Optional)</label>
//                   <input
//                     type="password"
//                     id="newPassword"
//                     value={newPassword}
//                     onChange={(e) => setNewPassword(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
//                     placeholder="Enter new password"
//                   />
//                   <p className="text-xs text-gray-500 mt-1">Leave blank if only changing email.</p>
//                 </div>
//                 <button
//                   type="submit"
//                   className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                   disabled={isSending}
//                 >
//                   {isSending ? <Spinner /> : 'Apply Changes'}
//                 </button>
//               </form>
//             )}
//           </div>

//           {/* New Issue 3: Send Unique Invite Link */}
//           <div>
//             <h3 className="text-lg font-semibold text-gray-800 mb-2">Issue 3: Re-send Invite Link</h3>
//             <p className="text-gray-700 mb-3">
//               Has this user not completed their registration? Send them a new unique invite link.
//             </p>
//             <button
//               onClick={handleSendUniqueInviteLink}
//               className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               disabled={isSending}
//             >
//               {isSending ? <Spinner /> : 'Send Unique Invite Link'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };


// export default function PeoplePersonalPage({ targetUserId }) {
//   const navigate = useNavigate();
//   const { user: currentUser, isLoading: isAuthLoading } = useAuth();

//   const [activeSubSection, setActiveSubSection] = useState('personal');
//   const [targetUser, setTargetUser] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [isEditing, setIsEditing] = useState(false);
//   const [formData, setFormData] = useState({ ...defaultUserDataStructure });
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [updateMessage, setUpdateMessage] = useState('');

//   const [isLoginAssistanceModalOpen, setIsLoginAssistanceModalOpen] = useState(false);

//   // --- State for User's Leave Applications ---
//   const [userLeaveApplications, setUserLeaveApplications] = useState([]);
//   const [isLoadingUserLeaves, setIsLoadingUserLeaves] = useState(true);
//   const [userLeaveError, setUserLeaveError] = useState('');
//   const [userLeaveStatusMessage, setUserLeaveStatusMessage] = useState('');

//   // --- Function to fetch user's leave applications ---
//   const getTargetUserLeaves = async () => {
//     if (targetUserId) {
//       setIsLoadingUserLeaves(true);
//       setUserLeaveError('');
//       try {
//         const response = await fetchUserLeaves(targetUserId);
//         const leavesData = response.data.data;
//         console.log(leavesData)

//         if (Array.isArray(leavesData)) {
//           setUserLeaveApplications(leavesData);
//         } else {
//           console.error('API response for user leaves was not an array:', leavesData);
//           setUserLeaveApplications([]);
//           setUserLeaveError('Unexpected data format received for user leave applications.');
//         }
//       } catch (err) {
//         console.error('Error fetching user leaves:', err);
//         setUserLeaveError(err.response?.data?.message || 'Failed to load user leave applications.');
//         setUserLeaveApplications([]);
//       } finally {
//         setIsLoadingUserLeaves(false);
//       }
//     }
//   };


//   // --- Fetch User Data ---
//   useEffect(() => {
//     const getUserDetails = async () => {
//       if (!targetUserId) {
//         setError('User ID is missing.');
//         setIsLoading(false);
//         return;
//       }

//       setIsLoading(true);
//       setError('');
//       try {
//         const response = await fetchUserById(targetUserId);
//         const userData = response.data.data;
//         console.log(userData);
//         if (userData) {
//           setTargetUser(userData);
//           setFormData({
//             ...defaultUserDataStructure,
//             ...userData,
//             address: userData.address || defaultUserDataStructure.address,
//             emergencyContact: userData.emergencyContact || defaultUserDataStructure.emergencyContact,
//             social: userData.social || defaultUserDataStructure.social,
//             dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
//           });
//         } else {
//           setError('User data not found.');
//           setTargetUser(null);
//           setFormData({ ...defaultUserDataStructure });
//         }
//       } catch (err) {
//         console.error('Error fetching user details:', err);
//         setError(err.response?.data?.message || 'Failed to load user details.');
//         setTargetUser(null);
//         setFormData({ ...defaultUserDataStructure });
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     getUserDetails();
//   }, [targetUserId]);

//   // --- Effect to trigger leave applications fetch when 'Leaves' section is active ---
//   useEffect(() => {
//     if (activeSubSection === 'leaves' && targetUserId) {
//       getTargetUserLeaves();
//     }
//   }, [activeSubSection, targetUserId]);


//   // --- Handle Leave Status Update for Specific User ---
//   const handleUserLeaveStatusUpdate = async (leaveId, newStatus) => {
//     setUserLeaveStatusMessage('');
//     try {
//       const response = await updateLeaveApplicationStatus(leaveId, newStatus);
//       setUserLeaveStatusMessage(response.message);
//       await getTargetUserLeaves();
//     } catch (err) {
//       console.error('Error updating user leave status:', err);
//       setUserLeaveStatusMessage(err.response?.data?.message || 'Failed to update leave status.');
//     }
//   };


//   // --- Authorization Check ---
//   if (isAuthLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <Spinner />
//         <p className="ml-3 text-lg text-gray-700">Checking authorization...</p>
//       </div>
//     );
//   }

//   if (!currentUser || (currentUser.role !== 'admin' && currentUser.id !== targetUserId)) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="bg-white p-8 rounded-lg shadow-xl text-center">
//           <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
//           <p className="text-gray-700">You do not have permission to view this user's profile.</p>
//         </div>
//       </div>
//     );
//   }

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <Spinner />
//         <p className="ml-3 text-lg text-gray-700">Loading user data...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="bg-white p-8 rounded-lg shadow-xl text-center">
//           <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
//           <p className="text-gray-700">{error}</p>
//         </div>
//       </div>
//     );
//   }

//   if (!targetUser) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="bg-white p-8 rounded-lg shadow-xl text-center">
//           <h2 className="text-2xl font-bold text-gray-800 mb-4">User Not Found</h2>
//           <p className="text-gray-700">The user you are looking for does not exist.</p>
//         </div>
//       </div>
//     );
//   }

//   // Helper function to safely get nested data
//   const getNestedValue = (obj, path, defaultValue = 'N/A') => {
//     return path.split('.').reduce((acc, part) => acc && acc[part] !== undefined ? acc[part] : undefined, obj) || defaultValue;
//   };

//   const defaultProfilePicture = 'https://placehold.co/128x128/aabbcc/ffffff?text=User';

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     if (name.includes('.')) {
//       const [parent, child] = name.split('.');
//       setFormData(prev => ({
//         ...prev,
//         [parent]: {
//           ...prev[parent],
//           [child]: value
//         }
//       }));
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//  const handleSave = async () => {
//   setIsUpdating(true);
//   setUpdateMessage('');
//   setError('');

//   try {
//     const dataToSend = new FormData();

//     dataToSend.append('firstName', formData.firstName);
//     dataToSend.append('lastName', formData.lastName);
//     dataToSend.append('emailId', formData.emailId);
//     dataToSend.append('phoneNumber', formData.phoneNumber);
//     dataToSend.append('dateOfBirth', formData.dateOfBirth);
//     dataToSend.append('gender', formData.gender);
//     dataToSend.append('pronouns', formData.pronouns);

//     // Nested fields
//     Object.keys(formData.address || {}).forEach(key => {
//       dataToSend.append(`address.${key}`, formData.address[key]);
//     });
//     Object.keys(formData.emergencyContact || {}).forEach(key => {
//       dataToSend.append(`emergencyContact.${key}`, formData.emergencyContact[key]);
//     });
//     Object.keys(formData.social || {}).forEach(key => {
//       dataToSend.append(`social.${key}`, formData.social[key]);
//     });

//     // 🔁 Call your backend with the imported API function
//     await updateUserById(targetUserId, dataToSend);

//     setUpdateMessage('Profile updated successfully!');
//     setIsEditing(false);

//     const updatedResponse = await fetchUserById(targetUserId); // Refresh updated user
//     setTargetUser(updatedResponse.data);

//   } catch (err) {
//     console.error('Error saving profile:', err);
//     setError(err.response?.data?.message || 'Failed to save changes.');
//   } finally {
//     setIsUpdating(false);
//   }
// };


//   return (
//     <div className="flex flex-col sm:flex-row min-h-screen bg-gray-100 font-inter">
//       {/* Sidebar */}
//       <aside className="w-full sm:w-64 bg-white p-4 sm:p-6 shadow-md border-b sm:border-r border-gray-200">
//         <div className="flex items-center mb-6">
//           <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold mr-3">
//             {targetUser.firstName ? targetUser.firstName[0].toUpperCase() : 'N/A'}
//           </div>
//           <span className="text-gray-800 font-semibold">{`${targetUser.firstName || ''} ${targetUser.lastName || ''}`.trim() || 'Employee'}</span>
//         </div>
//         <nav className="space-y-2">
//           {/* Manage Login Issues Link */}
//           <button
//             onClick={() => setActiveSubSection('login-issues')}
//             className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center ${activeSubSection === 'login-issues'
//               ? 'bg-blue-100 text-blue-800 font-bold shadow-sm'
//               : 'hover:bg-gray-100 text-gray-700'
//             }`}
//           >
//             <FaKey className="mr-2" /> Manage Login Issues
//           </button>
//           {/* Leaves Link (Only for Admin) */}
//           {currentUser && currentUser.role === 'admin' && (
//             <button
//               onClick={() => setActiveSubSection('leaves')}
//               className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center ${activeSubSection === 'leaves'
//                 ? 'bg-blue-100 text-blue-800 font-bold shadow-sm'
//                 : 'hover:bg-gray-100 text-gray-700'
//               }`}
//             >
//               <FaCalendarAlt className="mr-2" /> Leaves
//             </button>
//           )}
//           {/* Personal Link */}
//           <button
//             onClick={() => setActiveSubSection('personal')}
//             className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center ${activeSubSection === 'personal'
//               ? 'bg-blue-100 text-blue-800 font-bold shadow-sm'
//               : 'hover:bg-gray-100 text-gray-700'
//             }`}
//           >
//             <FaUser className="mr-2" /> Personal
//           </button>
//         </nav>
//       </aside>

//       {/* Main Content Area */}
//       <main className="flex-1 p-4 sm:p-8">
//         <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
//           {/* Conditional Rendering for Sub-Sections */}
//           {activeSubSection === 'personal' && (
//             <>
//               <div className="flex justify-between items-center mb-6">
//                 <h1 className="text-2xl font-semibold text-gray-800">Personal Details for {`${targetUser.firstName || ''} ${targetUser.lastName || ''}`.trim()}</h1>
//                 <button
//                   onClick={() => {
//                     if (isEditing) {
//                       handleSave();
//                     }
//                     setIsEditing(!isEditing);
//                   }}
//                   className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm"
//                   disabled={isUpdating}
//                 >
//                   <svg
//                     className="w-4 h-4 mr-2"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
//                     ></path>
//                   </svg>
//                   {isUpdating ? 'Saving...' : (isEditing ? 'Save' : 'Edit')}
//                 </button>
//               </div>

//               {updateMessage && (
//                 <div className={`mb-4 p-3 rounded-lg text-center ${updateMessage.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//                   {updateMessage}
//                 </div>
//               )}
//               {error && (
//                 <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
//                   <span className="block sm:inline">{error}</span>
//                 </div>
//               )}

//               {/* Personal Details Section */}
//               <section className="mb-8">
//                 <h2 className="text-xl font-semibold text-gray-700 mb-4">Personal details</h2>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
//                       First Name
//                     </label>
//                     <input
//                       type="text"
//                       id="firstName"
//                       name="firstName"
//                       value={formData.firstName}
//                       onChange={handleChange}
//                       readOnly={!isEditing}
//                       className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
//                         isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
//                       }`}
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
//                       Last Name
//                     </label>
//                     <input
//                       type="text"
//                       id="lastName"
//                       name="lastName"
//                       value={formData.lastName}
//                       onChange={handleChange}
//                       readOnly={!isEditing}
//                       className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
//                         isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
//                       }`}
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
//                       Gender
//                     </label>
//                     <select
//                       id="gender"
//                       name="gender"
//                       value={formData.gender}
//                       onChange={handleChange}
//                       disabled={!isEditing}
//                       className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
//                         isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
//                       }`}
//                     >
//                       <option value="">Select Gender</option>
//                       <option value="Male">Male</option>
//                       <option value="Female">Female</option>
//                       <option value="Non-binary">Non-binary</option>
//                       <option value="Prefer not to say">Prefer not to say</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label htmlFor="pronouns" className="block text-sm font-medium text-gray-700 mb-1">
//                       Pronouns
//                     </label>
//                     <select
//                       id="pronouns"
//                       name="pronouns"
//                       value={formData.pronouns}
//                       onChange={handleChange}
//                       disabled={!isEditing}
//                       className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
//                         isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
//                       }`}
//                     >
//                       <option value="">Select Pronouns</option>
//                       <option value="He/Him">He/Him</option>
//                       <option value="She/Her">She/Her</option>
//                       <option value="They/Them">They/Them</option>
//                       <option value="Prefer not to say">Prefer not to say</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
//                       Date Of Birth
//                     </label>
//                     <input
//                       type="date"
//                       id="dateOfBirth"
//                       name="dateOfBirth"
//                       value={formData.dateOfBirth}
//                       onChange={handleChange}
//                       readOnly={!isEditing}
//                       className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
//                         isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
//                       }`}
//                     />
//                   </div>
//                 </div>
//               </section>

//               {/* Contact Section */}
//               <section className="mb-8">
//                 <h2 className="text-xl font-semibold text-gray-700 mb-4">Contact</h2>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label htmlFor="emailId" className="block text-sm font-medium text-gray-700 mb-1">
//                       Email
//                     </label>
//                     <input
//                       type="email"
//                       id="emailId"
//                       name="emailId"
//                       value={formData.emailId}
//                       onChange={handleChange}
//                       readOnly // Email is typically read-only or requires special update flow
//                       className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-100 cursor-not-allowed`}
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
//                       Mobile
//                     </label>
//                     <input
//                       type="tel"
//                       id="phoneNumber"
//                       name="phoneNumber"
//                       value={formData.phoneNumber}
//                       onChange={handleChange}
//                       readOnly={!isEditing}
//                       className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
//                         isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
//                       }`}
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">
//                       Address Line 1
//                     </label>
//                     <input
//                       type="text"
//                       id="addressLine1"
//                       name="address.addressLine1" // Nested name
//                       value={formData.address.addressLine1}
//                       onChange={handleChange}
//                       readOnly={!isEditing}
//                       className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
//                         isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
//                       }`}
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">
//                       Address Line 2
//                     </label>
//                     <input
//                       type="text"
//                       id="addressLine2"
//                       name="address.addressLine2" // Nested name
//                       value={formData.address.addressLine2}
//                       onChange={handleChange}
//                       readOnly={!isEditing}
//                       className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
//                         isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
//                       }`}
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
//                       City
//                     </label>
//                     <input
//                       type="text"
//                       id="city"
//                       name="address.city" // Nested name
//                       value={formData.address.city}
//                       onChange={handleChange}
//                       readOnly={!isEditing}
//                       className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
//                         isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
//                       }`}
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
//                       State
//                     </label>
//                     <input
//                       type="text"
//                       id="state"
//                       name="address.state" // Nested name
//                       value={formData.address.state}
//                       onChange={handleChange}
//                       readOnly={!isEditing}
//                       className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
//                         isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
//                       }`}
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-1">
//                       Postcode
//                     </label>
//                     <input
//                       type="text"
//                       id="postcode"
//                       name="address.postcode" // Nested name
//                       value={formData.address.postcode}
//                       onChange={handleChange}
//                       readOnly={!isEditing}
//                       className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
//                         isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
//                       }`}
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
//                       Country
//                     </label>
//                     <input
//                       type="text"
//                       id="country"
//                       name="address.country" // Nested name
//                       value={formData.address.country}
//                       onChange={handleChange}
//                       readOnly={!isEditing}
//                       className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
//                         isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
//                       }`}
//                     />
//                   </div>
//                 </div>
//               </section>

//               {/* Emergency Contact Section */}
//               <section className="mb-8">
//                 <h2 className="text-xl font-semibold text-gray-700 mb-4">Emergency Contact</h2>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
//                       Contact Name
//                     </label>
//                     <input
//                       type="text"
//                       id="contactName"
//                       name="emergencyContact.contactName" // Nested name
//                       value={formData.emergencyContact.contactName}
//                       onChange={handleChange}
//                       readOnly={!isEditing}
//                       className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
//                         isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
//                       }`}
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="contactRelationship" className="block text-sm font-medium text-gray-700 mb-1">
//                       Contact Relationship
//                     </label>
//                     <input
//                       type="text"
//                       id="contactRelationship"
//                       name="emergencyContact.contactRelationship" // Nested name
//                       value={formData.emergencyContact.contactRelationship}
//                       onChange={handleChange}
//                       readOnly={!isEditing}
//                       className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
//                         isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
//                       }`}
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
//                       Contact Phone
//                     </label>
//                     <input
//                       type="tel"
//                       id="contactPhone"
//                       name="emergencyContact.contactPhone" // Nested name
//                       value={formData.emergencyContact.contactPhone}
//                       onChange={handleChange}
//                       readOnly={!isEditing}
//                       className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
//                         isEditing ? 'bg-white focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-100 cursor-not-allowed'
//                       }`}
//                     />
//                   </div>
//                 </div>
//               </section>
//             </>
//           )}

//           {activeSubSection === 'login-issues' && (
//             <div className="p-6 space-y-6">
//               <h2 className="text-xl font-semibold text-gray-800 mb-4">Manage Login Issues for {`${targetUser.firstName || ''} ${targetUser.lastName || ''}`.trim()}</h2>
//               <p className="text-gray-700 mb-3">
//                 This section allows an administrator to assist with login issues for {targetUser.firstName}.
//               </p>
//               <button
//                 onClick={() => setIsLoginAssistanceModalOpen(true)}
//                 className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
//               >
//                 Open Login Assistance Tools
//               </button>
//             </div>
//           )}

//           {activeSubSection === 'leaves' && currentUser && currentUser.role === 'admin' && (
//             <div className="space-y-6">
//               <h3 className="text-xl font-semibold text-gray-800 mb-4">Leave Applications for {`${targetUser.firstName || ''} ${targetUser.lastName || ''}`.trim()}</h3>

//               {userLeaveStatusMessage && (
//                 <div className={`mb-4 p-3 rounded-lg text-center ${userLeaveStatusMessage.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//                   {userLeaveStatusMessage}
//                 </div>
//               )}

//               {isLoadingUserLeaves ? (
//                 <p className="text-center text-gray-600">Loading leave applications...</p>
//               ) : userLeaveError ? (
//                 <p className="text-center text-red-600">{userLeaveError}</p>
//               ) : userLeaveApplications.length === 0 ? (
//                 <p className="text-center text-gray-600">No leave applications found for this user.</p>
//               ) : (
//                 <div className="overflow-x-auto bg-white rounded-lg shadow-xl">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Reason
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Dates
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Type
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Description
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Status
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Applied On
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Actions
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {userLeaveApplications.map((app) => (
//                         <tr key={app._id}>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
//                             {app.leaveReason}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
//                             {new Date(app.fromDate).toLocaleDateString('en-GB')} - {new Date(app.toDate).toLocaleDateString('en-GB')}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
//                             {app.leaveType}
//                           </td>
//                           <td className="px-6 py-4 whitespace-normal text-sm text-gray-700 max-w-xs overflow-hidden text-ellipsis">
//                             {app.description || 'N/A'}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
//                               ${app.status === 'Approved' ? 'bg-green-100 text-green-800' : ''}
//                               ${app.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
//                               ${app.status === 'Rejected' ? 'bg-red-100 text-red-800' : ''}
//                               ${app.status === 'Cancelled' ? 'bg-gray-100 text-gray-800' : ''}
//                             `}>
//                               {app.status}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {new Date(app.appliedAt).toLocaleDateString('en-GB')}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                             {app.status === 'Pending' && (
//                               <>
//                                 <button
//                                   onClick={() => handleUserLeaveStatusUpdate(app._id, 'Approved')}
//                                   className="text-green-600 hover:text-green-900 mr-3 px-3 py-1 rounded-md border border-green-600 hover:border-green-900 transition-colors duration-200"
//                                 >
//                                   Approve
//                                 </button>
//                                 <button
//                                   onClick={() => handleUserLeaveStatusUpdate(app._id, 'Rejected')}
//                                   className="text-red-600 hover:text-red-900 px-3 py-1 rounded-md border border-red-600 hover:border-red-900 transition-colors duration-200"
//                                 >
//                                   Reject
//                                 </button>
//                               </>
//                             )}
//                             {(app.status === 'Approved' || app.status === 'Pending') && (
//                               <button
//                                 onClick={() => handleUserLeaveStatusUpdate(app._id, 'Cancelled')}
//                                 className="text-gray-600 hover:text-gray-900 ml-3 px-3 py-1 rounded-md border border-gray-600 hover:border-gray-900 transition-colors duration-200"
//                               >
//                                 Cancel
//                               </button>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </main>

//       {/* Login Assistance Modal */}
//       <LoginAssistanceModal
//         isOpen={isLoginAssistanceModalOpen}
//         onClose={() => setIsLoginAssistanceModalOpen(false)}
//         userEmail={targetUser.emailId}
//         userId={targetUser._id}
//         userFirstName={targetUser.firstName} // Pass first name
//           userLastName={targetUser.lastName}   // Pass last name
//           userRole={targetUser.role}
//       />
//     </div>
//   );
// }
