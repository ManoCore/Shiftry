import React, { useState } from 'react';
import LandingNav from '../components/Landing-Nav.js';
import FooterLanding from '../components/FooterLanding.js';
import { subscribeToNewsletter } from '../api';
import { toast } from 'react-hot-toast';

const LandingPage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "What is Shiftry?",
      answer: "Shiftry is a scheduling platform that allows admins to assign tasks to care workers, nurses, and service professionals. It also enables users to join available shifts based on their availability."
    },
    {
      question: "Who can use Shiftry?",
      answer: "Shiftry is designed for admins, care workers, healthcare professionals, and service-based teams that require flexible and efficient scheduling."
    },
    {
      question: "How do users receive notifications?",
      answer: "Users receive real-time notifications whenever a shift is assigned, updated, or available to join."
    },
    {
      question: "Can users pick their own shifts?",
      answer: "Yes, users can browse through available tasks and choose the ones that suit their timing and preferences."
    }
  ];

  const handleChange = (e) => {
    setEmail(e.target.value);
    // Clear any previous messages when the user starts typing again
    if (message) {
      setMessage('');
    }
  };

  // Handles the form submission
  // const handleSubmit = async (e) => {
  //   e.preventDefault(); // Prevent default form submission behavior (page reload)

  //   // Basic client-side validation
  //   if (!email) {
  //     setMessage('Please enter your email address.');
  //     return;
  //   }
  //   if (!/\S+@\S+\.\S+/.test(email)) {
  //     setMessage('Please enter a valid email address.');
  //     return;
  //   }

  //   setIsSubmitting(true); // Set loading state to true
  //   setMessage(''); // Clear any previous messages

  //   try {
  //     // Call the API function to subscribe
  //     const result = await subscribeToNewsletter(email);
  //     // Show popup notification for success
  //     window.alert(result.message || 'Subscription successful!');
  //     setEmail(''); // Clear the input field on successful subscription
  //     // setMessage(result.message || 'Subscription successful!'); 
  //     setEmail(''); // Clear the input field on successful subscription
  //   } catch (error) {
  //     console.error('Subscription error:', error);
  //     // Display error message from the API, or a generic one if not available
  //     setMessage(error.response?.data?.message || error.message || 'Subscription failed. Please try again.');
  //   } finally {
  //     setIsSubmitting(false); // Reset loading state
  //   }
  // };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!email) {
    toast.error('Please enter your email address.');
    return;
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    toast.error('Please enter a valid email address.');
    return;
  }

  setIsSubmitting(true);
  setMessage('');

  try {
    const result = await subscribeToNewsletter(email);
    toast.success(result.message || 'Subscription successful!');
    setEmail('');
  } catch (error) {
    console.error('Subscription error:', error);
    toast.error(error.response?.data?.message || error.message || 'Subscription failed. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};



  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <LandingNav/>

      {/* Hero Section */}
      <section className="relative bg-blue-50 py-0 overflow-hidden"> {/* Added overflow-hidden */}
        <div className="relative w-full max-w-4xl mx-auto px-4 text-center"> {/* Adjusted width for responsiveness */}
          <img src='/Landingimgsvg.svg' alt='Landingimg' className='w-full h-auto object-contain' /> {/* Changed w-screen to w-full */}
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* First Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 items-center"> {/* Added items-center for vertical alignment */}
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Smart Workforce Scheduling with Shiftry</h2>
            <p className="text-gray-600">
              Shiftry is a modern scheduling platform designed to help admins effortlessly assign tasks to care workers, nurses, and other service professionals. With real-time notifications, easy shift assignment, and user participation features, Shiftry bridges the gap between availability and opportunity. Whether you're managing a team or looking for meaningful work, Shiftry brings simplicity and efficiency to shift management.
            </p>
          </div>
          <div className="bg-gray-300 h-auto rounded-md flex items-center justify-center overflow-hidden"> {/* Ensure image container is responsive */}
            <img src='/signup.png' alt="Sign up illustration" className="w-full h-auto object-cover" /> {/* Ensure image scales */}
          </div>
        </section>

        {/* Features Section */}
        <section>
          <div className="space-y-12">
            <div>
              <h1 className='text-3xl font-bold text-gray-800 mb-4'>Features of Shiftry</h1> {/* Corrected typo "od" to "of" */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Smart Shift Assignment</h3>
                <p className="text-gray-600">Admins can easily assign the right people to the right shifts with a few clicks, reducing scheduling conflicts and manual errors.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Real-Time Notifications</h3>
                <p className="text-gray-600">Users receive instant alerts about new or updated shift assignments, ensuring everyone stays in the loop.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Volunteer Work Join-In</h3>
                <p className="text-gray-600">Users can browse and join available shifts based on their interest and availability with just a tap.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Role-Based Access Control</h3>
                <p className="text-gray-600">Custom permissions and dashboards for different user roles ensure clarity and data security.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Intuitive User Interface</h3>
                <p className="text-gray-600">Designed for ease-of-use, Shiftry ensures a smooth experience for both technical and non-technical users.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Optimized for Service Teams</h3>
                <p className="text-gray-600">Built with care-focused industries in mind, it’s perfect for healthcare, caregiving, and related services.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Accordion Section */}
        <section className='flex flex-col justify-center items-center mt-[100px]'>
          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Frequently Asked Questions</h2>
          <h3 className="text-xl font-semibold text-gray-700 mb-6 text-center">Get quick answers to common questions about Shiftry and how it works.</h3>
          <div className="space-y-4 w-full max-w-2xl mx-auto"> {/* Adjusted width and added max-width for responsiveness */}
            {faqs.map((faq, index) => (
              <div key={index} className="w-full border rounded-lg bg-white shadow-sm"> {/* Changed w-[100%] to w-full */}
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex justify-between items-center p-4 text-left focus:outline-none"
                >
                  <span className="text-lg font-medium text-gray-800">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 transform transition-transform duration-200 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-40' : 'max-h-0'
                  }`}
                >
                  <div className="p-4 pt-0 text-gray-600">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center mt-[150px] font-inter px-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-2 sm:text-4xl">Subscribe to SHIFTRY</h2>
      <p className="text-lg text-gray-600 mb-6">Enter Your Email to get our latest updates.</p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 max-w-lg mx-auto">
        <input
          type="email"
          value={email} // Bind input value to state
          onChange={handleChange} // Update state on change
          placeholder="you@example.com"
          className="w-full sm:w-auto flex-grow px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800 shadow-sm"
          required
          disabled={isSubmitting} // Disable input during submission
        />
        <button
          type="submit" // Set type to submit for form handling
          className="bg-gray-800 text-white px-6 py-2 rounded-md hover:bg-gray-900"
          disabled={isSubmitting} // Disable button during submission
        >
          {isSubmitting ? 'Submitting...' : 'Submit now'}
        </button>
      </form>

      {/* Display messages to the user */}
      {message && (
        <p className={`mt-4 text-sm ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </section>
      </main>
      <FooterLanding/>
    </div>
  );
};

export default LandingPage;