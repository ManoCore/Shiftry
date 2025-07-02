import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import DashboardNavbar from "../components/DashboardNavbar";
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

export default function DashboardPage() {
  const [firstName, setFirstName] = useState("User");
  // Destructure user, logout, and isLoading directly from your AuthContext
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only proceed if authentication status has finished loading
    if (!isLoading) {
      if (user && user.firstName) {
        // If 'user' object exists and has a 'firstName', use it
        setFirstName(user.firstName);
      } else {
        // Fallback if 'user' is null/undefined or lacks 'firstName'
        setFirstName("User");
        // Optionally, if there's no user, you might want to redirect to login
        // if (!user) {
        //   navigate('/login');
        // }
      }
    }
  }, [user, isLoading, navigate]); // This effect now depends on 'user' and 'isLoading' from AuthContext

  const handleLogout = () => {
    // Call the logout function provided by your AuthContext.
    // This function should handle clearing localStorage ('token' and 'user')
    // and resetting the authentication state in your context.
    logout();
    navigate("/login");
  };

  // Optional: Display a loading state while AuthContext determines authentication status
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center font-sans">
        <p>Loading user data...</p> {/* Replace with a proper spinner/loader */}
      </div>
    );
  }

  return (
    <div className="flex h-screen font-sans">
      <div className="flex flex-col flex-1">
        {/* Pass the firstName derived from the AuthContext's user state */}
        <DashboardNavbar firstName={firstName} onLogout={handleLogout} />
        <main className="p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}