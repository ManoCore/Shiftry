// src/components/LeaveApplicationForm.js
import React, { useState, useEffect } from 'react';
import { submitLeaveApplication, fetchMyLeaveApplications } from '../api'; // Import new API functions

const LeaveApplicationForm = () => {
  // State for form fields
  const [leaveReason, setLeaveReason] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [description, setDescription] = useState('');

  // State for modal visibility, loading, and feedback messages
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // For form submission loading
  const [message, setMessage] = useState(''); // For form feedback messages

  // State for displaying user's leave applications history
  const [myApplications, setMyApplications] = useState([]); // Ensure initial state is an empty array
  const [isLoadingApplications, setIsLoadingApplications] = useState(true); // For history loading
  const [applicationsError, setApplicationsError] = useState(''); // For history errors

  // Dummy data for select options
  const leaveReasons = ['Sick Leave', 'Casual Leave', 'Annual Leave', 'Maternity Leave', 'Paternity Leave', 'Unpaid Leave'];
  const leaveTypes = ['Full Day', 'Half Day (Morning)', 'Half Day (Afternoon)'];

  // Function to fetch user's leave applications
  const getMyApplications = async () => {
    setIsLoadingApplications(true);
    setApplicationsError(''); // Clear previous errors
    try {
      const response = await fetchMyLeaveApplications(); // Call the API to get user's applications
      // Axios responses typically have the actual data in a 'data' property
      const applicationsData = response.data.data; // <-- CORRECTED: Access the 'data' property of the Axios response

      console.log('Fetched raw response from API:', response); // Log the full response for debugging
      console.log('Extracted applications data:', applicationsData); // Log the extracted data

      // IMPORTANT FIX: Ensure applicationsData is an array before setting state
      if (Array.isArray(applicationsData)) {
        setMyApplications(applicationsData);
      } else {
        // If data is not an array, it's an unexpected format.
        console.error('API response for my applications was not an array (after extracting .data):', applicationsData);
        setMyApplications([]); // Set to empty array to prevent map error
        setApplicationsError('Unexpected data format received for applications history.');
      }
    } catch (error) {
      console.error('Error fetching my leave applications:', error.response?.data || error.message);
      setApplicationsError(error.response?.data?.message || 'Failed to load your leave applications.');
      setMyApplications([]); // Ensure it's an empty array on error too
    } finally {
      setIsLoadingApplications(false);
    }
  };

  // useEffect to fetch applications when the component mounts
  useEffect(() => {
    getMyApplications();
  }, []); // Empty dependency array means this runs once on component mount

  const handleApplyForLeave = (e) => {
    e.preventDefault(); // Prevent default form submission

    // Clear previous messages from form submission
    setMessage('');

    // Basic client-side validation
    if (!leaveReason || !fromDate || !toDate || !leaveType) {
      setMessage('Please fill in all required fields.');
      return;
    }

    // Date validation: fromDate cannot be after toDate
    if (new Date(fromDate) > new Date(toDate)) {
      setMessage('From Date cannot be after To Date.');
      return;
    }

    // Show the confirmation modal before final submission
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true); // Set loading state for submission
    setMessage(''); // Clear previous messages

    try {
      const leaveData = {
        leaveReason,
        fromDate,
        toDate,
        leaveType,
        description,
      };
      console.log('Sending Leave Application:', leaveData);

      const response = await submitLeaveApplication(leaveData); // Call the API to submit leave
      setMessage(response.message || 'Leave application submitted successfully!');
      resetForm(); // Clear form fields
      setShowConfirmModal(false); // Close confirmation modal

      // Refresh the list of applications after a successful submission
      getMyApplications();
    } catch (error) {
      console.error('Error submitting leave application:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || 'Failed to submit leave application. Please try again.');
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  };

  const handleEditApplication = () => {
    // Close the modal to allow editing
    setShowConfirmModal(false);
    setMessage(''); // Clear message if user decides to edit
  };

  const resetForm = () => {
    setLeaveReason('');
    setFromDate('');
    setToDate('');
    setLeaveType('');
    setDescription('');
  };

  return (
    <div className="font-inter w-full bg-gray-100 flex flex-col items-center justify-center py-4 px-4">
      {/* Leave Application Form Section */}
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Apply for Leave</h2>

        <form onSubmit={handleApplyForLeave} className="space-y-5">
          {/* Leave Reason */}
          <div>
            <label htmlFor="leaveReason" className="block text-sm font-medium text-gray-700 mb-1">
              Leave Reason
            </label>
            <select
              id="leaveReason"
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isSubmitting} // Disable during submission
            >
              <option value="">Select Leave Reason</option>
              {leaveReasons.map((reason) => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
          </div>

          {/* From Date & To Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="fromDate"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isSubmitting} // Disable during submission
                />
              </div>
            </div>
            <div>
              <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="toDate"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 "
                  required
                  disabled={isSubmitting} // Disable during submission
                />
              </div>
            </div>
          </div>

          {/* Leave Type */}
          <div>
            <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type
            </label>
            <select
              id="leaveType"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isSubmitting} // Disable during submission
            >
              <option value="">Select Leave Type</option>
              {leaveTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Description (Optional) */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your reason for leave..."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              disabled={isSubmitting} // Disable during submission
            ></textarea>
          </div>

          {/* Apply Button */}
          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting} // Disable during submission
          >
            {isSubmitting ? 'Applying...' : 'Apply for Leave'}
          </button>
        </form>

        {/* Feedback Message Display */}
        {message && (
          <p className={`mt-4 text-center text-sm ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>

      {/* User's Leave Applications History Section */}
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your Leave History</h3>
        {isLoadingApplications ? (
          <p className="text-center text-gray-600">Loading your applications...</p>
        ) : applicationsError ? (
          <p className="text-center text-red-600">{applicationsError}</p>
        ) : myApplications.length === 0 ? (
          <p className="text-center text-gray-600">No leave applications found.</p>
        ) : (
          <div className="space-y-4">
            {myApplications.map((app) => (
              <div key={app._id} className="border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-800">{app.leaveReason}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${app.status === 'Approved' ? 'bg-green-100 text-green-800' : ''}
                    ${app.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${app.status === 'Rejected' ? 'bg-red-100 text-red-800' : ''}
                    ${app.status === 'Cancelled' ? 'bg-gray-100 text-gray-800' : ''}
                  `}>
                    {app.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {new Date(app.fromDate).toLocaleDateString('en-GB')} - {new Date(app.toDate).toLocaleDateString('en-GB')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Applied on: {new Date(app.appliedAt).toLocaleDateString('en-GB')}
                </p>
                {app.description && (
                  <p className="text-sm text-gray-700 mt-2 italic">"{app.description}"</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>


      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Confirm Leave Application</h3>

            <div className="space-y-3 mb-8 text-gray-700">
              <div className="flex justify-between">
                <span className="font-medium">Leave Reason:</span>
                <span>{leaveReason}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Leave Type:</span>
                <span>{leaveType}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">From:</span>
                <span>{new Date(fromDate).toLocaleDateString('en-GB')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">To:</span>
                <span>{new Date(toDate).toLocaleDateString('en-GB')}</span>
              </div>
              {description && (
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="mt-1 text-sm text-gray-600 break-words">{description}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-4">
              <button
                onClick={handleConfirmSubmit}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
              </button>
              <button
                onClick={handleEditApplication}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors duration-300"
                disabled={isSubmitting}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApplicationForm;
