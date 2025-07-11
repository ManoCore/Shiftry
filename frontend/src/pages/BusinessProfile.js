

import React, { useState, useEffect, useCallback } from 'react';
import { getCompanyProfile, updateCompanyProfile ,fetchAllUsers,getInvoicesForAdmin, downloadInvoice,updateAdminStatus} from '../api'; // Import your API functions
import {useAuth} from '../context/AuthContext';



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
function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm md:max-w-md p-6 md:p-8 transform transition-all duration-300 ease-out scale-95 opacity-0 animate-scale-in">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6 text-center">
                    {title}
                </h2>
                <p className="text-sm text-gray-700 mb-6 text-center">
                    {message}
                </p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200 text-base font-medium"
                    >
                        No
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 text-base font-medium"
                    >
                        Yes
                    </button>
                </div>
            </div>
        </div>
    );
}

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
    const { user, logout } = useAuth();
    const [scheduling, setScheduling] = useState('');
    const [nextInvoiceDate, setNextInvoiceDate] = useState('');
    const [hrPricePerUser, setHrPricePerUser] = useState('');
    const [hrDescription, setHrDescription] = useState('');
    const [totalUsersCount, setTotalUsersCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);
    const [isConfirmCancelModalOpen, setIsConfirmCancelModalOpen] = useState(false); // State to control modal visibility

    const fetchSubscriptionAndUsersData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const companyResponse = await getCompanyProfile();
            const companyData = companyResponse.data;
            console.log(companyData)
            setScheduling(companyData.scheduling || 'MONTHLY');
            setNextInvoiceDate(
                companyData.nextInvoiceDate ? new Date(companyData.nextInvoiceDate).toLocaleDateString('en-GB') : ''
            );
            setHrPricePerUser(companyData.hrPricePerUser || '£290');
            setHrDescription(companyData.hrDescription || 'Default HR plan description.');

            const usersResponse = await fetchAllUsers();
            setTotalUsersCount(usersResponse.data.data.length || 0);

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
            };
            await updateCompanyProfile(updates);
            setMessage('Subscription settings saved successfully!');
            setTimeout(() => setMessage(''), 3000);
            fetchSubscriptionAndUsersData();
        } catch (err) {
            console.error('Error saving subscription settings:', err);
            setError(err.response?.data?.message || 'Failed to save subscription settings.');
            setMessage(`Error: ${err.response?.data?.message || 'Failed to save subscription settings.'}`);
            setTimeout(() => setMessage(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    // This function is triggered by the "Cancel Shiftry subscription" button click.
    // It opens the custom confirmation modal.
    const handleCancelSubscription = () => {
        if (user) {
            console.log("handleCancelSubscription: user.id =", user.id);
        }

        if (!user || !user.id) {
            setMessage('Error: User not identified for cancellation. (No user or user.id)');
            setTimeout(() => setMessage(''), 5000);
            return;
        }

        // Open the custom ConfirmationModal instead of using window.confirm.
        setIsConfirmCancelModalOpen(true);
    };

    // This function contains the core logic for subscription cancellation.
    // It is called ONLY when the user clicks the "Yes" button within the ConfirmationModal.
    const confirmCancellationAction = async () => {
        // Close the modal immediately after the user confirms.
        setIsConfirmCancelModalOpen(false);

        setIsCancelling(true);
        setError(null);
        setMessage('');

        try {
            await updateAdminStatus(user.id, 'inactive');
            setMessage('Subscription cancelled. Your account has been deactivated. Please log in again once access is granted by Super Admin.');
            setTimeout(() => {
                logout();
            }, 3000);
        } catch (err) {
            console.error('Error cancelling subscription:', err.response?.data || err);
            setError(err.response?.data?.message || 'Failed to cancel subscription.');
            setMessage(`Error: ${err.response?.data?.message || 'Failed to cancel subscription.'}`);
        } finally {
            setIsCancelling(false);
            setTimeout(() => setMessage(''), 5000);
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
            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-semibold text-gray-800">Scheduling <span className="text-blue-600 text-lg">{scheduling}</span></h2>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200">
                        <div className="flex flex-col">
                            <label htmlFor="hrPrice" className="text-sm font-medium text-gray-600 mb-1">
                                Price per month (ex VAT)
                            </label>
                            <div className="text-xl font-semibold text-gray-900 bg-gray-100 px-4 py-2 rounded-md shadow-sm">
                                €299
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-shrink-0 w-full md:w-48 bg-blue-50 p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
                    <div className="text-blue-600 text-5xl font-bold mb-2">
                        {totalUsersCount}
                    </div>
                    <p className="text-blue-800 text-lg">Current Users</p>
                </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-8 justify-center md:justify-start">
                <button
                    onClick={handleCancelSubscription} // This button triggers the modal
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200"
                    disabled={isCancelling || user?.status === 'inactive'}
                >
                    {isCancelling ? 'Cancelling...' : 'Cancel Shiftry subscription'}
                </button>
            </div>

            {/* CONFIRMATION MODAL RENDERING: This is the crucial part that displays the modal */}
            <ConfirmationModal
                isOpen={isConfirmCancelModalOpen} // Controls visibility based on state
                onClose={() => setIsConfirmCancelModalOpen(false)} // Function to close the modal (e.g., on "No" click)
                onConfirm={confirmCancellationAction} // Function to call when "Yes" is clicked
                title="Confirm Subscription Cancellation"
                message="Are you sure you want to cancel your Shiftry subscription? Your account will be deactivated immediately."
            />
        </div>
    );
};

// Invoices Section (Placeholder)
const InvoicesSection = () => {
    // Correctly access 'user.id' instead of 'user._id'
    const { user, isLoading: isAuthLoading } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [invoicesLoading, setInvoicesLoading] = useState(true);
    const [invoicesError, setInvoicesError] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');

    // --- ADD THESE CONSOLE.LOGS ---
    console.log("InvoicesSection: isAuthLoading =", isAuthLoading);
    console.log("InvoicesSection: user object =", user);
    if (user) {
        console.log("InvoicesSection: user.role =", user.role);
        console.log("InvoicesSection: user.id =", user.id); // Changed to user.id
    }
    // --- END CONSOLE.LOGS ---

    useEffect(() => {
        const fetchInvoices = async () => {
            // Changed user._id to user.id in the condition
            if (!user || !user.id || user.role !== 'admin') {
                setInvoicesLoading(false);
                setInvoicesError("You must be an admin to view invoices.");
                return;
            }

            setInvoicesLoading(true);
            setInvoicesError('');
            try {
                // Changed user._id to user.id when calling the API
                const response = await getInvoicesForAdmin(user.id);
                setInvoices(response.data.data);
            } catch (err) {
                console.error("Error fetching invoices:", err.response?.data || err);
                setInvoicesError(err.response?.data?.message || "Failed to load invoices.");
            } finally {
                setInvoicesLoading(false);
            }
        };

        if (!isAuthLoading && user) {
            fetchInvoices();
        }
    }, [user, isAuthLoading]);

    const handleDownloadInvoice = async (invoiceId, originalFileName) => {
        try {
            const response = await downloadInvoice(invoiceId);
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = originalFileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error downloading invoice:", err.response?.data || err);
            alert(err.response?.data?.message || "Failed to download invoice.");
        }
    };

    // const handleViewInvoice = (invoice) => {
    //     const fileExtension = invoice.originalFileName.split('.').pop().toLowerCase();
    //     const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

    //     const lastSlashIndex = invoice.filePath.lastIndexOf('/');
    //     const lastBackslashIndex = invoice.filePath.lastIndexOf('\\');
    //     const actualFileName = invoice.filePath.substring(Math.max(lastSlashIndex, lastBackslashIndex) + 1);
    //     const directPublicUrl = `${baseUrl}/uploads/invoices/${actualFileName}`;

    //     if (fileExtension === 'pdf') {
    //         window.open(directPublicUrl, '_blank');
    //     } else if (fileExtension === 'doc' || fileExtension === 'docx') {
    //         window.open(directPublicUrl, '_blank');
    //     } else {
    //         alert('Unsupported file type for direct viewing. Please download.');
    //     }
    // };

    const getMonths = () => [
        { value: '', label: 'All Months' },
        { value: '0', label: 'January' }, { value: '1', label: 'February' },
        { value: '2', label: 'March' }, { value: '3', label: 'April' },
        { value: '4', label: 'May' }, { value: '5', label: 'June' },
        { value: '6', label: 'July' }, { value: '7', label: 'August' },
        { value: '8', label: 'September' }, { value: '9', label: 'October' },
        { value: '10', label: 'November' }, { value: '11', label: 'December' }
    ];

    const getYears = () => {
        const currentYear = new Date().getFullYear();
        const years = [{ value: '', label: 'All Years' }];
        for (let i = currentYear; i >= currentYear - 5; i--) {
            years.push({ value: i.toString(), label: i.toString() });
        }
        return years;
    };

    const filteredInvoices = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.invoiceDate || invoice.uploadedAt);
        const invoiceMonth = invoiceDate.getMonth().toString();
        const invoiceYear = invoiceDate.getFullYear().toString();
        const matchMonth = selectedMonth === '' || invoiceMonth === selectedMonth;
        const matchYear = selectedYear === '' || invoiceYear === selectedYear;
        return matchMonth && matchYear;
    });

    if (isAuthLoading) {
        return (
            <div className="text-center py-8 text-gray-600">Loading user data for invoices...</div>
        );
    }

    // This condition will now correctly check for user.id
    if (!user || user.role !== 'admin') {
        return (
            <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto text-center">
                <h1 className="text-3xl font-bold text-red-600 mb-6">Access Denied</h1>
                <p className="text-gray-700">You do not have the necessary permissions to view invoices.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Invoices</h1>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <label htmlFor="month-filter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Month</label>
                    <select
                        id="month-filter"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                        {getMonths().map(month => (
                            <option key={month.value} value={month.value}>{month.label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1">
                    <label htmlFor="year-filter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Year</label>
                    <select
                        id="year-filter"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        {getYears().map(year => (
                            <option key={year.value} value={year.value}>{year.label}</option>
                        ))}
                    </select>
                </div>
            </div>
            {invoicesLoading ? (
                <p className="text-gray-500">Loading invoices...</p>
            ) : invoicesError ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">
                    <span className="block sm:inline">{invoicesError}</span>
                </div>
            ) : filteredInvoices.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Invoices</h1>
                    <p className="text-gray-600">This section would display your past invoices.</p>
                    <p className="text-gray-500 mt-4">No invoices to display yet.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original File Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Date</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredInvoices.map((invoice) => (
                                <tr key={invoice._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {invoice.invoiceNumber || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {invoice.originalFileName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {invoice.amount ? `$${invoice.amount.toFixed(2)}` : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : new Date(invoice.uploadedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex justify-center space-x-2">
                                            {/* <button
                                                onClick={() => handleViewInvoice(invoice)}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                View
                                            </button> */}
                                            <button
                                                onClick={() => handleDownloadInvoice(invoice._id, invoice.originalFileName)}
                                                className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                Download
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default BusinessPage;




// import React, { useState, useEffect, useCallback } from 'react';
// import { getCompanyProfile, updateCompanyProfile ,fetchAllUsers} from '../api'; // Import your API functions

// // Main BusinessPage component - now simpler, primarily handles navigation
// const BusinessPage = () => {
//     const [activeSection, setActiveSection] = useState('subscription'); // Default to 'subscription'

//     const renderContent = () => {
//         // Each section component will now handle its own data fetching and state
//         switch (activeSection) {
//             case 'general':
//                 return <GeneralSettings />;
//             case 'billing':
//                 return <BillingSettings />;
//             case 'subscription':
//                 return <SubscriptionSettings />;
//             case 'invoices':
//                 return <InvoicesSection />; // Placeholder for invoices
//             default:
//                 return <SubscriptionSettings />;
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gray-100 font-inter antialiased flex flex-col">
//             <div className="flex flex-grow">
//                 {/* Sidebar */}
//                 <aside className="w-64 bg-white p-6 shadow-md rounded-br-lg">
//                     <h2 className="text-xl font-semibold text-gray-800 mb-6">Edit Business</h2>
//                     <nav>
//                         <ul>
//                             <li>
//                                 <button
//                                     onClick={() => setActiveSection('general')}
//                                     className={`w-full text-left py-2 px-4 rounded-lg text-lg ${
//                                         activeSection === 'general' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
//                                     }`}
//                                 >
//                                     General
//                                 </button>
//                             </li>
//                             <li className="mt-2">
//                                 <button
//                                     onClick={() => setActiveSection('billing')}
//                                     className={`w-full text-left py-2 px-4 rounded-lg text-lg ${
//                                         activeSection === 'billing' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
//                                     }`}
//                                 >
//                                     Billing
//                                 </button>
//                             </li>
//                             <li className="mt-2">
//                                 <button
//                                     onClick={() => setActiveSection('subscription')}
//                                     className={`w-full text-left py-2 px-4 rounded-lg text-lg ${
//                                         activeSection === 'subscription' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
//                                     }`}
//                                 >
//                                     Subscription
//                                 </button>
//                             </li>
//                             <li className="mt-2">
//                                 <button
//                                     onClick={() => setActiveSection('invoices')}
//                                     className={`w-full text-left py-2 px-4 rounded-lg text-lg ${
//                                         activeSection === 'invoices' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
//                                     }`}
//                                 >
//                                     Invoices
//                                 </button>
//                             </li>
//                         </ul>
//                     </nav>
//                 </aside>

//                 {/* Main Content Area */}
//                 <main className="flex-1 p-8 overflow-auto">
//                     {renderContent()}
//                 </main>
//             </div>
//         </div>
//     );
// };

// // Reusable Input Field Component - Remains the same, good for consistency
// const InputField = ({ label, id, type = 'text', value, onChange, rows = 1 }) => (
//     <div className="mb-4">
//         <label htmlFor={id} className="block text-gray-700 text-sm font-bold mb-2">
//             {label}
//         </label>
//         {type === 'textarea' ? (
//             <textarea
//                 id={id}
//                 rows={rows}
//                 className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 value={value || ''}
//                 onChange={onChange}
//             ></textarea>
//         ) : (
//             <input
//                 type={type}
//                 id={id}
//                 className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 value={value || ''}
//                 onChange={onChange}
//             />
//         )}
//     </div>
// );

// // General Settings Component - Now handles its own data
// const GeneralSettings = () => {
//     const [companyName, setCompanyName] = useState('');
//     const [companyAddress1, setCompanyAddress1] = useState('');
//     const [companyAddress2, setCompanyAddress2] = useState('');
//     const [companyCity, setCompanyCity] = useState('');
//     const [companyState, setCompanyState] = useState('');
//     const [companyPostcode, setCompanyPostcode] = useState('');
//     const [companyCountry, setCompanyCountry] = useState('');
//     const [contactEmail, setContactEmail] = useState('');
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [message, setMessage] = useState('');

//     const fetchGeneralData = useCallback(async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const response = await getCompanyProfile();
//             const data = response.data;
//             console.log("General setings data",  data)
//             setCompanyName(data.companyName || '');
//             setCompanyAddress1(data.companyAddress?.addressLine1 || '');
//             setCompanyAddress2(data.companyAddress?.addressLine2 || '');
//             setCompanyCity(data.companyAddress?.city || '');
//             setCompanyState(data.companyAddress?.state || '');
//             setCompanyPostcode(data.companyAddress?.postcode || '');
//             setCompanyCountry(data.companyAddress?.country || '');
//             setContactEmail(data.contactEmail || '');
//         } catch (err) {
//             console.error('Error fetching general company profile:', err);
//             setError(err.response?.data?.message || 'Failed to load general settings.');
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchGeneralData();
//     }, [fetchGeneralData]);

//     const handleSave = async () => {
//         setLoading(true);
//         setError(null);
//         setMessage('');
//         try {
//             const updates = {
//                 companyName,
//                 companyAddress: {
//                     addressLine1: companyAddress1,
//                     addressLine2: companyAddress2,
//                     city: companyCity,
//                     state: companyState,
//                     postcode: companyPostcode,
//                     country: companyCountry,
//                 },
//                 contactEmail,
//             };
//             await updateCompanyProfile(updates);
//             setMessage('General settings saved successfully!');
//             setTimeout(() => setMessage(''), 3000);
//             // Re-fetch data to ensure consistency if other sections also update
//             fetchGeneralData();
//         } catch (err) {
//             console.error('Error saving general settings:', err);
//             setError(err.response?.data?.message || 'Failed to save general settings.');
//             setMessage(`Error: ${err.response?.data?.message || 'Failed to save general settings.'}`);
//             setTimeout(() => setMessage(''), 5000);
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (loading) {
//         return <div className="text-center py-8 text-gray-600">Loading general settings...</div>;
//     }
//     if (error) {
//         return <div className="text-center py-8 text-red-600">Error: {error}</div>;
//     }

//     return (
//         <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
//             <h1 className="text-3xl font-bold text-gray-800 mb-6">General Company Details</h1>
//             {message && (
//                 <div className={`p-3 mb-4 rounded-lg text-center ${error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
//                     {message}
//                 </div>
//             )}
//             <InputField label="Company Name" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
//             <InputField label="Address Line 1" id="companyAddress1" value={companyAddress1} onChange={(e) => setCompanyAddress1(e.target.value)} />
//             <InputField label="Address Line 2" id="companyAddress2" value={companyAddress2} onChange={(e) => setCompanyAddress2(e.target.value)} />
//             <InputField label="City" id="companyCity" value={companyCity} onChange={(e) => setCompanyCity(e.target.value)} />
//             <InputField label="State" id="companyState" value={companyState} onChange={(e) => setCompanyState(e.target.value)} />
//             <InputField label="Postcode" id="companyPostcode" value={companyPostcode} onChange={(e) => setCompanyPostcode(e.target.value)} />
//             <InputField label="Country" id="companyCountry" value={companyCountry} onChange={(e) => setCompanyCountry(e.target.value)} />
//             <InputField label="Contact Email" id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />

//             <div className="flex justify-end mt-6">
//                 <button
//                     onClick={handleSave}
//                     className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200"
//                 >
//                     Save Changes
//                 </button>
//             </div>
//         </div>
//     );
// };

// // Billing Settings Component - Now handles its own data
// const BillingSettings = () => {
//     const [billingName, setBillingName] = useState('');
//     const [billingStreet, setBillingStreet] = useState('');
//     const [billingCountry, setBillingCountry] = useState('');
//     const [billingPostcode, setBillingPostcode] = useState('');
//     const [invoiceEmail, setInvoiceEmail] = useState('');
//     const [isEditingBillingAddress, setIsEditingBillingAddress] = useState(false);

//     const [companyNameAddr, setCompanyNameAddr] = useState('');
//     const [companyStreet, setCompanyStreet] = useState('');
//     const [companyCountry, setCompanyCountry] = useState('');
//     const [companyPostcode, setCompanyPostcode] = useState('');
//     const [isEditingCompanyAddress, setIsEditingCompanyAddress] = useState(false);

//     const [taxInfo, setTaxInfo] = useState('');
//     const [isEditingTaxInfo, setIsEditingTaxInfo] = useState(false);

//     const [paymentDetails, setPaymentDetails] = useState('');
//     const [isEditingPaymentDetails, setIsEditingPaymentDetails] = useState(false);

//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [message, setMessage] = useState('');

//     const fetchBillingData = useCallback(async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const response = await getCompanyProfile();
//             const data = response.data;
//             setBillingName(data.billingAddress?.name || '');
//             setBillingStreet(data.billingAddress?.street || '');
//             setBillingCountry(data.billingAddress?.country || '');
//             setBillingPostcode(data.billingAddress?.postcode || '');
//             setInvoiceEmail(data.invoiceEmail || '');

//             setCompanyNameAddr(data.companyAddressForBilling?.name || '');
//             setCompanyStreet(data.companyAddressForBilling?.street || '');
//             setCompanyCountry(data.companyAddressForBilling?.country || '');
//             setCompanyPostcode(data.companyAddressForBilling?.postcode || '');

//             setTaxInfo(data.taxInfo || 'N/A');
//             setPaymentDetails(data.paymentDetails || 'Not set');
//         } catch (err) {
//             console.error('Error fetching billing company profile:', err);
//             setError(err.response?.data?.message || 'Failed to load billing settings.');
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchBillingData();
//     }, [fetchBillingData]);

//     const handleSaveBillingAddress = async () => {
//         setLoading(true);
//         setError(null);
//         setMessage('');
//         try {
//             const updates = {
//                 billingAddress: {
//                     name: billingName,
//                     street: billingStreet,
//                     city: billingStreet.split(',')[0].trim(),
//                     postcode: billingPostcode,
//                     country: billingCountry,
//                 },
//                 invoiceEmail,
//             };
//             await updateCompanyProfile(updates);
//             setMessage('Billing address saved!');
//             setTimeout(() => setMessage(''), 3000);
//             setIsEditingBillingAddress(false);
//             fetchBillingData(); // Re-fetch to update all fields
//         } catch (err) {
//             console.error('Error saving billing address:', err);
//             setError(err.response?.data?.message || 'Failed to save billing address.');
//             setMessage(`Error: ${err.response?.data?.message || 'Failed to save billing address.'}`);
//             setTimeout(() => setMessage(''), 5000);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleSaveCompanyAddress = async () => {
//         setLoading(true);
//         setError(null);
//         setMessage('');
//         try {
//             const updates = {
//                 companyAddressForBilling: {
//                     name: companyNameAddr,
//                     street: companyStreet,
//                     city: companyStreet.split(',')[0].trim(),
//                     postcode: companyPostcode,
//                     country: companyCountry,
//                 },
//             };
//             await updateCompanyProfile(updates);
//             setMessage('Company address for billing saved!');
//             setTimeout(() => setMessage(''), 3000);
//             setIsEditingCompanyAddress(false);
//             fetchBillingData(); // Re-fetch to update all fields
//         } catch (err) {
//             console.error('Error saving company address for billing:', err);
//             setError(err.response?.data?.message || 'Failed to save company address for billing.');
//             setMessage(`Error: ${err.response?.data?.message || 'Failed to save company address for billing.'}`);
//             setTimeout(() => setMessage(''), 5000);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleSaveTaxInfo = async () => {
//         setLoading(true);
//         setError(null);
//         setMessage('');
//         try {
//             const updates = { taxInfo };
//             await updateCompanyProfile(updates);
//             setMessage('Tax information saved!');
//             setTimeout(() => setMessage(''), 3000);
//             setIsEditingTaxInfo(false);
//             fetchBillingData(); // Re-fetch to update all fields
//         } catch (err) {
//             console.error('Error saving tax information:', err);
//             setError(err.response?.data?.message || 'Failed to save tax information.');
//             setMessage(`Error: ${err.response?.data?.message || 'Failed to save tax information.'}`);
//             setTimeout(() => setMessage(''), 5000);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleSavePaymentDetails = async () => {
//         setLoading(true);
//         setError(null);
//         setMessage('');
//         try {
//             const updates = { paymentDetails };
//             await updateCompanyProfile(updates);
//             setMessage('Payment details saved!');
//             setTimeout(() => setMessage(''), 3000);
//             setIsEditingPaymentDetails(false);
//             fetchBillingData(); // Re-fetch to update all fields
//         } catch (err) {
//             console.error('Error saving payment details:', err);
//             setError(err.response?.data?.message || 'Failed to save payment details.');
//             setMessage(`Error: ${err.response?.data?.message || 'Failed to save payment details.'}`);
//             setTimeout(() => setMessage(''), 5000);
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (loading) {
//         return <div className="text-center py-8 text-gray-600">Loading billing settings...</div>;
//     }
//     if (error) {
//         return <div className="text-center py-8 text-red-600">Error: {error}</div>;
//     }

//     return (
//         <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
//             <h1 className="text-3xl font-bold text-gray-800 mb-6">Account Information</h1>
//             {message && (
//                 <div className={`p-3 mb-4 rounded-lg text-center ${error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
//                     {message}
//                 </div>
//             )}
//             {/* Billing Address Section */}
//             <div className="mb-8 p-4 border border-gray-200 rounded-lg">
//                 <div className="flex justify-between items-center mb-2">
//                     <h2 className="text-xl font-semibold text-gray-800">Billing address</h2>
//                     {!isEditingBillingAddress && (
//                         <button
//                             onClick={() => setIsEditingBillingAddress(true)}
//                             className="text-blue-600 hover:underline font-medium py-1 px-3 rounded-lg"
//                         >
//                             Edit Billing address
//                         </button>
//                     )}
//                 </div>
//                 {isEditingBillingAddress ? (
//                     <div className="space-y-3">
//                         <InputField label="Name" id="billingName" value={billingName} onChange={(e) => setBillingName(e.target.value)} />
//                         <InputField label="Street/City" id="billingStreet" value={billingStreet} onChange={(e) => setBillingStreet(e.target.value)} />
//                         <InputField label="Postcode" id="billingPostcode" value={billingPostcode} onChange={(e) => setBillingPostcode(e.target.value)} />
//                         <InputField label="Country" id="billingCountry" value={billingCountry} onChange={(e) => setBillingCountry(e.target.value)} />
//                         <InputField label="Invoice Email" id="invoiceEmail" type="email" value={invoiceEmail} onChange={(e) => setInvoiceEmail(e.target.value)} />
//                         <button
//                             onClick={handleSaveBillingAddress}
//                             className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 mt-4"
//                         >
//                             Save
//                         </button>
//                     </div>
//                 ) : (
//                     <div className="text-gray-700">
//                         <p>{billingName}</p>
//                         <p>{billingStreet}</p>
//                         <p>{billingPostcode}</p>
//                         <p>{billingCountry}</p>
//                         <p>Invoice will be emailed {invoiceEmail}</p>
//                     </div>
//                 )}
//             </div>

//             {/* Company Address Section */}
//             <div className="mb-8 p-4 border border-gray-200 rounded-lg">
//                 <div className="flex justify-between items-center mb-2">
//                     <h2 className="text-xl font-semibold text-gray-800">Company address</h2>
//                     {!isEditingCompanyAddress && (
//                         <button
//                             onClick={() => setIsEditingCompanyAddress(true)}
//                             className="text-blue-600 hover:underline font-medium py-1 px-3 rounded-lg"
//                         >
//                             Edit Company address
//                         </button>
//                     )}
//                 </div>
//                 {isEditingCompanyAddress ? (
//                     <div className="space-y-3">
//                         <InputField label="Name" id="companyNameAddr" value={companyNameAddr} onChange={(e) => setCompanyNameAddr(e.target.value)} />
//                         <InputField label="Street/City" id="companyStreet" value={companyStreet} onChange={(e) => setCompanyStreet(e.target.value)} />
//                         <InputField label="Postcode" id="companyPostcode" value={companyPostcode} onChange={(e) => setCompanyPostcode(e.target.value)} />
//                         <InputField label="Country" id="companyCountry" value={companyCountry} onChange={(e) => setCompanyCountry(e.target.value)} />
//                         <button
//                             onClick={handleSaveCompanyAddress}
//                             className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 mt-4"
//                         >
//                             Save
//                         </button>
//                     </div>
//                 ) : (
//                     <div className="text-gray-700">
//                         <p>{companyNameAddr}</p>
//                         <p>{companyStreet}</p>
//                         <p>{companyPostcode}</p>
//                         <p>{companyCountry}</p>
//                     </div>
//                 )}
//             </div>

//             {/* Tax Information Section */}
//             <div className="mb-8 p-4 border border-gray-200 rounded-lg">
//                 <div className="flex justify-between items-center mb-2">
//                     <h2 className="text-xl font-semibold text-gray-800">Tax Information</h2>
//                     {!isEditingTaxInfo && (
//                         <button
//                             onClick={() => setIsEditingTaxInfo(true)}
//                             className="text-blue-600 hover:underline font-medium py-1 px-3 rounded-lg"
//                         >
//                             Edit Tax Information
//                         </button>
//                     )}
//                 </div>
//                 {isEditingTaxInfo ? (
//                     <div className="space-y-3">
//                         <InputField label="Tax ID" id="taxInfo" value={taxInfo} onChange={(e) => setTaxInfo(e.target.value)} />
//                         <button
//                             onClick={handleSaveTaxInfo}
//                             className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 mt-4"
//                         >
//                             Save
//                         </button>
//                     </div>
//                 ) : (
//                     <div className="text-gray-700">
//                         <p>{taxInfo}</p>
//                     </div>
//                 )}
//             </div>

//             {/* Payment Details Section */}
//             <div className="mb-8 p-4 border border-gray-200 rounded-lg">
//                 <div className="flex justify-between items-center mb-2">
//                     <h2 className="text-xl font-semibold text-gray-800">Payment Details</h2>
//                     {!isEditingPaymentDetails && (
//                         <button
//                             onClick={() => setIsEditingPaymentDetails(true)}
//                             className="text-blue-600 hover:underline font-medium py-1 px-3 rounded-lg"
//                         >
//                             Edit Payment Details
//                         </button>
//                     )}
//                 </div>
//                 {isEditingPaymentDetails ? (
//                     <div className="space-y-3">
//                         <InputField label="Payment Method" id="paymentDetails" value={paymentDetails} onChange={(e) => setPaymentDetails(e.target.value)} />
//                         <button
//                             onClick={handleSavePaymentDetails}
//                             className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 mt-4"
//                         >
//                             Save
//                         </button>
//                     </div>
//                 ) : (
//                     <div className="text-gray-700">
//                         <p>{paymentDetails}</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// // Subscription Settings Component - Now handles its own data
// const SubscriptionSettings = () => {
//     const [scheduling, setScheduling] = useState('');
//     const [nextInvoiceDate, setNextInvoiceDate] = useState('');
//     const [hrPricePerUser, setHrPricePerUser] = useState('');
//     const [hrDescription, setHrDescription] = useState('');
//     const [totalUsersCount, setTotalUsersCount] = useState(0); // New state for total users
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [message, setMessage] = useState('');

//     const fetchSubscriptionAndUsersData = useCallback(async () => { // Renamed to reflect fetching both
//         setLoading(true);
//         setError(null);
//         try {
//             // Fetch company profile data
//             const companyResponse = await getCompanyProfile();
//             const companyData = companyResponse.data;
//             console.log(companyData)
//             setScheduling(companyData.scheduling || 'MONTHLY');
//             setNextInvoiceDate(
//                 companyData.nextInvoiceDate ? new Date(companyData.nextInvoiceDate).toLocaleDateString('en-GB') : ''
//             );
//             setHrPricePerUser(companyData.hrPricePerUser || '£290');
//             setHrDescription(companyData.hrDescription || 'Default HR plan description.');

//             // Fetch all users data
//             const usersResponse = await fetchAllUsers();
//             console.log(usersResponse.data.data)
//             setTotalUsersCount(usersResponse.data.data.length || 0); // Assuming usersResponse.data is an array of users

//         } catch (err) {
//             console.error('Error fetching subscription or user data:', err);
//             setError(err.response?.data?.message || 'Failed to load subscription settings or user count.');
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchSubscriptionAndUsersData();
//     }, [fetchSubscriptionAndUsersData]);

//     const handleSave = async () => {
//         setLoading(true);
//         setError(null);
//         setMessage('');
//         try {
//             const updates = {
//                 scheduling,
//                 nextInvoiceDate: nextInvoiceDate ? new Date(nextInvoiceDate).toISOString() : null,
//                 hrPricePerUser,
//                 hrDescription,
//                 // currentUsers is no longer sent as it's derived from fetchAllUsers
//             };
//             await updateCompanyProfile(updates);
//             setMessage('Subscription settings saved successfully!');
//             setTimeout(() => setMessage(''), 3000);
//             fetchSubscriptionAndUsersData(); // Re-fetch to ensure consistency
//         } catch (err) {
//             console.error('Error saving subscription settings:', err);
//             setError(err.response?.data?.message || 'Failed to save subscription settings.');
//             setMessage(`Error: ${err.response?.data?.message || 'Failed to save subscription settings.'}`);
//             setTimeout(() => setMessage(''), 5000);
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (loading) {
//         return <div className="text-center py-8 text-gray-600">Loading subscription settings...</div>;
//     }
//     if (error) {
//         return <div className="text-center py-8 text-red-600">Error: {error}</div>;
//     }

//     return (
//         <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
//             <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Plan</h1>
//             {message && (
//                 <div className={`p-3 mb-4 rounded-lg text-center ${error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
//                     {message}
//                 </div>
//             )}
//             {/* Plan Details */}
//             <div className="flex flex-col md:flex-row gap-8">
//                 <div className="flex-1">
//                     <div className="flex items-center justify-between mb-4">
//                         <h2 className="text-2xl font-semibold text-gray-800">Scheduling <span className="text-blue-600 text-lg">{scheduling}</span></h2>
//                         <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition duration-200">
//                             Change Plan
//                         </button>
//                     </div>
//                     <p className="text-gray-600 mb-6">Next invoice issued {nextInvoiceDate}</p>

//                     {/* HR Plan Card */}
//                     <div className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200">
//                         <h3 className="text-xl font-semibold text-gray-800 mb-2">HR</h3>
//                         <InputField
//                             label="Price per user/month (ex VAT)"
//                             id="hrPrice"
//                             value={hrPricePerUser}
//                             onChange={(e) => setHrPricePerUser(e.target.value)}
//                         />
//                         <InputField
//                             label="Description"
//                             id="hrDescription"
//                             type="textarea"
//                             rows={3}
//                             value={hrDescription}
//                             onChange={(e) => setHrDescription(e.target.value)}
//                         />
//                         <div className="flex gap-4 mt-4">
//                             <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition duration-200">
//                                 Try for Free
//                             </button>
//                             <button className="text-blue-600 hover:underline font-medium py-2 px-4">
//                                 Learn more
//                             </button>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Current Users Card - Now displays dynamic user count */}
//                 <div className="flex-shrink-0 w-full md:w-48 bg-blue-50 p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
//                     <div className="text-blue-600 text-5xl font-bold mb-2">
//                         {totalUsersCount} {/* Display fetched user count */}
//                     </div>
//                     <p className="text-blue-800 text-lg">Current Users</p>
//                 </div>
//             </div>

//             {/* Bottom Buttons */}
//             <div className="flex flex-wrap gap-4 mt-8 justify-center md:justify-start">
//                 <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200">
//                     Cancel Shiftry subscription
//                 </button>
//                 <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg shadow-md transition duration-200">
//                     Visit Pricing Page
//                 </button>
//                 <button
//                     onClick={handleSave}
//                     className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200"
//                 >
//                     Save Changes
//                 </button>
//             </div>
//         </div>
//     );
// };

// // Invoices Section (Placeholder)
// const InvoicesSection = () => {
//     return (
//         <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto text-center">
//             <h1 className="text-3xl font-bold text-gray-800 mb-6">Invoices</h1>
//             <p className="text-gray-600">This section would display your past invoices.</p>
//             <p className="text-gray-500 mt-4">No invoices to display yet.</p>
//         </div>
//     );
// };

// export default BusinessPage;
