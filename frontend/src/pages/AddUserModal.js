import React, { useState } from "react";
import { inviteUser } from "../api"; // Assuming inviteUser is defined here in api.js

export default function AddUserModal({ isOpen, onClose, onUserAdded, id }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailId: "", // Matches backend field name
    role: "employee", // Default to 'employee' as per your screenshot
    training: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInviteLink(""); // Clear previous link
    setCopySuccess(false);

    try {
      const res = await inviteUser(formData); // Call your API to invite user
      setInviteLink(res.data.inviteUrl);
      setError(""); // Clear any previous errors
      // Don't call onUserAdded here immediately, allow user to copy link first
    } catch (err) {
      console.error("Error inviting user:", err);
      // Backend error structure: { message: "..." }
      setError(err.response?.data?.message || "Failed to invite user. Please try again.");
      setInviteLink("");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000); // Reset success message after 2 seconds
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
        setError("Failed to copy link.");
      });
  };

  const handleCloseModal = () => {
    // Reset form and state when closing
    setFormData({
      firstName: "",
      lastName: "",
      emailId: "",
      role: "employee",
      training: '',
    });
    setInviteLink("");
    setError("");
    setCopySuccess(false);
    onClose(); // Call the parent's onClose handler
    // If an invite link was successfully generated, re-fetch users when modal closes
    if (inviteLink) {
        onUserAdded();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
      aria-modal="true"
      role="dialog"
      id={id}
      aria-labelledby="add-user-modal-title"
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto relative">
        <h2 id="add-user-modal-title" className="text-xl font-semibold mb-4 border-b pb-3">
          Add Team member
        </h2>
        <button
          onClick={handleCloseModal}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close modal"
        >
          &times;
        </button>

        {inviteLink ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="font-medium text-blue-800 mb-2">Invite with a unique link</p>
              <p className="text-sm text-gray-700 mb-3">
                Don't know your team's email address? Share the unique link below to get your
                team on your Deputy workplace faster. To keep things secured, you will need to
                approve each request.
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="flex-grow p-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                />
                <button
                  onClick={handleCopyLink}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
                >
                  {copySuccess ? "Copied!" : "Copy link"}
                </button>
              </div>
            </div>
            <div className="text-center">
                <button
                    onClick={handleCloseModal}
                    className="mt-4 bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400 transition duration-200"
                >
                    Done
                </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm" role="alert">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Please input"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Please input"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
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
                placeholder="Please input"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Access level
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
                {/* Add other roles as needed */}
              </select>
            </div>
            <div>
        <label htmlFor="visaStatus" className="block text-sm font-medium text-gray-700 mb-1">
          Visa Status
        </label>
        <select
          id="visaStatus"
          name="visaStatus"
          value={formData.visaStatus}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select Visa Status</option> {/* Default empty option */}
          <option value="Student">Student</option>
          <option value="PSW">PSW</option>
          <option value="COS">COS</option>
        </select>
      </div>

      <div>
        <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 mb-1">
          Employment Type
        </label>
        <select
          id="employmentType"
          name="employmentType"
          value={formData.employmentType}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select Employment Type</option> {/* Default empty option */}
          <option value="Part time">Part time</option>
          <option value="Full time">Full time</option>
        </select>

      </div>
      <div>
  <label htmlFor="training" className="block text-sm font-medium text-gray-700 mb-1">
    Training
  </label>
  <select
    id="training"
    name="training"
    value={formData.training} 
    onChange={handleChange} 
    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
  >
    <option value="">Select Training Type</option> {/* Default empty option */}
    <option value="Mandatory">Mandatory</option>
    <option value="PMVA">PMVA</option>
    <option value="Both">Both</option>
  </select>
</div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Inviting..." : "Invite to Shiftry"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}