import React, { useEffect, useState } from "react";
import { fetchAllUsers, deleteUser  } from "../api"; // Assuming fetchAllUsers is defined here
import AddUserModal from "./AddUserModal";
import PeoplePersonalPage from "./PeoplePersonalPage"; // Import the PeoplePersonalPage component
import { useAuth } from '../context/AuthContext';
import 'jspdf-autotable';

export default function PeoplePage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false); // Renamed for clarity
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUserId, setSelectedUserId] = useState(null); // Changed to store only the ID
    const [isPersonalPageModalOpen, setIsPersonalPageModalOpen] = useState(false); // New state for the personal page modal visibility
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 
    const [successMessage, setSuccessMessage] = useState("");

    // Dummy data for Training and Leave Balance as they are not in the current user object
    const getTrainingStatus = (email) => {
        if (email.includes("example.com")) return "Completed";
        if (email.includes("test.com")) return "In Progress";
        return "N/A";
    };

    // const getLeaveBalance = (email) => {
    //     const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    //     return (hash % 10) + 5; // Between 5 and 14 days
    // };

    // Function to fetch users from the backend
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetchAllUsers();

            // Only map the fields directly returned by fetchAllUsers
            const formattedUsers = res.data.map(user => ({
                _id: user._id, // Ensure _id is included for selection
                name: user.name,
                email: user.email,
                accessLevel: user.access,
                status: user.status, // Assuming status is returned by fetchAllUsers
                visaStatus: user.visaStatus,
                employmentType: user.employmentType,
                training: user.training,
                // leaveBalance: getLeaveBalance(user.email),
            }));

            setUsers(formattedUsers);
            setError("");
        } catch (err) {
            console.error("Error fetching users:", err);
            setError("Failed to load users. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleUserAdded = () => {
        fetchUsers();
        setIsAddUserModalOpen(false);
    };

    const handleUserClick = (user) => {
        setSelectedUserId(user._id); // Store only the ID of the clicked user
        setIsPersonalPageModalOpen(true);
    };

    const handleDeleteUser = () => {
    if (!selectedUserId) return;
    setIsDeleteModalOpen(true);
};

const confirmDeleteUser = async () => {
    setLoading(true);
    setError(null);

    try {
        await deleteUser(selectedUserId);
        setUsers((prev) => prev.filter((user) => user._id !== selectedUserId));
        setSuccessMessage("User deleted successfully!");
        setIsDeleteModalOpen(false);
        setIsPersonalPageModalOpen(false);
        setSelectedUserId(null);
    } catch (err) {
        console.error("Failed to delete user:", {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data,
        });
        setError(err.response?.data?.message || "Failed to delete user. Please try again.");
    } finally {
        setLoading(false);
        setTimeout(() => {
            setError(null);
            setSuccessMessage("");
        }, 5000);
    }
};

    const isAdmin = user && user.role === 'admin';

    const filteredUsers = users.filter(user =>
        user.accessLevel !== 'admin' &&(
        (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.accessLevel && user.accessLevel.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    );

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
            {/* Left Sidebar */}
            <aside className="w-full md:w-64 bg-white p-4 md:p-6 shadow-md border-b md:border-r border-gray-200">
                <div className="mb-4 md:mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-2 md:mb-4 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-gray-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                        </svg>
                        Team Members
                    </h2>
                    {isAdmin && (
                        <button
                            onClick={() => setIsAddUserModalOpen(true)}
                            className="w-full bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition duration-200 text-sm font-medium"
                            aria-haspopup="dialog"
                            aria-expanded={isAddUserModalOpen}
                            aria-controls="add-user-modal"
                        >
                            Add People
                        </button>
                    )}
                </div>
                <nav className="hidden md:block space-y-6">
                    {/* ... (your commented out sidebar nav items) ... */}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-8">
                <div className="mb-4 md:mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800">People</h1>
                    <p className="text-sm text-gray-600">Showing {filteredUsers.length} Out of {users.length} Users</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                    <div className="relative flex-grow w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                        </svg>
                    </div>
                    {isAdmin && (
                        <button
                            className="flex items-center bg-blue-50 border border-blue-400 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 transition duration-200 text-sm font-medium w-full sm:w-auto justify-center"
                            onClick={() => {
                                Promise.all([
                                    import('jspdf'),
                                    import('jspdf-autotable')
                                ]).then(([jsPDFModule, autoTableModule]) => {
                                    const jsPDF = jsPDFModule.default;
                                    const doc = new jsPDF();
                                    const tableColumn = [
                                        "Name",
                                        "Access",
                                        "Email",
                                        "Training",
                                        "Visa Status",
                                        "Employment Type"
                                    ];
                                    const tableRows = filteredUsers.map(user => [
                                        user.name,
                                        user.accessLevel,
                                        user.email,
                                        user.training || 'N/A',
                                        user.leaveBalance,
                                        user.visaStatus || 'N/A',
                                        user.employmentType || 'N/A'
                                    ]);
                                    autoTableModule.default(doc, {
                                        head: [tableColumn],
                                        body: tableRows,
                                        startY: 20,
                                        styles: { fontSize: 9 }
                                    });
                                    doc.text("People Export", 14, 15);
                                    doc.save("people.pdf");
                                });
                            }}
                        >
                            <span>
                                <img src="/outbox.svg" alt="Export icon" className='w-[20px] mr-1 text-blue-600'/>
                            </span>
                            Export
                        </button>
                    )}
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                )}

                {loading ? (
                    <p className="text-gray-500">Loading users...</p>
                ) : filteredUsers.length === 0 ? (
                    <p className="text-gray-500">No users found matching your search.</p>
                ) : (
                    <>
                        {/* Table for larger screens */}
                        <div className="hidden md:block bg-white shadow rounded-md overflow-x-auto">
                            <table className="min-w-full text-left table-auto">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Access</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Training</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Visa Status</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Employment Type</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredUsers.map((user, index) => (
                                        <tr
                                            key={user._id || index} // Use _id for key
                                            className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                                            onClick={() => handleUserClick(user)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 underline">{user.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">{user.accessLevel}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.training || 'N/A'}</td>
                                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.leaveBalance}</td> */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.visaStatus || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.employmentType || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Card view for mobile screens */}
                        <div className="md:hidden grid grid-cols-1 gap-4">
                            {filteredUsers.map((user, index) => (
                                <div
                                    key={user._id || index} // Use _id for key
                                    className="bg-white shadow rounded-md p-4 border border-gray-200 cursor-pointer"
                                    onClick={() => handleUserClick(user)}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-lg font-semibold text-blue-600 underline">{user.name}</h3>
                                        <span className="text-sm font-medium text-gray-600 capitalize">{user.accessLevel}</span>
                                    </div>
                                    <div className="space-y-1 text-sm text-gray-700">
                                        <p><span className="font-medium">Email:</span> {user.email}</p>
                                        <p><span className="font-medium">Training:</span> {user.training || 'N/A'}</p>
                                        <p><span className="font-medium">Leave Balance:</span> {user.leaveBalance}</p>
                                        <p><span className="font-medium">Visa Status:</span> {user.visaStatus || 'N/A'}</p>
                                        <p><span className="font-medium">Employment Type:</span> {user.employmentType || 'N/A'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>

            {/* The AddUserModal component */}
            <AddUserModal
                isOpen={isAddUserModalOpen}
                onClose={() => setIsAddUserModalOpen(false)}
                onUserAdded={handleUserAdded}
                id="add-user-modal"
            />

            {/* Full-screen PeoplePersonalPage Modal */}
            {isPersonalPageModalOpen && selectedUserId && (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50 p-0 sm:p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full h-full sm:max-w-4xl sm:max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center bg-blue-600 text-white p-4 shrink-0">
                <h2 className="text-xl font-semibold">Personal Details</h2>
                <button
                    onClick={() => {
                        setIsPersonalPageModalOpen(false);
                        setSelectedUserId(null);
                    }}
                    className="text-white hover:text-gray-200 focus:outline-none"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                <PeoplePersonalPage targetUserId={selectedUserId} />
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2 shrink-0">
                {isAdmin && (
                    <button
                        onClick={handleDeleteUser}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                        disabled={loading}
                    >
                        Delete
                    </button>
                )}
                <button
                    onClick={() => {
                        setIsPersonalPageModalOpen(false);
                        setSelectedUserId(null);
                    }}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors text-sm font-medium"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
)}
{isDeleteModalOpen && (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm md:max-w-md p-6 md:p-8 transform transition-all duration-300 ease-out scale-95 opacity-0 animate-scale-in">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6 text-center">
                Confirm Deletion
            </h2>
            <p className="text-sm text-gray-700 mb-6 text-center">
                Are you sure you want to delete the user "{users.find(u => u._id === selectedUserId)?.name}"? This action cannot be undone.
            </p>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <div className="flex justify-end space-x-2">
                <button
                    onClick={() => {
                        setIsDeleteModalOpen(false);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200 text-base font-medium"
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    onClick={confirmDeleteUser}
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
