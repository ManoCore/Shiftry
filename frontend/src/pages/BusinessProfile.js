// import React, { useState } from 'react';

// // Main BusinessPage component
// const BusinessPage = () => {
//   const [activeSection, setActiveSection] = useState('subscription'); // Default to 'subscription' as per image

//   const renderContent = () => {
//     switch (activeSection) {
//       case 'general':
//         return <GeneralSettings />;
//       case 'billing':
//         return <BillingSettings />;
//       case 'subscription':
//         return <SubscriptionSettings />;
//       case 'invoices':
//         return <InvoicesSection />; // Placeholder for invoices
//       default:
//         return <SubscriptionSettings />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 font-inter antialiased flex flex-col">
//       {/* Top Bar - Back Arrow */}
//       <div className="w-full bg-white p-4 shadow-sm flex items-center">
//         <button
//           onClick={() => console.log('Back button clicked')} // Replace with actual navigation logic
//           className="text-gray-600 hover:text-gray-800 flex items-center"
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
//             <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
//           </svg>
//         </button>
//       </div>

//       <div className="flex flex-grow">
//         {/* Sidebar */}
//         <aside className="w-64 bg-white p-6 shadow-md">
//           <h2 className="text-xl font-semibold text-gray-800 mb-6">Edit Business</h2>
//           <nav>
//             <ul>
//               <li>
//                 <button
//                   onClick={() => setActiveSection('general')}
//                   className={`w-full text-left py-2 px-4 rounded-lg text-lg ${
//                     activeSection === 'general' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
//                   }`}
//                 >
//                   General
//                 </button>
//               </li>
//               <li className="mt-2">
//                 <button
//                   onClick={() => setActiveSection('billing')}
//                   className={`w-full text-left py-2 px-4 rounded-lg text-lg ${
//                     activeSection === 'billing' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
//                   }`}
//                 >
//                   Billing
//                 </button>
//               </li>
//               <li className="mt-2">
//                 <button
//                   onClick={() => setActiveSection('subscription')}
//                   className={`w-full text-left py-2 px-4 rounded-lg text-lg ${
//                     activeSection === 'subscription' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
//                   }`}
//                 >
//                   Subscription
//                 </button>
//               </li>
//               <li className="mt-2">
//                 <button
//                   onClick={() => setActiveSection('invoices')}
//                   className={`w-full text-left py-2 px-4 rounded-lg text-lg ${
//                     activeSection === 'invoices' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
//                   }`}
//                 >
//                   Invoices
//                 </button>
//               </li>
//             </ul>
//           </nav>
//         </aside>

//         {/* Main Content Area */}
//         <main className="flex-1 p-8 overflow-auto">
//           {renderContent()}
//         </main>
//       </div>
//     </div>
//   );
// };

// // General Settings Component
// const GeneralSettings = () => {
//   const [companyName, setCompanyName] = useState('Manocore Technologies');
//   const [companyAddress, setCompanyAddress] = useState('123 Tech Lane, Innovation City, TX 78701');
//   const [contactEmail, setContactEmail] = useState('info@manocore.com');

//   const handleSave = () => {
//     alert('General settings saved!');
//     console.log({ companyName, companyAddress, contactEmail });
//   };

//   return (
//     <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
//       <h1 className="text-3xl font-bold text-gray-800 mb-6">General Company Details</h1>

//       <div className="mb-4">
//         <label htmlFor="companyName" className="block text-gray-700 text-sm font-bold mb-2">
//           Company Name
//         </label>
//         <input
//           type="text"
//           id="companyName"
//           className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
//           value={companyName}
//           onChange={(e) => setCompanyName(e.target.value)}
//         />
//       </div>

//       <div className="mb-4">
//         <label htmlFor="companyAddress" className="block text-gray-700 text-sm font-bold mb-2">
//           Company Address
//         </label>
//         <textarea
//           id="companyAddress"
//           rows={3}
//           className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
//           value={companyAddress}
//           onChange={(e) => setCompanyAddress(e.target.value)}
//         ></textarea>
//       </div>

//       <div className="mb-6">
//         <label htmlFor="contactEmail" className="block text-gray-700 text-sm font-bold mb-2">
//           Contact Email
//         </label>
//         <input
//           type="email"
//           id="contactEmail"
//           className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
//           value={contactEmail}
//           onChange={(e) => setContactEmail(e.target.value)}
//         />
//       </div>

//       <div className="flex justify-end">
//         <button
//           onClick={handleSave}
//           className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200"
//         >
//           Save Changes
//         </button>
//       </div>
//     </div>
//   );
// };

