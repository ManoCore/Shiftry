import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserByInviteToken, acceptInvite } from "../api";
import PasswordField from "../forms/PasswordField";

import isStrongPassword from "../utils/passwordValidator"; 

export default function AcceptInvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchInviteDetails = async () => {
      try {
        const res = await getUserByInviteToken(token);
        if (res.data) {
          setEmail(res.data.emailId);
          setFirstName(res.data.firstName);
          setLastName(res.data.lastName);
        }
      } catch (err) {
        console.error("Error fetching invite details:", err);
        setError("Invalid or expired invitation link.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchInviteDetails();
    } else {
      setLoading(false);
      setError("No invitation token found in the URL.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 
    setPasswordError("");
    setSuccess("");

    if (!password || !confirmPassword) {
      return setPasswordError("Please enter and confirm your password.");
    }

    if (password !== confirmPassword) {
      return setPasswordError("Passwords do not match.");
    }

    if (!isStrongPassword(password)) {
      return setPasswordError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
    }

    setSubmitting(true);
    try {
      await acceptInvite({ token, password });
      setSuccess("Account successfully created! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Error accepting invite:", err);
      setError(err.response?.data?.message || "Failed to set password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Loading invitation details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Accept Your Invitation</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

      
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        {!error && !success && ( 
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Name: {firstName} {lastName}
              </label>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email: {email}
              </label>
            </div>
            <div className="mb-4">
              <PasswordField
                label="Set Your Password:"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                show={showPassword}
                toggle={() => setShowPassword(!showPassword)}
                placeholder="Enter your new password"
              />
            </div>
            <div className="mb-2">
              <PasswordField
                label="Confirm Password:"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                show={showConfirmPassword}
                toggle={() => setShowConfirmPassword(!showConfirmPassword)}
                placeholder="Confirm your new password"
              />
            </div>
            {passwordError && (
              <p className="text-red-600 text-sm mb-4">{passwordError}</p>
            )}

            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={submitting || success}
              >
                {submitting ? "Setting Password..." : "Activate Account"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}