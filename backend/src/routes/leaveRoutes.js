// backend/src/routes/leaveRoutes.js

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Import mongoose to use mongoose.Types.ObjectId()
const LeaveApplication = require('../models/LeaveApplication');
const Notification = require('../models/Notification'); // Your Notification model
const User = require('../models/user'); // Your User model (for finding admin)
const asyncHandler = require('../middleware/asyncHandler');
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Assuming auth middleware
const ErrorResponse = require('../utils/errorResponse');

// Assuming APP_NAME and COMPANY_NAME are available via process.env or similar
const APP_NAME = process.env.APP_NAME || 'Your Application';
const COMPANY_NAME = process.env.COMPANY_NAME || 'Your Company Name';

// --- Admin User ID for Notifications (Dynamic Fetch or Configured Fallback) ---
// This variable will hold the ObjectId of an admin user to send notifications to.
// In a production environment, you might fetch multiple admin users or use a specific
// admin ID from environment variables for critical alerts.
let adminUserId = null;

// Helper function to find an admin user dynamically on server startup.
// This ensures notifications are sent to a valid admin user.
async function findAdminUser() {
  try {
    // Attempt to find a user with the 'admin' role. Adjust 'role' field as per your User model.
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      adminUserId = admin._id;
      console.log('Admin user found for notifications:', adminUserId);
    } else {
      // Fallback if no user with 'admin' role is found.
      // You could also use an environment variable here: process.env.DEFAULT_ADMIN_NOTIFICATION_ID
      console.warn('No admin user found with role "admin". Admin notifications will not be sent unless configured otherwise.');
    }
  } catch (error) {
    console.error('Error finding admin user for notifications:', error);
  }
}

// Execute this function once when the server starts to set up the adminUserId.
findAdminUser();


// --- Route: Submit New Leave Application ---
// This route is protected by the 'protect' middleware, ensuring only authenticated users can apply.
router.post('/', protect, asyncHandler(async (req, res, next) => {
    const { leaveReason, fromDate, toDate, leaveType, description } = req.body;
    const userId = req.user.id; // User applying for leave, populated by 'protect' middleware

    // Basic validation
    if (!leaveReason || !fromDate || !toDate || !leaveType) {
        return next(new ErrorResponse('Please provide all required leave details', 400));
    }

    if (new Date(fromDate) > new Date(toDate)) {
        return next(new ErrorResponse('From Date cannot be after To Date.', 400));
    }

    try {
        const newLeaveApplication = new LeaveApplication({
            user: userId, // Link to the dynamically obtained user ID
            leaveReason,
            fromDate,
            toDate,
            leaveType,
            description,
            status: 'Pending' // Default status
        });

        const savedLeave = await newLeaveApplication.save();

        // --- Notification for Admin (or relevant recipient) ---
        const adminUsers = await User.find({ role: 'admin' }); // Find all users with 'admin' role

        if (adminUsers.length > 0) {
            const notificationMessage = `New leave application from ${req.user.firstName} ${req.user.lastName} (${req.user.emailId}) for ${leaveReason} from ${new Date(fromDate).toLocaleDateString()} to ${new Date(toDate).toLocaleDateString()}.`;

            const notificationPromises = adminUsers.map(async (adminUser) => {
                const newNotification = new Notification({
                    recipient: adminUser._id, // CORRECTED: Use 'recipient' field
                    message: notificationMessage,
                    type: 'leave_application',
                    relatedDocument: savedLeave._id,
                    relatedModel: 'LeaveApplication',
                    schedule: undefined, // Set to undefined as it's not relevant for leave applications (requires Notification model to have required:false for schedule)
                    isRead: false,
                });
                return newNotification.save();
            });

            await Promise.allSettled(notificationPromises);
            console.log('Notifications sent to admin(s) for new leave application.');
        } else {
            console.warn('No admin users found to send leave application notification to.');
        }

        res.status(201).json({
            success: true,
            message: 'Leave application submitted successfully. Awaiting approval.',
            data: savedLeave
        });

    } catch (error) {
        console.error('Error submitting leave application:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return next(new ErrorResponse(messages.join(', '), 400));
        }
        next(new ErrorResponse('Server error submitting leave application.', 500));
    }
}));