// // Billing Settings Component
// const BillingSettings = () => {
//   // Billing Address State
//   const [billingName, setBillingName] = useState('MICHAEL NDULUE');
//   const [billingStreet, setBillingStreet] = useState('Luton, England');
//   const [billingCountry, setBillingCountry] = useState('United Kingdom');
//   const [billingPostcode, setBillingPostcode] = useState('lu2 2af');
//   const [invoiceEmail, setInvoiceEmail] = useState('to:luton@matchoptions.co.uk');
//   const [isEditingBillingAddress, setIsEditingBillingAddress] = useState(false);

//   // Company Address State
//   const [companyNameAddr, setCompanyNameAddr] = useState('MICHAEL NDULUE');
//   const [companyStreet, setCompanyStreet] = useState('Luton, England');
//   const [companyCountry, setCompanyCountry] = useState('United Kingdom');
//   const [companyPostcode, setCompanyPostcode] = useState('lu2 2af');
//   const [isEditingCompanyAddress, setIsEditingCompanyAddress] = useState(false);

//   // Tax Information State
//   const [taxInfo, setTaxInfo] = useState('N/A'); // Placeholder, as it's not clearly visible in image
//   const [isEditingTaxInfo, setIsEditingTaxInfo] = useState(false);

//   // Payment Details State
//   const [paymentDetails, setPaymentDetails] = useState('Subscribed with Direct debit ****4655');
//   const [isEditingPaymentDetails, setIsEditingPaymentDetails] = useState(false);

//   const handleSaveBillingAddress = () => {
//     alert('Billing address saved!');
//     console.log({ billingName, billingStreet, billingCountry, billingPostcode, invoiceEmail });
//     setIsEditingBillingAddress(false);
//   };

//   const handleSaveCompanyAddress = () => {
//     alert('Company address saved!');
//     console.log({ companyNameAddr, companyStreet, companyCountry, companyPostcode });
//     setIsEditingCompanyAddress(false);
//   };

//   const handleSaveTaxInfo = () => {
//     alert('Tax information saved!');
//     console.log({ taxInfo });
//     setIsEditingTaxInfo(false);
//   };

//   const handleSavePaymentDetails = () => {
//     alert('Payment details saved!');
//     console.log({ paymentDetails });
//     setIsEditingPaymentDetails(false);
//   };

//   return (
//     <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
//       <h1 className="text-3xl font-bold text-gray-800 mb-6">Account Information</h1>

//       {/* Billing Address Section */}
//       <div className="mb-8 p-4 border border-gray-200 rounded-lg">
//         <div className="flex justify-between items-center mb-2">
//           <h2 className="text-xl font-semibold text-gray-800">Billing address</h2>
//           {!isEditingBillingAddress && (
//             <button
//               onClick={() => setIsEditingBillingAddress(true)}
//               className="text-blue-600 hover:underline font-medium py-1 px-3 rounded-lg"
//             >
//               Edit Billing address
//             </button>
//           )}
//         </div>
//         {isEditingBillingAddress ? (
//           <div className="space-y-3">
//             <div>
//               <label htmlFor="billingName" className="block text-gray-700 text-sm font-bold mb-1">Name</label>
//               <input type="text" id="billingName" className="form-input" value={billingName} onChange={(e) => setBillingName(e.target.value)} />
//             </div>
//             <div>
//               <label htmlFor="billingStreet" className="block text-gray-700 text-sm font-bold mb-1">Street/City</label>
//               <input type="text" id="billingStreet" className="form-input" value={billingStreet} onChange={(e) => setBillingStreet(e.target.value)} />
//             </div>
//             <div>
//               <label htmlFor="billingPostcode" className="block text-gray-700 text-sm font-bold mb-1">Postcode</label>
//               <input type="text" id="billingPostcode" className="form-input" value={billingPostcode} onChange={(e) => setBillingPostcode(e.target.value)} />
//             </div>
//             <div>
//               <label htmlFor="billingCountry" className="block text-gray-700 text-sm font-bold mb-1">Country</label>
//               <input type="text" id="billingCountry" className="form-input" value={billingCountry} onChange={(e) => setBillingCountry(e.target.value)} />
//             </div>
//             <div>
//               <label htmlFor="invoiceEmail" className="block text-gray-700 text-sm font-bold mb-1">Invoice Email</label>
//               <input type="email" id="invoiceEmail" className="form-input" value={invoiceEmail} onChange={(e) => setInvoiceEmail(e.target.value)} />
//             </div>
//             <button
//               onClick={handleSaveBillingAddress}
//               className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 mt-4"
//             >
//               Save
//             </button>
//           </div>
//         ) : (
//           <div className="text-gray-700">
//             <p>{billingName}</p>
//             <p>{billingStreet}</p>
//             <p>{billingPostcode}</p>
//             <p>{billingCountry}</p>
//             <p>Invoice will be emailed {invoiceEmail}</p>
//           </div>
//         )}
//       </div>

