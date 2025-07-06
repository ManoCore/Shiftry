import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api'; // Correctly import the API function for resetting password

const Spinner = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
  </div>
);

const ResetPasswordPage = () => {
  const { resettoken } = useParams(); // Get the reset token from the URL
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true); // State to check if token is valid

  useEffect(() => {
    // Basic check for token presence. More robust validation happens on backend.
    if (!resettoken) {
      setIsValidToken(false);
      setMessage('Invalid or missing password reset token.');
    }
  }, [resettoken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages
    setIsSubmitting(true);

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      setIsSubmitting(false);
      return;
    }

    // Basic client-side password strength check (optional, but good practice)
    // This should ideally match your backend's isStrongPassword logic
    if (newPassword.length < 8 ||
        !/[A-Z]/.test(newPassword) ||
        !/[a-z]/.test(newPassword) ||
        !/[0-9]/.test(newPassword) ||
        !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      setMessage("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
      setIsSubmitting(false);
      return;
    }

    try {
      // FIX: Call the correct API function 'resetPassword'
      // and pass the token and newPassword as expected by api.js
      const response = await resetPassword({ token: resettoken, newPassword: newPassword });
      setMessage(response.data.message || 'Your password has been reset successfully!');
      setNewPassword('');
      setConfirmPassword('');
      // Optionally redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Password reset error:', error);
      setMessage(error.response?.data?.message || 'Failed to reset password. Please try again or request a new link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-inter">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Link</h2>
          <p className="text-gray-700 mb-4">{message}</p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Request New Password Reset Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-inter">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Set New Password</h2>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-center ${message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your new password"
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 8 characters, include uppercase, lowercase, number, and special character.
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm your new password"
              required
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner /> : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
