import React from 'react';
import { Link } from 'react-router-dom';

const FooterLanding = () => (
  <footer className="w-full bg-white py-12">
    <div className="max-w-7xl mx-auto px-4 flex flex-col justify-between sm:flex-row gap-8">
      
      {/* Column 1 – Full width always */}
      <div className="max-w-[400px]">
        <div className="mb-5">
          <img src="/shiftrylogo.png" alt="Shiftry Logo" className="w-[150px]" />
        </div>
        <p className="text-gray-600 mb-4">
          Shiftry is a smart shift management platform that streamlines task assignment and connects care professionals with real-time opportunities.
        </p>
      </div>

      {/* Columns 2-4 – side by side below 768px and inline with column 1 above 768px */}
      <div className="flex flex-row flex-wrap gap-8 md:justify-between">
        
        {/* Column 2 */}
        <div className="flex-1 min-w-[80px]">
          <h3 className="text-[16px] md:text-lg lg:text-lg font-semibold text-gray-800 mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><Link to="/solutions" className="text-gray-600 hover:text-blue-600">Solutions</Link></li>
            <li><Link to="/pricing" className="text-gray-600 hover:text-blue-600">Pricing</Link></li>
            <li><Link to="/contact" className="text-gray-600 hover:text-blue-600">Contact</Link></li>
          </ul>
        </div>

        {/* Column 3 */}
        <div className="flex-1 min-w-[120px]">
          <h3 className="text-[16px] md:text-lg lg:text-lg font-semibold text-gray-800 mb-4">Account</h3>
          <ul className="space-y-2">
            <li><Link to="/login" className="text-gray-600 hover:text-blue-600">Sign In</Link></li>
            <li><Link to="/signup" className="text-gray-600 hover:text-blue-600">Sign Up</Link></li>
          </ul>
        </div>

        {/* Column 4 */}
        <div className="flex-1 min-w-[120px]">
          <h3 className="text-[16px] md:text-lg lg:text-lg font-semibold text-gray-800 mb-4">Legal</h3>
          <ul className="space-y-2">
            <li><Link to="/privacypolicy" className="text-gray-600 hover:text-blue-600">Privacy Policy</Link></li>
            <li><Link to="/tandc" className="text-gray-600 hover:text-blue-600">Terms & Conditions</Link></li>
          </ul>
        </div>

      </div>
    </div>
  </footer>
);

export default FooterLanding;