//       {/* Company Address Section */}
//       <div className="mb-8 p-4 border border-gray-200 rounded-lg">
//         <div className="flex justify-between items-center mb-2">
//           <h2 className="text-xl font-semibold text-gray-800">Company address</h2>
//           {!isEditingCompanyAddress && (
//             <button
//               onClick={() => setIsEditingCompanyAddress(true)}
//               className="text-blue-600 hover:underline font-medium py-1 px-3 rounded-lg"
//             >
//               Edit Company address
//             </button>
//           )}
//         </div>
//         {isEditingCompanyAddress ? (
//           <div className="space-y-3">
//             <div>
//               <label htmlFor="companyNameAddr" className="block text-gray-700 text-sm font-bold mb-1">Name</label>
//               <input type="text" id="companyNameAddr" className="form-input" value={companyNameAddr} onChange={(e) => setCompanyNameAddr(e.target.value)} />
//             </div>
//             <div>
//               <label htmlFor="companyStreet" className="block text-gray-700 text-sm font-bold mb-1">Street/City</label>
//               <input type="text" id="companyStreet" className="form-input" value={companyStreet} onChange={(e) => setCompanyStreet(e.target.value)} />
//             </div>
//             <div>
//               <label htmlFor="companyPostcode" className="block text-gray-700 text-sm font-bold mb-1">Postcode</label>
//               <input type="text" id="companyPostcode" className="form-input" value={companyPostcode} onChange={(e) => setCompanyPostcode(e.target.value)} />
//             </div>
//             <div>
//               <label htmlFor="companyCountry" className="block text-gray-700 text-sm font-bold mb-1">Country</label>
//               <input type="text" id="companyCountry" className="form-input" value={companyCountry} onChange={(e) => setCompanyCountry(e.target.value)} />
//             </div>
//             <button
//               onClick={handleSaveCompanyAddress}
//               className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 mt-4"
//             >
//               Save
//             </button>
//           </div>
//         ) : (
//           <div className="text-gray-700">
//             <p>{companyNameAddr}</p>
//             <p>{companyStreet}</p>
//             <p>{companyPostcode}</p>
//             <p>{companyCountry}</p>
//           </div>
//         )}
//       </div>

//       {/* Tax Information Section */}
//       <div className="mb-8 p-4 border border-gray-200 rounded-lg">
//         <div className="flex justify-between items-center mb-2">
//           <h2 className="text-xl font-semibold text-gray-800">Tax Information</h2>
//           {!isEditingTaxInfo && (
//             <button
//               onClick={() => setIsEditingTaxInfo(true)}
//               className="text-blue-600 hover:underline font-medium py-1 px-3 rounded-lg"
//             >
//               Edit Tax Information
//             </button>
//           )}
//         </div>
//         {isEditingTaxInfo ? (
//           <div className="space-y-3">
//             <div>
//               <label htmlFor="taxInfo" className="block text-gray-700 text-sm font-bold mb-1">Tax ID</label>
//               <input type="text" id="taxInfo" className="form-input" value={taxInfo} onChange={(e) => setTaxInfo(e.target.value)} />
//             </div>
//             <button
//               onClick={handleSaveTaxInfo}
//               className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 mt-4"
//             >
//               Save
//             </button>
//           </div>
//         ) : (
//           <div className="text-gray-700">
//             <p>{taxInfo}</p>
//           </div>
//         )}
//       </div>

//       {/* Payment Details Section */}
//       <div className="mb-8 p-4 border border-gray-200 rounded-lg">
//         <div className="flex justify-between items-center mb-2">
//           <h2 className="text-xl font-semibold text-gray-800">Payment Details</h2>
//           {!isEditingPaymentDetails && (
//             <button
//               onClick={() => setIsEditingPaymentDetails(true)}
//               className="text-blue-600 hover:underline font-medium py-1 px-3 rounded-lg"
//             >
//               Edit Payment Details
//             </button>
//           )}
//         </div>
//         {isEditingPaymentDetails ? (
//           <div className="space-y-3">
//             <div>
//               <label htmlFor="paymentDetails" className="block text-gray-700 text-sm font-bold mb-1">Payment Method</label>
//               <input type="text" id="paymentDetails" className="form-input" value={paymentDetails} onChange={(e) => setPaymentDetails(e.target.value)} />
//             </div>
//             <button
//               onClick={handleSavePaymentDetails}
//               className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 mt-4"
//             >
//               Save
//             </button>
//           </div>
//         ) : (
//           <div className="text-gray-700">
//             <p>{paymentDetails}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Subscription Settings Component (based on the provided screenshot)
// const SubscriptionSettings = () => {
//   const [scheduling, setScheduling] = useState('MONTHLY');
//   const [nextInvoiceDate, setNextInvoiceDate] = useState('1 Aug 2023');
//   const [hrPricePerUser, setHrPricePerUser] = useState('£2.00'); // Made editable
//   const [hrDescription, setHrDescription] = useState('A streamlined solution for hiring, onboarding, and employee document management'); // Made editable
//   const [currentUsers, setCurrentUsers] = useState(54); // This might not be directly editable by user, but shown

