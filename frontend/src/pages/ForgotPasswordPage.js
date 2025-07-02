import React, { useState } from 'react';
import { forgotPassword } from '../api'; // Ensure this path is correct relative to your api.js

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Call the forgotPassword API from your api.js
      // FIX: Change 'email' to 'emailId' to match backend expectation
      const response = await forgotPassword({ emailId: email });

      if (response.status === 200 || response.data?.success) {
        setMessage('If an account with that email exists, a password reset link has been sent to your email address.');
      } else {
        // Handle cases where API returns success: false or a non-200 status with a custom message
        setError(response.data?.message || 'Failed to initiate password reset. Please try again.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      // More specific error handling for network issues or API response structure
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(err.response.data?.message || 'An error occurred. Please check your email and try again.');
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your internet connection.');
      } else {
        // Something else happened in setting up the request that triggered an Error
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Forgot Password?</h2>
        <p className="text-gray-600 mb-8 text-center">
          Enter your email address below and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200"
              placeholder="you@example.com"
              aria-label="Email Address"
            />
          </div>

          <button
            type="submit"
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white transition-colors duration-200
              ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
            disabled={loading}
            aria-live="polite"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        {message && (
          <div className="mt-6 p-3 rounded-md bg-green-100 text-green-700 text-sm text-center">
            {message}
          </div>
        )}
        {error && (
          <div className="mt-6 p-3 rounded-md bg-red-100 text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        <div className="mt-8 text-center text-gray-600 text-sm">
          Remember your password?{' '}
          <a href="/login" className="text-blue-600 hover:underline font-medium">
            Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
