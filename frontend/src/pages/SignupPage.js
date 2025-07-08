import React from "react";
import SignupForm from "../forms/SignupForm";
import LandingNav from '../components/Landing-Nav.js';
import FooterLanding from '../components/FooterLanding.js';

export default function SignupPage() {
  return (
    <>
      <LandingNav />

      {/* Main content area */}
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)]  shadow-md" data-testid="signup-page">
        
        {/* Left Section (Image + Text) */}
        <div className="w-full md:w-1/2 bg-blue-600 flex flex-col items-center justify-center text-white p-8">
          <div className="bg-white rounded-lg p-4">
            <img src="/signup.png" alt="Signup" className="w-64 h-auto" />
          </div>
          <h2 className="text-2xl font-semibold mt-6 text-center">Signup With Shiftry</h2>
          <p className="text-sm mt-2 text-center">Welcome to the future of care and clarity.</p>
        </div>

        {/* Right Section (Form) */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6">
          <SignupForm />
        </div>
      </div>

      <FooterLanding />
    </>
  );
}
