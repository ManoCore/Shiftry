// src/components/UserProfileContent.js
import React from 'react';

const UserProfileContent = ({
  user,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  selectedFile,
  handleFileChange,
  message,
  error,
  handleProfileUpdate,
  isUpdating,
}) => {
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">User Profile</h2>
      {message && <p className="text-green-600 text-center mb-4">{message}</p>}
      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      {/* Profile Picture and User Info Display */}
      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-400 shadow-md mx-auto mb-4">
        <img
          src={user.profilePicture}
          alt="Profile"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
          }}
        />
      </div>
      <p className="text-xl font-semibold mt-4 text-center">{user.firstName} {user.lastName}</p>
      <p className="text-gray-600 text-center">{user.emailId}</p>
      <p className="text-gray-500 capitalize text-center">Role: {user.role}</p>

      {/* Profile Update Form */}
      <form onSubmit={handleProfileUpdate} className="space-y-4 mt-6">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">
            Upload New Profile Picture (Max 5MB, Images Only)
          </label>
          <input
            type="file"
            id="profilePicture"
            name="profilePicture"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          disabled={isUpdating}
        >
          {isUpdating ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default UserProfileContent;