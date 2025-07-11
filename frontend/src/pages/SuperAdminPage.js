
import React, { useEffect, useState } from "react";
import { getAdmins, deleteAdmin, updateAdminStatus, uploadInvoice } from "../api";
import AddUserModal from "./AddUserModal";
import { useAuth } from '../context/AuthContext';
import 'jspdf-autotable';
// import axios from 'axios'; // Removed: axios is not directly used here anymore

// =============================================================================
// UploadInvoiceModal Component (Now integrated into this file)
// =============================================================================
function UploadInvoiceModal({ isOpen, onClose, admin, onInvoiceUploaded }) {
    // Moved conditional return AFTER all hook calls
    const { authToken } = useAuth(); // This hook must be called unconditionally
    const [selectedFile, setSelectedFile] = useState(null);
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [invoiceDate, setInvoiceDate] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');

    // Now, conditionally render the modal's content, not the hooks themselves
    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            const maxFileSize = 5 * 1024 * 1024; // 5MB

            if (!allowedTypes.includes(file.type)) {
                setUploadError('Only PDF, DOC, or DOCX files are allowed.');
                setSelectedFile(null);
                return;
            }
            if (file.size > maxFileSize) {
                setUploadError('File size exceeds 5MB limit.');
                setSelectedFile(null);
                return;
            }
            setSelectedFile(file);
            setUploadError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        setUploadError('');
        setUploadSuccess('');

        if (!selectedFile) {
            setUploadError('Please select an invoice file.');
            setUploading(false);
            return;
        }

        const formData = new FormData();
        formData.append('invoiceFile', selectedFile);
        if (invoiceNumber) formData.append('invoiceNumber', invoiceNumber);
        if (amount) formData.append('amount', amount);
        if (invoiceDate) formData.append('invoiceDate', invoiceDate);

        try {
            // The API instance in '../api' should handle the Authorization header using authToken
            // So, you don't need to pass it explicitly here if your API interceptor is set up.
            const response = await uploadInvoice(admin._id, formData);

            setUploadSuccess(response.data.message || 'Invoice uploaded successfully!');
            onInvoiceUploaded();
            setSelectedFile(null);
            setInvoiceNumber('');
            setAmount('');
            setInvoiceDate('');
            setTimeout(() => onClose(), 2000);
        } catch (err) {
            console.error('Error uploading invoice:', err.response?.data || err);
            setUploadError(err.response?.data?.message || 'Failed to upload invoice. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 md:p-8 transform transition-all duration-300 ease-out scale-95 opacity-0 animate-scale-in">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6 text-center">
                    Upload Invoice for {admin.name}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="invoiceFile" className="block text-sm font-medium text-gray-700 mb-1">
                            Select Invoice File (PDF, DOC, DOCX - Max 5MB)
                        </label>
                        <input
                            type="file"
                            id="invoiceFile"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {selectedFile && (
                            <p className="mt-2 text-sm text-gray-500">Selected: {selectedFile.name}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-1">
                            Invoice Number (Optional)
                        </label>
                        <input
                            type="text"
                            id="invoiceNumber"
                            value={invoiceNumber}
                            onChange={(e) => setInvoiceNumber(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="e.g., INV-2024-001"
                        />
                    </div>

                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                            Amount (Optional)
                        </label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="e.g., 125.50"
                            step="0.01"
                        />
                    </div>

                    <div>
                        <label htmlFor="invoiceDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Invoice Date (Optional)
                        </label>
                        <input
                            type="date"
                            id="invoiceDate"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    {uploadError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">
                            <span className="block sm:inline">{uploadError}</span>
                        </div>
                    )}
                    {uploadSuccess && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-sm" role="alert">
                            <span className="block sm:inline">{uploadSuccess}</span>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200 text-base font-medium"
                            disabled={uploading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 text-base font-medium flex items-center justify-center"
                            disabled={uploading}
                        >
                            {uploading ? (
                                <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                            )}
                            {uploading ? 'Uploading...' : 'Upload Invoice'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// =============================================================================
// SuperAdminPage Component
// =============================================================================
export default function SuperAdminPage() {
    const { user: currentUser, isLoading: isAuthLoading } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedAdminId, setSelectedAdminId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const [isUploadInvoiceModalOpen, setIsUploadInvoiceModalOpen] = useState(false);
    const [adminToUploadInvoiceFor, setAdminToUploadInvoiceFor] = useState(null);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const res = await getAdmins();

            const formattedAdmins = res.data.data.map(admin => ({
                _id: admin._id,
                name: `${admin.firstName || ''} ${admin.lastName || ''}`.trim(),
                email: admin.emailId,
                accessLevel: admin.role,
                isActive: admin.status === 'active'
            }));

            setAdmins(formattedAdmins);
            setError("");
        } catch (err) {
            console.error("Error fetching admins:", err);
            setError(err.response?.data?.message || "Failed to load administrators. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser && currentUser.role === 'superadmin') {
            fetchAdmins();
        } else if (!isAuthLoading) {
            setError("You do not have permission to view this page.");
            setLoading(false);
        }
    }, [currentUser, isAuthLoading]);

    const handleAdminAdded = () => {
        fetchAdmins();
        setIsAddAdminModalOpen(false);
        setSuccessMessage("Administrator added successfully!");
        setTimeout(() => setSuccessMessage(""), 5000);
    };

    const handleDeleteAdmin = (adminId) => {
        setSelectedAdminId(adminId);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteAdmin = async () => {
        if (!selectedAdminId) return;
        setLoading(true);
        setError(null);

        try {
            await deleteAdmin(selectedAdminId);
            setAdmins((prev) => prev.filter((admin) => admin._id !== selectedAdminId));
            setSuccessMessage("Administrator deleted successfully!");
            setIsDeleteModalOpen(false);
            setSelectedAdminId(null);
        } catch (err) {
            console.error("Failed to delete admin:", {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data,
            });
            setError(err.response?.data?.message || "Failed to delete administrator. Please try again.");
        } finally {
            setLoading(false);
            setTimeout(() => {
                setError(null);
                setSuccessMessage("");
            }, 5000);
        }
    };

    const toggleAdminAccess = async (adminId, currentIsActive) => {
        setLoading(true);
        setError(null);
        const newStatus = currentIsActive ? 'inactive' : 'active';

        try {
            await updateAdminStatus(adminId, newStatus);

            setAdmins(prevAdmins =>
                prevAdmins.map(admin =>
                    admin._id === adminId ? { ...admin, isActive: !currentIsActive } : admin
                )
            );
            setSuccessMessage(`Admin access ${newStatus === 'active' ? 'granted' : 'revoked'} successfully.`);
        } catch (err) {
            console.error("Failed to toggle admin access:", err.response?.data || err);
            setError(err.response?.data?.message || "Failed to toggle admin access. Please try again.");
        } finally {
            setLoading(false);
            setTimeout(() => setSuccessMessage(""), 5000);
        }
    };

    const handleUploadInvoiceClick = (admin) => {
        setAdminToUploadInvoiceFor(admin);
        setIsUploadInvoiceModalOpen(true);
    };

    const filteredAdmins = admins.filter(admin =>
        (admin.name && admin.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (admin.email && admin.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (isAuthLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <p className="text-gray-600">Checking permissions...</p>
            </div>
        );
    }

    if (currentUser && currentUser.role !== 'superadmin') {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
                    <p className="text-gray-700">You do not have the necessary permissions to view this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
            <aside className="w-full md:w-64 bg-white p-4 md:p-6 shadow-md border-b md:border-r border-gray-200">
                <div className="mb-4 md:mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-2 md:mb-4 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-gray-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                        </svg>
                        Admin Management
                    </h2>
                </div>
            </aside>

            <main className="flex-1 p-4 md:p-8">
                <div className="mb-4 md:mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800">Administrators</h1>
                    <p className="text-sm text-gray-600">Showing {filteredAdmins.length} Out of {admins.length} Admins</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                    <div className="relative flex-grow w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Search admins by name or email..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                        </svg>
                    </div>
                    <button
                        className="flex items-center bg-blue-50 border border-blue-400 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 transition duration-200 text-sm font-medium w-full sm:w-auto justify-center"
                        onClick={() => {
                            Promise.all([
                                import('jspdf'),
                                import('jspdf-autotable')
                            ]).then(([jsPDFModule, autoTableModule]) => {
                                const jsPDF = jsPDFModule.default;
                                const doc = new jsPDF();
                                const tableColumn = ["Name", "Email", "Access Level", "Active Status"];
                                const tableRows = filteredAdmins.map(admin => [
                                    admin.name,
                                    admin.email,
                                    admin.accessLevel,
                                    admin.isActive ? 'Active' : 'Inactive'
                                ]);
                                autoTableModule.default(doc, {
                                    head: [tableColumn],
                                    body: tableRows,
                                    startY: 20,
                                    styles: { fontSize: 9 }
                                });
                                doc.text("Admins Export", 14, 15);
                                doc.save("admins.pdf");
                            });
                        }}
                    >
                        <span>
                            <img src="/outbox.svg" alt="Export icon" className='w-[20px] mr-1 text-blue-600' />
                        </span>
                        Export
                    </button>
                </div>

                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline"> {successMessage}</span>
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                )}

                {loading ? (
                    <p className="text-gray-500">Loading administrators...</p>
                ) : filteredAdmins.length === 0 ? (
                    <p className="text-gray-500">No administrators found matching your search.</p>
                ) : (
                    <>
                        {/* Table for larger screens */}
                        <div className="hidden md:block bg-white shadow rounded-md overflow-x-auto">
                            <table className="min-w-full text-left table-auto">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Access Level</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Active Status</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredAdmins.map((admin, index) => (
                                        <tr
                                            key={admin._id || index}
                                            className="hover:bg-gray-50 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{admin.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{admin.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">{admin.accessLevel}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {admin.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-center space-x-2">
                                                    <button
                                                        onClick={() => toggleAdminAccess(admin._id, admin.isActive)}
                                                        className={`px-3 py-1 rounded text-white text-xs font-medium transition-colors ${admin.isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
                                                        disabled={loading}
                                                    >
                                                        {admin.isActive ? 'Revoke Access' : 'Grant Access'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAdmin(admin._id)}
                                                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-medium"
                                                        disabled={loading}
                                                    >
                                                        Delete
                                                    </button>
                                                    <button
                                                        onClick={() => handleUploadInvoiceClick(admin)}
                                                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium"
                                                        disabled={loading}
                                                        title={`Upload Invoice for ${admin.name}`}
                                                    >
                                                        Upload Invoice
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Card view for mobile screens */}
                        <div className="md:hidden grid grid-cols-1 gap-4">
                            {filteredAdmins.map((admin, index) => (
                                <div
                                    key={admin._id || index}
                                    className="bg-white shadow rounded-md p-4 border border-gray-200"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-lg font-semibold text-gray-800">{admin.name}</h3>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {admin.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-sm text-gray-700">
                                        <p><span className="font-medium">Email:</span> {admin.email}</p>
                                        <p><span className="font-medium">Access Level:</span> {admin.accessLevel}</p>
                                    </div>
                                    <div className="mt-4 flex justify-end space-x-2">
                                        <button
                                            onClick={() => toggleAdminAccess(admin._id, admin.isActive)}
                                            className={`px-3 py-1 rounded text-white text-xs font-medium transition-colors ${admin.isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
                                            disabled={loading}
                                        >
                                            {admin.isActive ? 'Revoke Access' : 'Grant Access'}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAdmin(admin._id)}
                                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-medium"
                                            disabled={loading}
                                        >
                                            Delete
                                        </button>
                                        <button
                                            onClick={() => handleUploadInvoiceClick(admin)}
                                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium"
                                            disabled={loading}
                                            title={`Upload Invoice for ${admin.name}`}
                                        >
                                            Upload Invoice
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>

            <AddUserModal
                isOpen={isAddAdminModalOpen}
                onClose={() => setIsAddAdminModalOpen(false)}
                onUserAdded={handleAdminAdded}
                id="add-admin-modal"
                isAddingAdmin={true}
            />

            {isUploadInvoiceModalOpen && adminToUploadInvoiceFor && (
                <UploadInvoiceModal
                    isOpen={isUploadInvoiceModalOpen}
                    onClose={() => {
                        setIsUploadInvoiceModalOpen(false);
                        setAdminToUploadInvoiceFor(null);
                    }}
                    admin={adminToUploadInvoiceFor}
                    onInvoiceUploaded={() => {
                        setSuccessMessage(`Invoice uploaded successfully for ${adminToUploadInvoiceFor.name}!`);
                        setTimeout(() => setSuccessMessage(""), 5000);
                    }}
                />
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm md:max-w-md p-6 md:p-8 transform transition-all duration-300 ease-out scale-95 opacity-0 animate-scale-in">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6 text-center">
                            Confirm Deletion
                        </h2>
                        <p className="text-sm text-gray-700 mb-6 text-center">
                            Are you sure you want to delete the administrator "{admins.find(a => a._id === selectedAdminId)?.name}"? This action cannot be undone.
                        </p>
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">
                                <strong className="font-bold">Error: </strong>
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200 text-base font-medium"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteAdmin}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 text-base font-medium flex items-center justify-center"
                                disabled={loading}
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    'Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}



// import React, { useEffect, useState } from "react";
// // Import specific superadmin APIs, and reuse addUser if applicable
// import { getAdmins, deleteAdmin, updateAdminStatus} from "../api"; 
// import AddUserModal from "./AddUserModal";
// import { useAuth } from '../context/AuthContext';
// import 'jspdf-autotable';

// export default function SuperAdminPage() {
//     const { user: currentUser, isLoading: isAuthLoading } = useAuth(); // Renamed to avoid conflict
//     const [admins, setAdmins] = useState([]); // State to hold admin users
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
//     const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false); // Modal for adding new admin
//     const [searchQuery, setSearchQuery] = useState("");
//     const [selectedAdminId, setSelectedAdminId] = useState(null); // ID of selected admin for details/deletion
//     const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//     const [successMessage, setSuccessMessage] = useState("");

//     // Function to fetch ONLY admin users from the backend using the new API
//     const fetchAdmins = async () => {
//         try {
//             setLoading(true);
//             // Use the specific getAdmins API
//             const res = await getAdmins(); 
            
//             // The backend /superadmin/admins endpoint should already return only admins,
//             // so no need for client-side filtering here.
//             const formattedAdmins = res.data.data.map(admin => ({
//                 _id: admin._id,
//                 name: `${admin.firstName || ''} ${admin.lastName || ''}`.trim(), // Assuming backend returns firstName, lastName
//                 email: admin.emailId, // Assuming backend returns emailId
//                 accessLevel: admin.role, // Assuming backend returns role
//                 isActive: admin.status === 'active' // Map backend 'status' to frontend 'isActive' boolean
//             }));

//             setAdmins(formattedAdmins);
//             setError("");
//         } catch (err) {
//             console.error("Error fetching admins:", err);
//             setError(err.response?.data?.message || "Failed to load administrators. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         // Only fetch admins if the current logged-in user is a superadmin
//         if (currentUser && currentUser.role === 'superadmin') { // CRITICAL: Changed from 'admin' to 'superadmin'
//             fetchAdmins();
//         } else if (!isAuthLoading) {
//             // If not superadmin and auth is not loading, redirect or show unauthorized message
//             setError("You do not have permission to view this page.");
//             setLoading(false);
//         }
//     }, [currentUser, isAuthLoading]);

//     const handleAdminAdded = () => {
//         fetchAdmins(); // Refresh the list of admins
//         setIsAddAdminModalOpen(false);
//         setSuccessMessage("Administrator added successfully!");
//         setTimeout(() => setSuccessMessage(""), 5000);
//     };

//     const handleDeleteAdmin = (adminId) => {
//         setSelectedAdminId(adminId);
//         setIsDeleteModalOpen(true);
//     };

//     const confirmDeleteAdmin = async () => {
//         if (!selectedAdminId) return;
//         setLoading(true);
//         setError(null);

//         try {
//             // Use the specific deleteAdmin API
//             await deleteAdmin(selectedAdminId); 
//             setAdmins((prev) => prev.filter((admin) => admin._id !== selectedAdminId));
//             setSuccessMessage("Administrator deleted successfully!");
//             setIsDeleteModalOpen(false);
//             setSelectedAdminId(null);
//         } catch (err) {
//             console.error("Failed to delete admin:", {
//                 message: err.message,
//                 status: err.response?.status,
//                 data: err.response?.data,
//             });
//             setError(err.response?.data?.message || "Failed to delete administrator. Please try again.");
//         } finally {
//             setLoading(false);
//             setTimeout(() => {
//                 setError(null);
//                 setSuccessMessage("");
//             }, 5000);
//         }
//     };

//     // This function would toggle an 'isActive' status for the admin
//     // You'd need a backend API endpoint for this (e.g., PUT /api/superadmin/admins/:id/toggle-status)
//     const toggleAdminAccess = async (adminId, currentIsActive) => {
//         setLoading(true);
//         setError(null);
//         const newStatus = currentIsActive ? 'inactive' : 'active'; // Determine the new status string

//         try {
//             // Call the new API to update the admin's status
//             await updateAdminStatus(adminId, newStatus);
            
//             // Update UI optimistically after successful API call
//             setAdmins(prevAdmins =>
//                 prevAdmins.map(admin =>
//                     admin._id === adminId ? { ...admin, isActive: !currentIsActive } : admin
//                 )
//             );
//             setSuccessMessage(`Admin access ${newStatus === 'active' ? 'granted' : 'revoked'} successfully.`);
//         } catch (err) {
//             console.error("Failed to toggle admin access:", err.response?.data || err);
//             setError(err.response?.data?.message || "Failed to toggle admin access. Please try again.");
//             // No need to revert optimistic update if it failed, as the state wouldn't have changed
//         } finally {
//             setLoading(false);
//             setTimeout(() => setSuccessMessage(""), 5000);
//         }
//     };

//     const filteredAdmins = admins.filter(admin =>
//         (admin.name && admin.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
//         (admin.email && admin.email.toLowerCase().includes(searchQuery.toLowerCase()))
//     );

//     // Render nothing or a loading spinner if auth is still loading
//     if (isAuthLoading) {
//         return (
//             <div className="flex justify-center items-center min-h-screen bg-gray-100">
//                 <p className="text-gray-600">Checking permissions...</p>
//                 {/* Or a spinner */}
//             </div>
//         );
//     }

//     // Render unauthorized message if not a superadmin
//     if (currentUser && currentUser.role !== 'superadmin') { // CRITICAL: Changed from 'admin' to 'superadmin'
//         return (
//             <div className="flex justify-center items-center min-h-screen bg-gray-100">
//                 <div className="bg-white p-8 rounded-lg shadow-md text-center">
//                     <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
//                     <p className="text-gray-700">You do not have the necessary permissions to view this page.</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
//             {/* Left Sidebar (Simplified for super admin) */}
//             <aside className="w-full md:w-64 bg-white p-4 md:p-6 shadow-md border-b md:border-r border-gray-200">
//                 <div className="mb-4 md:mb-8">
//                     <h2 className="text-xl font-bold text-gray-800 mb-2 md:mb-4 flex items-center">
//                         <svg className="w-6 h-6 mr-2 text-gray-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                             <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
//                         </svg>
//                         Admin Management
//                     </h2>
//                     {/* <button
//                         onClick={() => setIsAddAdminModalOpen(true)}
//                         className="w-full bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition duration-200 text-sm font-medium"
//                         aria-haspopup="dialog"
//                         aria-expanded={isAddAdminModalOpen}
//                         aria-controls="add-admin-modal"
//                     >
//                         Add New Admin
//                     </button> */}
//                 </div>
//                 {/* You might add other super admin specific navigation here */}
//             </aside>

//             {/* Main Content Area */}
//             <main className="flex-1 p-4 md:p-8">
//                 <div className="mb-4 md:mb-6">
//                     <h1 className="text-2xl font-semibold text-gray-800">Administrators</h1>
//                     <p className="text-sm text-gray-600">Showing {filteredAdmins.length} Out of {admins.length} Admins</p>
//                 </div>

//                 <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
//                     <div className="relative flex-grow w-full sm:w-auto">
//                         <input
//                             type="text"
//                             placeholder="Search admins by name or email..."
//                             className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//                             value={searchQuery}
//                             onChange={(e) => setSearchQuery(e.target.value)}
//                         />
//                         <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                             <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
//                         </svg>
//                     </div>
//                     {/* Export button for admins */}
//                     <button
//                         className="flex items-center bg-blue-50 border border-blue-400 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 transition duration-200 text-sm font-medium w-full sm:w-auto justify-center"
//                         onClick={() => {
//                             Promise.all([
//                                 import('jspdf'),
//                                 import('jspdf-autotable')
//                             ]).then(([jsPDFModule, autoTableModule]) => {
//                                 const jsPDF = jsPDFModule.default;
//                                 const doc = new jsPDF();
//                                 const tableColumn = ["Name", "Email", "Access Level", "Active Status"];
//                                 const tableRows = filteredAdmins.map(admin => [
//                                     admin.name,
//                                     admin.email,
//                                     admin.accessLevel,
//                                     admin.isActive ? 'Active' : 'Inactive'
//                                 ]);
//                                 autoTableModule.default(doc, {
//                                     head: [tableColumn],
//                                     body: tableRows,
//                                     startY: 20,
//                                     styles: { fontSize: 9 }
//                                 });
//                                 doc.text("Admins Export", 14, 15);
//                                 doc.save("admins.pdf");
//                             });
//                         }}
//                     >
//                         <span>
//                             <img src="/outbox.svg" alt="Export icon" className='w-[20px] mr-1 text-blue-600' />
//                         </span>
//                         Export
//                     </button>
//                 </div>

//                 {successMessage && (
//                     <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
//                         <span className="block sm:inline"> {successMessage}</span>
//                     </div>
//                 )}
//                 {error && (
//                     <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
//                         <strong className="font-bold">Error!</strong>
//                         <span className="block sm:inline"> {error}</span>
//                     </div>
//                 )}

//                 {loading ? (
//                     <p className="text-gray-500">Loading administrators...</p>
//                 ) : filteredAdmins.length === 0 ? (
//                     <p className="text-gray-500">No administrators found matching your search.</p>
//                 ) : (
//                     <>
//                         {/* Table for larger screens */}
//                         <div className="hidden md:block bg-white shadow rounded-md overflow-x-auto">
//                             <table className="min-w-full text-left table-auto">
//                                 <thead className="bg-gray-50 border-b border-gray-200">
//                                     <tr>
//                                         <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//                                         <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
//                                         <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Access Level</th>
//                                         <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Active Status</th>
//                                         <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-gray-200">
//                                     {filteredAdmins.map((admin, index) => (
//                                         <tr
//                                             key={admin._id || index}
//                                             className="hover:bg-gray-50 transition-colors duration-150"
//                                         >
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{admin.name}</td>
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{admin.email}</td>
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">{admin.accessLevel}</td>
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm">
//                                                 <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//                                                     {admin.isActive ? 'Active' : 'Inactive'}
//                                                 </span>
//                                             </td>
//                                             <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                                                 <div className="flex justify-center space-x-2">
//                                                     <button
//                                                         onClick={() => toggleAdminAccess(admin._id, admin.isActive)}
//                                                         className={`px-3 py-1 rounded text-white text-xs font-medium transition-colors ${admin.isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
//                                                         disabled={loading}
//                                                     >
//                                                         {admin.isActive ? 'Revoke Access' : 'Grant Access'}
//                                                     </button>
//                                                     <button
//                                                         onClick={() => handleDeleteAdmin(admin._id)}
//                                                         className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-medium"
//                                                         disabled={loading}
//                                                     >
//                                                         Delete
//                                                     </button>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>

//                         {/* Card view for mobile screens */}
//                         <div className="md:hidden grid grid-cols-1 gap-4">
//                             {filteredAdmins.map((admin, index) => (
//                                 <div
//                                     key={admin._id || index}
//                                     className="bg-white shadow rounded-md p-4 border border-gray-200"
//                                 >
//                                     <div className="flex justify-between items-center mb-2">
//                                         <h3 className="text-lg font-semibold text-gray-800">{admin.name}</h3>
//                                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//                                             {admin.isActive ? 'Active' : 'Inactive'}
//                                         </span>
//                                     </div>
//                                     <div className="space-y-1 text-sm text-gray-700">
//                                         <p><span className="font-medium">Email:</span> {admin.email}</p>
//                                         <p><span className="font-medium">Access Level:</span> {admin.accessLevel}</p>
//                                     </div>
//                                     <div className="mt-4 flex justify-end space-x-2">
//                                         <button
//                                             onClick={() => toggleAdminAccess(admin._id, admin.isActive)}
//                                             className={`px-3 py-1 rounded text-white text-xs font-medium transition-colors ${admin.isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
//                                             disabled={loading}
//                                         >
//                                             {admin.isActive ? 'Revoke Access' : 'Grant Access'}
//                                         </button>
//                                         <button
//                                             onClick={() => handleDeleteAdmin(admin._id)}
//                                             className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-medium"
//                                             disabled={loading}
//                                         >
//                                             Delete
//                                         </button>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </>
//                 )}
//             </main>

//             {/* The AddUserModal component (reused for adding admins) */}
//             <AddUserModal
//                 isOpen={isAddAdminModalOpen}
//                 onClose={() => setIsAddAdminModalOpen(false)}
//                 onUserAdded={handleAdminAdded} // This will trigger fetchAdmins
//                 id="add-admin-modal"
//                 isAddingAdmin={true} // Prop to customize modal for admin addition
//             />

//             {/* Delete Confirmation Modal */}
//             {isDeleteModalOpen && (
//                 <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm md:max-w-md p-6 md:p-8 transform transition-all duration-300 ease-out scale-95 opacity-0 animate-scale-in">
//                         <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6 text-center">
//                             Confirm Deletion
//                         </h2>
//                         <p className="text-sm text-gray-700 mb-6 text-center">
//                             Are you sure you want to delete the administrator "{admins.find(a => a._id === selectedAdminId)?.name}"? This action cannot be undone.
//                         </p>
//                         {error && (
//                             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">
//                                 <strong className="font-bold">Error: </strong>
//                                 <span className="block sm:inline">{error}</span>
//                             </div>
//                         )}
//                         <div className="flex justify-end space-x-2">
//                             <button
//                                 onClick={() => setIsDeleteModalOpen(false)}
//                                 className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200 text-base font-medium"
//                                 disabled={loading}
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={confirmDeleteAdmin}
//                                 className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 text-base font-medium flex items-center justify-center"
//                                 disabled={loading}
//                             >
//                                 {loading ? (
//                                     <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                     </svg>
//                                 ) : (
//                                     'Delete'
//                                 )}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }
