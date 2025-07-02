import React from 'react';
import { Utensils, HeartHandshake, Hotel, Headset } from 'lucide-react';
import LandingNav from '../components/Landing-Nav.js';
import FooterLanding from '../components/FooterLanding.js';

const Solutions = () => {
  const industries = [
    {
      icon: Utensils, // Lucide React icon component
      title: 'Hospitality',
      description: 'Streamline your hospitality operations with smart workforce management tools. From restaurants to event venues, Shiftry helps you manage staff scheduling, track attendance, and improve guest service while reducing labor costs.',
      link: '#',
    },
    {
      icon: HeartHandshake, // Lucide React icon component
      title: 'Healthcare',
      description: 'Optimize staff scheduling and patient care with secure, reliable software. Ensure your healthcare teams are properly staffed, shift changes are smooth, and timesheets are managed.',
      link: '#',
    },
    {
      icon: Hotel, // Lucide React icon component
      title: 'Hotels',
      description: 'Simplify hotel staff management and enhance guest experiences. Manage your housekeep, front desk, and kitchen teams, with ease. Shiftry\'s workforce solution ensures every shift is covered.',
      link: '#',
    },
    {
      icon: Headset, // Lucide React icon component
      title: 'Call Center',
      description: 'Boost productivity and manage agent schedules effortlessly. Whether it\'s inbound, outbound, or support centers, Shiftry makes it easy to manage shifts, track attendance, and monitor performance.',
      link: '#',
    },
  ];

  return (
    <>
    <LandingNav/>
    <section className="font-inter py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Industries we serve</h2>
        <p className="text-lg text-gray-600 mb-12">
          Tailored workforce management solutions for your business.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {industries.map((industry, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-start text-center transition-transform transform hover:scale-105 duration-300 ease-in-out"
            >
              <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-6">
                <industry.icon size={36} strokeWidth={1.5} /> {/* Render the Lucide icon component */}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-start">{industry.title}</h3>
              <p className="text-gray-600 text-left leading-relaxed mb-6 flex-grow">
                {industry.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
    <FooterLanding/>
    </>
  );
};

export default Solutions;