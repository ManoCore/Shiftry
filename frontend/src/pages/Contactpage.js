import React, { useState } from 'react';
import LandingNav from '../components/Landing-Nav.js';
import FooterLanding from '../components/FooterLanding.js';
import { submitContactForm } from '../api';
import { toast } from 'react-hot-toast';


const Contactpage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '', // Keep this for the form, even if commented out in JSX
    message: '',
  });
  const [message, setMessage] = useState(''); // State for success/error messages
  const [isSubmitting, setIsSubmitting] = useState(false); // State for loading

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Clear message when user starts typing again
    if (message) {
      setMessage('');
    }
  };

  const handleSubmit = async (e) => { // Make handleSubmit async
    e.preventDefault();

    // Basic client-side validation
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields (Name, Email, Message).');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true); // Set loading state
    setMessage(''); // Clear previous messages

    try {
      const response = await submitContactForm(formData); // Call the API function
      toast.success(response.message || 'Thank you for your message! We will get back to you soon.');
      // Reset form on success
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
      });
    } catch (error) {
      console.error('Contact form submission error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to send your message. Please try again.');
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  };

  return (
    <>
      <LandingNav/>
      <section className="font-inter py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-xl shadow-lg p-8 md:p-12">
          {/* Left Section: Contact Form */}
          <div className="lg:pr-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch with Shiftry</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isSubmitting} // Disable input when submitting
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isSubmitting} // Disable input when submitting
                />
              </div>

              {/* Uncomment this div if you plan to use the phone field */}
              {/* <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone number
                </label>
                <div className="flex">
                  <select
                    className="px-4 py-2 border border-gray-300 rounded-l-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting} // Disable select when submitting
                  >
                    <option>US</option>
                    <option>CA</option>
                    <option>UK</option>
                  </select>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isSubmitting} // Disable input when submitting
                  />
                </div>
              </div> */}

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  How can we help?
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Type your message here..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  required
                  disabled={isSubmitting} // Disable textarea when submitting
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting} // Disable button when submitting
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>

            {/* Message display area */}
            {message && (
              <p className={`mt-4 text-center text-sm ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
          </div>

          {/* Right Section: Image Placeholder */}
          <div className="flex items-center justify-center lg:pl-8">
            <img
              src="/Contactimg.svg" 
              alt="Contact Illustration" 
              className="w-full h-auto max-w-md rounded-xl"
              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/500x400/cccccc/333333?text=Image+Not+Found"; }}
            />
          </div>
        </div>
      </section>
      <FooterLanding/>
    </>
  );
};

export default Contactpage;