//   const handleSave = () => {
//     alert('Subscription settings saved!');
//     console.log({ scheduling, nextInvoiceDate, hrPricePerUser, hrDescription });
//   };

//   return (
//     <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
//       <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Plan</h1>

//       {/* Plan Details */}
//       <div className="flex flex-col md:flex-row gap-8">
//         <div className="flex-1">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-2xl font-semibold text-gray-800">Scheduling <span className="text-blue-600 text-lg">{scheduling}</span></h2>
//             <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition duration-200">
//               Change Plan
//             </button>
//           </div>
//           <p className="text-gray-600 mb-6">Next invoice issued {nextInvoiceDate}</p>

//           {/* HR Plan Card */}
//           <div className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200">
//             <h3 className="text-xl font-semibold text-gray-800 mb-2">HR</h3>
//             <div className="mb-4">
//               <label htmlFor="hrPrice" className="block text-gray-700 text-sm font-bold mb-1">
//                 Price per user/month (ex VAT)
//               </label>
//               <input
//                 type="text"
//                 id="hrPrice"
//                 className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 value={hrPricePerUser}
//                 onChange={(e) => setHrPricePerUser(e.target.value)}
//               />
//             </div>
//             <div className="mb-4">
//               <label htmlFor="hrDescription" className="block text-gray-700 text-sm font-bold mb-1">
//                 Description
//               </label>
//               <textarea
//                 id="hrDescription"
//                 rows={3}
//                 className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 value={hrDescription}
//                 onChange={(e) => setHrDescription(e.target.value)}
//               ></textarea>
//             </div>
//             <div className="flex gap-4 mt-4">
//               <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition duration-200">
//                 Try for Free
//               </button>
//               <button className="text-blue-600 hover:underline font-medium py-2 px-4">
//                 Learn more
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Current Users Card */}
//         <div className="flex-shrink-0 w-full md:w-48 bg-blue-50 p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
//           <div className="text-blue-600 text-5xl font-bold mb-2">
//             {currentUsers}
//           </div>
//           <p className="text-blue-800 text-lg">Current Users</p>
//         </div>
//       </div>

//       {/* Bottom Buttons */}
//       <div className="flex flex-wrap gap-4 mt-8 justify-center md:justify-start">
//         <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200">
//           Cancel Deputy subscription
//         </button>
//         <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg shadow-md transition duration-200">
//           Visit Pricing Page
//         </button>
//         <button
//           onClick={handleSave}
//           className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200"
//         >
//           Save Changes
//         </button>
//       </div>
//     </div>
//   );
// };

// // Invoices Section (Placeholder)
// const InvoicesSection = () => {
//   return (
//     <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto text-center">
//       <h1 className="text-3xl font-bold text-gray-800 mb-6">Invoices</h1>
//       <p className="text-gray-600">This section would display your past invoices.</p>
//       <p className="text-gray-500 mt-4">No invoices to display yet.</p>
//     </div>
//   );
// };

// export default BusinessPage;


import React, { useState, useEffect, useCallback } from 'react';
import { getCompanyProfile, updateCompanyProfile ,fetchAllUsers} from '../api'; // Import your API functions

