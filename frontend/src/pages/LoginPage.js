import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api";
import { useAuth } from "../context/AuthContext";

import InputField from "../forms/InputField";
import PasswordField from "../forms/PasswordField";
import LandingNav from '../components/Landing-Nav.js';
import FooterLanding from '../components/FooterLanding.js';

export default function LoginPage() {
  const [formData, setFormData] = useState({ emailId: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const togglePasswordVisibility = () =>
    setShowPassword((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data } = await loginUser(formData);
      const userFromBackend = data.data;

      if (data && data.token && userFromBackend) {
        login(data.token, userFromBackend);
        navigate("/me");
      } else {
        setError("Login successful, but user data or token missing from response.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid Username or Password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <LandingNav />

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)]"> {/* Adjust height based on navbar */}
        
        {/* Left Image */}
        <div className="w-full md:w-1/2 bg-white flex justify-center items-center p-6 ">
          <img src="/login.png" alt="Login" className="w-3/4 max-w-sm" />
        </div>

        {/* Right Form */}
        <div className="w-full md:w-1/2 bg-blue-600 flex justify-center items-center p-6">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow-md w-full max-w-md text-black"
          >
            <h2 className="text-2xl font-semibold mb-1">Login</h2>
            <p className="text-gray-600 text-sm mb-4">
              Welcome back. Enter your credentials.
            </p>

            <div className="mb-4">
              <InputField
                label="Email Address"
                name="emailId"
                type="email"
                value={formData.emailId}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </div>

            <div className="mb-4">
              <PasswordField
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                show={showPassword}
                toggle={togglePasswordVisibility}
                placeholder="Enter your password"
              />
            </div>

            {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>

            <p className="text-sm mt-4 text-center">
              Don’t have an account?{" "}
              <span
                className="text-blue-600 cursor-pointer"
                onClick={() => navigate("/signup")}
              >
                Sign up here
              </span>
            </p>
          </form>
        </div>
      </div>

      <FooterLanding />
    </>
  );
}
