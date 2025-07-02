// import React from 'react';
// import { Link, useNavigate, } from 'react-router-dom';

//     const LandingNav = () => {
//         const navigate = useNavigate();

//         return (
//             <>

//             <header className="bg-white shadow-md">
//                 <div className="max-w-screen mx-10 px-0 py-4 flex justify-between items-center">
//                     <div className="text-2xl font-bold text-blue-600">
//                         <Link to='/'><img src='/shiftrylogo.png' alt="shiftrylogo" className='w-[150px]'/></Link>
//                     </div>
//                     <nav className="space-x-6">
//                         <Link to='/solutions' className="text-gray-600 hover:text-blue-600">Solutions</Link>
//                         <Link to='/pricing' className="text-gray-600 hover:text-blue-600">Pricing</Link>
//                         <Link to='/contact' className="text-gray-600 hover:text-blue-600">Contact</Link>
//                     </nav>
//                     <div className="space-x-4">
//                         <button className="text-gray-600 hover:text-blue-600" onClick={() => navigate('/login')} >Sign In</button>
//                         <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" onClick={() => navigate('/signup')}>Sign Up</button>
//                     </div>
//                 </div>
//             </header>
//             </>
//         );
//     };

//     export default LandingNav;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react'; // You can use icons from lucide or any icon lib

const LandingNav = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-screen-xl mx-auto px-4 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <div className="text-2xl font-bold text-blue-600">
          <Link to="/"><img src="/shiftrylogo.png" alt="shiftrylogo" className="w-[150px]" /></Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden sm:flex space-x-6">
          <Link to="/solutions" className="text-gray-600 hover:text-blue-600">Solutions</Link>
          <Link to="/pricing" className="text-gray-600 hover:text-blue-600">Pricing</Link>
          <Link to="/contact" className="text-gray-600 hover:text-blue-600">Contact</Link>
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden sm:flex space-x-4">
          <button className="text-gray-600 hover:text-blue-600" onClick={() => navigate('/login')}>Sign In</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" onClick={() => navigate('/signup')}>Sign Up</button>
        </div>

        {/* Hamburger Icon */}
        <button
          className="sm:hidden text-gray-600"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="sm:hidden px-4 pb-4">
          <nav className="flex flex-col space-y-2">
            <Link to="/solutions" className="text-gray-600 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Solutions</Link>
            <Link to="/pricing" className="text-gray-600 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Pricing</Link>
            <Link to="/contact" className="text-gray-600 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Contact</Link>
          </nav>
          <div className="mt-4 flex flex-col space-y-2">
            <button className="text-gray-600 hover:text-blue-600 text-left" onClick={() => { setMenuOpen(false); navigate('/login'); }}>Sign In</button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-left" onClick={() => { setMenuOpen(false); navigate('/signup'); }}>Sign Up</button>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNav;