// Main BusinessPage component - now simpler, primarily handles navigation
const BusinessPage = () => {
    const [activeSection, setActiveSection] = useState('subscription'); // Default to 'subscription'

    const renderContent = () => {
        // Each section component will now handle its own data fetching and state
        switch (activeSection) {
            case 'general':
                return <GeneralSettings />;
            case 'billing':
                return <BillingSettings />;
            case 'subscription':
                return <SubscriptionSettings />;
            case 'invoices':
                return <InvoicesSection />; // Placeholder for invoices
            default:
                return <SubscriptionSettings />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-inter antialiased flex flex-col">
            <div className="flex flex-grow">
                {/* Sidebar */}
                <aside className="w-64 bg-white p-6 shadow-md rounded-br-lg">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Edit Business</h2>
                    <nav>
                        <ul>
                            <li>
                                <button
                                    onClick={() => setActiveSection('general')}
                                    className={`w-full text-left py-2 px-4 rounded-lg text-lg ${
                                        activeSection === 'general' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    General
                                </button>
                            </li>
                            <li className="mt-2">
                                <button
                                    onClick={() => setActiveSection('billing')}
                                    className={`w-full text-left py-2 px-4 rounded-lg text-lg ${
                                        activeSection === 'billing' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    Billing
                                </button>
                            </li>
                            <li className="mt-2">
                                <button
                                    onClick={() => setActiveSection('subscription')}
                                    className={`w-full text-left py-2 px-4 rounded-lg text-lg ${
                                        activeSection === 'subscription' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    Subscription
                                </button>
                            </li>
                            <li className="mt-2">
                                <button
                                    onClick={() => setActiveSection('invoices')}
                                    className={`w-full text-left py-2 px-4 rounded-lg text-lg ${
                                        activeSection === 'invoices' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    Invoices
                                </button>
                            </li>
                        </ul>
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-8 overflow-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

// Reusable Input Field Component - Remains the same, good for consistency
const InputField = ({ label, id, type = 'text', value, onChange, rows = 1 }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-gray-700 text-sm font-bold mb-2">
            {label}
        </label>
        {type === 'textarea' ? (
            <textarea
                id={id}
                rows={rows}
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={value || ''}
                onChange={onChange}
            ></textarea>
        ) : (
            <input
                type={type}
                id={id}
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={value || ''}
                onChange={onChange}
            />
        )}
    </div>
);

// General Settings Component - Now handles its own data
const GeneralSettings = () => {
    const [companyName, setCompanyName] = useState('');
    const [companyAddress1, setCompanyAddress1] = useState('');
    const [companyAddress2, setCompanyAddress2] = useState('');
    const [companyCity, setCompanyCity] = useState('');
    const [companyState, setCompanyState] = useState('');
    const [companyPostcode, setCompanyPostcode] = useState('');
    const [companyCountry, setCompanyCountry] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    const fetchGeneralData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getCompanyProfile();
            const data = response.data;
            console.log("General setings data",  data)
            setCompanyName(data.companyName || '');
            setCompanyAddress1(data.companyAddress?.addressLine1 || '');
            setCompanyAddress2(data.companyAddress?.addressLine2 || '');
            setCompanyCity(data.companyAddress?.city || '');
            setCompanyState(data.companyAddress?.state || '');
            setCompanyPostcode(data.companyAddress?.postcode || '');
            setCompanyCountry(data.companyAddress?.country || '');
            setContactEmail(data.contactEmail || '');
        } catch (err) {
            console.error('Error fetching general company profile:', err);
            setError(err.response?.data?.message || 'Failed to load general settings.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGeneralData();
    }, [fetchGeneralData]);

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        setMessage('');
        try {
            const updates = {
                companyName,
                companyAddress: {
                    addressLine1: companyAddress1,
                    addressLine2: companyAddress2,
                    city: companyCity,
                    state: companyState,
                    postcode: companyPostcode,
                    country: companyCountry,
                },
                contactEmail,
            };
            await updateCompanyProfile(updates);
            setMessage('General settings saved successfully!');
            setTimeout(() => setMessage(''), 3000);
            // Re-fetch data to ensure consistency if other sections also update
            fetchGeneralData();
        } catch (err) {
            console.error('Error saving general settings:', err);
            setError(err.response?.data?.message || 'Failed to save general settings.');
            setMessage(`Error: ${err.response?.data?.message || 'Failed to save general settings.'}`);
            setTimeout(() => setMessage(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-600">Loading general settings...</div>;
    }
    if (error) {
        return <div className="text-center py-8 text-red-600">Error: {error}</div>;
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">General Company Details</h1>
            {message && (
                <div className={`p-3 mb-4 rounded-lg text-center ${error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                </div>
            )}
            <InputField label="Company Name" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            <InputField label="Address Line 1" id="companyAddress1" value={companyAddress1} onChange={(e) => setCompanyAddress1(e.target.value)} />
            <InputField label="Address Line 2" id="companyAddress2" value={companyAddress2} onChange={(e) => setCompanyAddress2(e.target.value)} />
            <InputField label="City" id="companyCity" value={companyCity} onChange={(e) => setCompanyCity(e.target.value)} />
            <InputField label="State" id="companyState" value={companyState} onChange={(e) => setCompanyState(e.target.value)} />
            <InputField label="Postcode" id="companyPostcode" value={companyPostcode} onChange={(e) => setCompanyPostcode(e.target.value)} />
            <InputField label="Country" id="companyCountry" value={companyCountry} onChange={(e) => setCompanyCountry(e.target.value)} />
            <InputField label="Contact Email" id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />

            <div className="flex justify-end mt-6">
                <button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};

// Billing Settings Component - Now handles its own data
const BillingSettings = () => {
    const [billingName, setBillingName] = useState('');
    const [billingStreet, setBillingStreet] = useState('');
    const [billingCountry, setBillingCountry] = useState('');
    const [billingPostcode, setBillingPostcode] = useState('');
    const [invoiceEmail, setInvoiceEmail] = useState('');
    const [isEditingBillingAddress, setIsEditingBillingAddress] = useState(false);

    const [companyNameAddr, setCompanyNameAddr] = useState('');
    const [companyStreet, setCompanyStreet] = useState('');
    const [companyCountry, setCompanyCountry] = useState('');
    const [companyPostcode, setCompanyPostcode] = useState('');
    const [isEditingCompanyAddress, setIsEditingCompanyAddress] = useState(false);

    const [taxInfo, setTaxInfo] = useState('');
    const [isEditingTaxInfo, setIsEditingTaxInfo] = useState(false);

    const [paymentDetails, setPaymentDetails] = useState('');
    const [isEditingPaymentDetails, setIsEditingPaymentDetails] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    const fetchBillingData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getCompanyProfile();
            const data = response.data;
            setBillingName(data.billingAddress?.name || '');
            setBillingStreet(data.billingAddress?.street || '');
            setBillingCountry(data.billingAddress?.country || '');
            setBillingPostcode(data.billingAddress?.postcode || '');
            setInvoiceEmail(data.invoiceEmail || '');

            setCompanyNameAddr(data.companyAddressForBilling?.name || '');
            setCompanyStreet(data.companyAddressForBilling?.street || '');
            setCompanyCountry(data.companyAddressForBilling?.country || '');
            setCompanyPostcode(data.companyAddressForBilling?.postcode || '');

            setTaxInfo(data.taxInfo || 'N/A');
            setPaymentDetails(data.paymentDetails || 'Not set');
        } catch (err) {
            console.error('Error fetching billing company profile:', err);
            setError(err.response?.data?.message || 'Failed to load billing settings.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBillingData();
    }, [fetchBillingData]);

    const handleSaveBillingAddress = async () => {
        setLoading(true);
        setError(null);
        setMessage('');
        try {
            const updates = {
                billingAddress: {
                    name: billingName,
                    street: billingStreet,
                    city: billingStreet.split(',')[0].trim(),
                    postcode: billingPostcode,
                    country: billingCountry,
                },
                invoiceEmail,
            };
            await updateCompanyProfile(updates);
            setMessage('Billing address saved!');
            setTimeout(() => setMessage(''), 3000);
            setIsEditingBillingAddress(false);
            fetchBillingData(); // Re-fetch to update all fields
        } catch (err) {
            console.error('Error saving billing address:', err);
            setError(err.response?.data?.message || 'Failed to save billing address.');
            setMessage(`Error: ${err.response?.data?.message || 'Failed to save billing address.'}`);
            setTimeout(() => setMessage(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCompanyAddress = async () => {
        setLoading(true);
        setError(null);
        setMessage('');
        try {
            const updates = {
                companyAddressForBilling: {
                    name: companyNameAddr,
                    street: companyStreet,
                    city: companyStreet.split(',')[0].trim(),
                    postcode: companyPostcode,
                    country: companyCountry,
                },
            };
            await updateCompanyProfile(updates);
            setMessage('Company address for billing saved!');
            setTimeout(() => setMessage(''), 3000);
            setIsEditingCompanyAddress(false);
            fetchBillingData(); // Re-fetch to update all fields
        } catch (err) {
            console.error('Error saving company address for billing:', err);
            setError(err.response?.data?.message || 'Failed to save company address for billing.');
            setMessage(`Error: ${err.response?.data?.message || 'Failed to save company address for billing.'}`);
            setTimeout(() => setMessage(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTaxInfo = async () => {
        setLoading(true);
        setError(null);
        setMessage('');
        try {
            const updates = { taxInfo };
            await updateCompanyProfile(updates);
            setMessage('Tax information saved!');
            setTimeout(() => setMessage(''), 3000);
            setIsEditingTaxInfo(false);
            fetchBillingData(); // Re-fetch to update all fields
        } catch (err) {
            console.error('Error saving tax information:', err);
            setError(err.response?.data?.message || 'Failed to save tax information.');
            setMessage(`Error: ${err.response?.data?.message || 'Failed to save tax information.'}`);
            setTimeout(() => setMessage(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePaymentDetails = async () => {
        setLoading(true);
        setError(null);
        setMessage('');
        try {
            const updates = { paymentDetails };
            await updateCompanyProfile(updates);
            setMessage('Payment details saved!');
            setTimeout(() => setMessage(''), 3000);
            setIsEditingPaymentDetails(false);
            fetchBillingData(); // Re-fetch to update all fields
        } catch (err) {
            console.error('Error saving payment details:', err);
            setError(err.response?.data?.message || 'Failed to save payment details.');
            setMessage(`Error: ${err.response?.data?.message || 'Failed to save payment details.'}`);
            setTimeout(() => setMessage(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-600">Loading billing settings...</div>;
    }
    if (error) {
        return <div className="text-center py-8 text-red-600">Error: {error}</div>;
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Account Information</h1>
            {message && (
                <div className={`p-3 mb-4 rounded-lg text-center ${error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                </div>
            )}
            {/* Billing Address Section */}
            <div className="mb-8 p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-gray-800">Billing address</h2>
                    {!isEditingBillingAddress && (
                        <button
                            onClick={() => setIsEditingBillingAddress(true)}
                            className="text-blue-600 hover:underline font-medium py-1 px-3 rounded-lg"
                        >
                            Edit Billing address
                        </button>
                    )}
                </div>
                {isEditingBillingAddress ? (
                    <div className="space-y-3">
                        <InputField label="Name" id="billingName" value={billingName} onChange={(e) => setBillingName(e.target.value)} />
                        <InputField label="Street/City" id="billingStreet" value={billingStreet} onChange={(e) => setBillingStreet(e.target.value)} />
                        <InputField label="Postcode" id="billingPostcode" value={billingPostcode} onChange={(e) => setBillingPostcode(e.target.value)} />
                        <InputField label="Country" id="billingCountry" value={billingCountry} onChange={(e) => setBillingCountry(e.target.value)} />
                        <InputField label="Invoice Email" id="invoiceEmail" type="email" value={invoiceEmail} onChange={(e) => setInvoiceEmail(e.target.value)} />
                        <button
                            onClick={handleSaveBillingAddress}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 mt-4"
                        >
                            Save
                        </button>
                    </div>
                ) : (
                    <div className="text-gray-700">
                        <p>{billingName}</p>
                        <p>{billingStreet}</p>
                        <p>{billingPostcode}</p>
                        <p>{billingCountry}</p>
                        <p>Invoice will be emailed {invoiceEmail}</p>
                    </div>
                )}
            </div>

            {/* Company Address Section */}
            <div className="mb-8 p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-gray-800">Company address</h2>
                    {!isEditingCompanyAddress && (
                        <button
                            onClick={() => setIsEditingCompanyAddress(true)}
                            className="text-blue-600 hover:underline font-medium py-1 px-3 rounded-lg"
                        >
                            Edit Company address
                        </button>
                    )}
                </div>
                {isEditingCompanyAddress ? (
                    <div className="space-y-3">
                        <InputField label="Name" id="companyNameAddr" value={companyNameAddr} onChange={(e) => setCompanyNameAddr(e.target.value)} />
                        <InputField label="Street/City" id="companyStreet" value={companyStreet} onChange={(e) => setCompanyStreet(e.target.value)} />
                        <InputField label="Postcode" id="companyPostcode" value={companyPostcode} onChange={(e) => setCompanyPostcode(e.target.value)} />
                        <InputField label="Country" id="companyCountry" value={companyCountry} onChange={(e) => setCompanyCountry(e.target.value)} />
                        <button
                            onClick={handleSaveCompanyAddress}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 mt-4"
                        >
                            Save
                        </button>
                    </div>
                ) : (
                    <div className="text-gray-700">
                        <p>{companyNameAddr}</p>
                        <p>{companyStreet}</p>
                        <p>{companyPostcode}</p>
                        <p>{companyCountry}</p>
                    </div>
                )}
            </div>

            {/* Tax Information Section */}
            <div className="mb-8 p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-gray-800">Tax Information</h2>
                    {!isEditingTaxInfo && (
                        <button
                            onClick={() => setIsEditingTaxInfo(true)}
                            className="text-blue-600 hover:underline font-medium py-1 px-3 rounded-lg"
                        >
                            Edit Tax Information
                        </button>
                    )}
                </div>
                {isEditingTaxInfo ? (
                    <div className="space-y-3">
                        <InputField label="Tax ID" id="taxInfo" value={taxInfo} onChange={(e) => setTaxInfo(e.target.value)} />
                        <button
                            onClick={handleSaveTaxInfo}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 mt-4"
                        >
                            Save
                        </button>
                    </div>
                ) : (
                    <div className="text-gray-700">
                        <p>{taxInfo}</p>
                    </div>
                )}
            </div>

            {/* Payment Details Section */}
            <div className="mb-8 p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-gray-800">Payment Details</h2>
                    {!isEditingPaymentDetails && (
                        <button
                            onClick={() => setIsEditingPaymentDetails(true)}
                            className="text-blue-600 hover:underline font-medium py-1 px-3 rounded-lg"
                        >
                            Edit Payment Details
                        </button>
                    )}
                </div>
                {isEditingPaymentDetails ? (
                    <div className="space-y-3">
                        <InputField label="Payment Method" id="paymentDetails" value={paymentDetails} onChange={(e) => setPaymentDetails(e.target.value)} />
                        <button
                            onClick={handleSavePaymentDetails}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 mt-4"
                        >
                            Save
                        </button>
                    </div>
                ) : (
                    <div className="text-gray-700">
                        <p>{paymentDetails}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Subscription Settings Component - Now handles its own data
const SubscriptionSettings = () => {
    const [scheduling, setScheduling] = useState('');
    const [nextInvoiceDate, setNextInvoiceDate] = useState('');
    const [hrPricePerUser, setHrPricePerUser] = useState('');
    const [hrDescription, setHrDescription] = useState('');
    const [totalUsersCount, setTotalUsersCount] = useState(0); // New state for total users
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    const fetchSubscriptionAndUsersData = useCallback(async () => { // Renamed to reflect fetching both
        setLoading(true);
        setError(null);
        try {
            // Fetch company profile data
            const companyResponse = await getCompanyProfile();
            const companyData = companyResponse.data;
            console.log(companyData)
            setScheduling(companyData.scheduling || 'MONTHLY');
            setNextInvoiceDate(
                companyData.nextInvoiceDate ? new Date(companyData.nextInvoiceDate).toLocaleDateString('en-GB') : ''
            );
            setHrPricePerUser(companyData.hrPricePerUser || '£290');
            setHrDescription(companyData.hrDescription || 'Default HR plan description.');

            // Fetch all users data
            const usersResponse = await fetchAllUsers();
            console.log(usersResponse.data.data)
            setTotalUsersCount(usersResponse.data.data.length || 0); // Assuming usersResponse.data is an array of users

        } catch (err) {
            console.error('Error fetching subscription or user data:', err);
            setError(err.response?.data?.message || 'Failed to load subscription settings or user count.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubscriptionAndUsersData();
    }, [fetchSubscriptionAndUsersData]);

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        setMessage('');
        try {
            const updates = {
                scheduling,
                nextInvoiceDate: nextInvoiceDate ? new Date(nextInvoiceDate).toISOString() : null,
                hrPricePerUser,
                hrDescription,
                // currentUsers is no longer sent as it's derived from fetchAllUsers
            };
            await updateCompanyProfile(updates);
            setMessage('Subscription settings saved successfully!');
            setTimeout(() => setMessage(''), 3000);
            fetchSubscriptionAndUsersData(); // Re-fetch to ensure consistency
        } catch (err) {
            console.error('Error saving subscription settings:', err);
            setError(err.response?.data?.message || 'Failed to save subscription settings.');
            setMessage(`Error: ${err.response?.data?.message || 'Failed to save subscription settings.'}`);
            setTimeout(() => setMessage(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-600">Loading subscription settings...</div>;
    }
    if (error) {
        return <div className="text-center py-8 text-red-600">Error: {error}</div>;
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Plan</h1>
            {message && (
                <div className={`p-3 mb-4 rounded-lg text-center ${error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                </div>
            )}
            {/* Plan Details */}
            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-semibold text-gray-800">Scheduling <span className="text-blue-600 text-lg">{scheduling}</span></h2>
                        <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition duration-200">
                            Change Plan
                        </button>
                    </div>
                    <p className="text-gray-600 mb-6">Next invoice issued {nextInvoiceDate}</p>

                    {/* HR Plan Card */}
                    <div className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">HR</h3>
                        <InputField
                            label="Price per user/month (ex VAT)"
                            id="hrPrice"
                            value={hrPricePerUser}
                            onChange={(e) => setHrPricePerUser(e.target.value)}
                        />
                        <InputField
                            label="Description"
                            id="hrDescription"
                            type="textarea"
                            rows={3}
                            value={hrDescription}
                            onChange={(e) => setHrDescription(e.target.value)}
                        />
                        <div className="flex gap-4 mt-4">
                            <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition duration-200">
                                Try for Free
                            </button>
                            <button className="text-blue-600 hover:underline font-medium py-2 px-4">
                                Learn more
                            </button>
                        </div>
                    </div>
                </div>

                {/* Current Users Card - Now displays dynamic user count */}
                <div className="flex-shrink-0 w-full md:w-48 bg-blue-50 p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
                    <div className="text-blue-600 text-5xl font-bold mb-2">
                        {totalUsersCount} {/* Display fetched user count */}
                    </div>
                    <p className="text-blue-800 text-lg">Current Users</p>
                </div>
            </div>

            {/* Bottom Buttons */}
            <div className="flex flex-wrap gap-4 mt-8 justify-center md:justify-start">
                <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200">
                    Cancel Shiftry subscription
                </button>
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg shadow-md transition duration-200">
                    Visit Pricing Page
                </button>
                <button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};

// Invoices Section (Placeholder)
const InvoicesSection = () => {
    return (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Invoices</h1>
            <p className="text-gray-600">This section would display your past invoices.</p>
            <p className="text-gray-500 mt-4">No invoices to display yet.</p>
        </div>
    );
};

export default BusinessPage;