// --- Route: Fetch User's Leave Applications (for current authenticated user) ---
// Fetches all leave applications for the currently authenticated user.
router.get('/my-applications', protect, asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user.id; // Dynamically get user ID from authentication
    console.log('Backend /my-applications: Authenticated User ID from Token:', userId); // DEBUG LOG

    if (!userId) {
        console.error('Backend /my-applications: User ID is missing from token. Cannot fetch user-specific leaves.');
        return next(new ErrorResponse('Authentication error: User ID not found.', 401));
    }

    // Dynamically find and sort applications by the most recent.
    const applications = await LeaveApplication.find({ user: userId }).sort({ appliedAt: -1 });
    console.log('Backend /my-applications: Found applications for user:', applications.length, 'leaves.'); // DEBUG LOG

    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    console.error('Error fetching user leave applications:', error);
    next(new ErrorResponse('Failed to fetch your leave applications.', 500));
  }
}));

// --- NEW ROUTE: Fetch Leave Applications for a Specific User (by Admin/Manager) ---
// This route is intended for administrators or managers to view another user's leave.
router.get('/user/:userId', protect, authorizeRoles('admin', 'manager'), asyncHandler(async (req, res, next) => {
    const { userId } = req.params; // Get the user ID from the URL parameter

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(new ErrorResponse('Invalid user ID format.', 400));
    }

    try {
        const applications = await LeaveApplication.find({ user: userId })
            .populate('user', 'firstName lastName emailId') // Populate user details if needed
            .sort({ appliedAt: -1 });

        if (!applications) { // Check if any applications were found for the user
            return next(new ErrorResponse('No leave applications found for this user.', 404));
        }

        res.status(200).json({ success: true, data: applications });
    } catch (error) {
        console.error(`Error fetching leave applications for user ${userId}:`, error);
        next(new ErrorResponse('Server error fetching user leaves.', 500));
    }
}));


// --- Route: Fetch All Leave Applications (Admin/Manager View) ---
// This route is intended for administrators or managers.
router.get('/all', protect, authorizeRoles('admin', 'manager'), asyncHandler(async (req, res, next) => {
    const leaveApplications = await LeaveApplication.find()
        .populate('user', 'firstName lastName emailId') // Populate user details
        .sort({ appliedAt: -1 }); // Sort by most recent

    res.status(200).json({ success: true, data: leaveApplications });
}));

// --- Route: Update Leave Application Status (Admin/Manager Action) ---
// Allows an admin/manager to change the status of a leave application.
router.put('/:id/status', protect, authorizeRoles('admin', 'manager'), asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Approved', 'Rejected', 'Cancelled'].includes(status)) {
        return next(new ErrorResponse('Invalid status provided.', 400));
    }

    const leaveApplication = await LeaveApplication.findById(id);

    if (!leaveApplication) {
        return next(new ErrorResponse('Leave application not found.', 404));
    }

    leaveApplication.status = status;
    const updatedLeave = await leaveApplication.save();

    // --- Notification for User about Status Update ---
    const user = await User.findById(leaveApplication.user); // Get the user who applied for leave
    if (user) {
        const notificationMessage = `Your leave application (${updatedLeave.leaveReason} from ${new Date(updatedLeave.fromDate).toLocaleDateString()} to ${new Date(updatedLeave.toDate).toLocaleDateString()}) has been ${status.toLowerCase()}.`;
        const newNotification = new Notification({
            recipient: user._id, // Send notification to the user who applied
            message: notificationMessage,
            type: 'leave_status_update',
            relatedDocument: updatedLeave._id,
            relatedModel: 'LeaveApplication',
            schedule: undefined, // Not relevant here (requires Notification model to have required:false for schedule)
            isRead: false,
        });
        await newNotification.save();
        console.log(`Notification sent to user ${user.emailId} about leave status update.`);
    }

    res.status(200).json({ success: true, message: 'Leave application status updated successfully.', data: updatedLeave });
}));

module.exports = router;
