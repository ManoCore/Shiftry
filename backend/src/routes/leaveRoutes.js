const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const LeaveApplication = require('../models/LeaveApplication'); // Ensure correct model path
const User = require('../models/user'); // Ensure User model is imported
// const { protect, authorizeRoles } = require('../middleware/auth'); // Auth middleware
const asyncHandler = require('../middleware/asyncHandler'); // Your custom async error handler
const ErrorResponse = require('../utils/errorResponse'); // Your custom error response class
const nodemailer = require('nodemailer'); // For sending emails
const { format, parseISO } = require('date-fns'); // For date formatting
const auth = require('../middleware/auth');

router.get('/', auth.protect, auth.authorizeRoles('admin', 'manager'), asyncHandler(async (req, res, next) => {
    const organizationId = req.organizationId;
    if (!organizationId) {
        return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
    }

    const leaveApplications = await LeaveApplication.find({ organization: organizationId })
        .populate('user', 'firstName lastName emailId') // Populate user details
        .sort({ startDate: -1 }); // Sort by most recent leave application first

    res.status(200).json({
        success: true,
        count: leaveApplications.length,
        data: leaveApplications
    });
}));

/**
 * @desc    Get a single leave application by ID for the authenticated user's organization
 * @route   GET /api/v1/leave/:id
 * @access  Private (Admin/Manager)
 */
router.get('/my-applications',auth.protect,asyncHandler(async (req, res, next) => {
    try {
        const userId = req.user._id; // Get user ID from authentication (assuming _id is the property)
        const organizationId = req.organizationId; // Get organization ID from authentication/middleware

        console.log('Backend /my-applications: Authenticated User ID from Token:', userId); // DEBUG LOG
        console.log('Backend /my-applications: Authenticated Organization ID:', organizationId); // DEBUG LOG

        if (!userId) {
            console.error('Backend /my-applications: User ID is missing from token. Cannot fetch user-specific leaves.');
            return next(new ErrorResponse('Authentication error: User ID not found.', 401));
        }

        if (!organizationId) {
            console.error('Backend /my-applications: Organization ID is missing. Cannot fetch organization-specific leaves.');
            return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
        }

        // Dynamically find applications for the specific user AND within their organization.
        // Sort applications by the most recent.
        const applications = await LeaveApplication.find({
            user: userId,
            organization: organizationId // Add this line to filter by organization
        }).sort({ appliedAt: -1 }); // Assuming you have an 'appliedAt' field for sorting

        console.log('Backend /my-applications: Found applications for user:', applications.length, 'leaves within organization', organizationId); // DEBUG LOG

        res.status(200).json({ success: true, data: applications });
    } catch (error) {
        console.error('Error fetching user leave applications:', error);
        next(new ErrorResponse('Failed to fetch your leave applications.', 500));
    }
}));
router.get('/:id', auth.protect,asyncHandler(async (req, res, next) => {
    const organizationId = req.organizationId;
    const leaveId = req.params.id;

    if (!organizationId) {
        return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
    }

    const leaveApplication = await LeaveApplication.findOne({ _id: leaveId, organization: organizationId })
        .populate('user', 'firstName lastName emailId');

    if (!leaveApplication) {
        return next(new ErrorResponse('Leave application not found in your organization.', 404));
    }

    res.status(200).json({
        success: true,
        data: leaveApplication
    });
}));


/**
 * @desc    Get all leave applications for a specific user within the authenticated user's organization
 * @route   GET /api/v1/leave/user/:userId
 * @access  Private (Admin/Manager, or the user themselves)
 */
router.get('/user/:userId', auth.protect, asyncHandler(async (req, res, next) => {
    const organizationId = req.organizationId;
    const targetUserId = req.params.userId;
    const requestingUser = req.user; // User object from 'protect' middleware

    if (!organizationId) {
        return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
    }

    // Authorization check:
    // 1. If the requesting user is an admin or manager, they can view any user's leaves in their organization.
    // 2. If the requesting user is a regular user, they can only view their own leaves.
    const isAuthorized = requestingUser.role === 'admin' ||
                         requestingUser.role === 'manager' ||
                         requestingUser._id.toString() === targetUserId;

    if (!isAuthorized) {
        return next(new ErrorResponse('Not authorized to view this user\'s leave applications.', 403));
    }

    // CRITICAL: Ensure the target user also belongs to the same organization
    const targetUserExistsInOrg = await User.findOne({ _id: targetUserId, organization: organizationId });
    if (!targetUserExistsInOrg) {
        return next(new ErrorResponse('User not found in your organization.', 404));
    }

    const leaveApplications = await LeaveApplication.find({ user: targetUserId, organization: organizationId })
        .populate('user', 'firstName lastName emailId')
        .sort({ startDate: -1 });

    res.status(200).json({
        success: true,
        count: leaveApplications.length,
        data: leaveApplications
    });
}));


/**
 * @desc    Create a new leave application
 * @route   POST /api/v1/leave
 * @access  Private
 */
// backend/src/routes/leaveRoutes.js

router.post('/', auth.protect, asyncHandler(async (req, res, next) => {
    const organizationId = req.organizationId; // This is correctly obtained from auth.protect
    const userId = req.user._id; // The user applying for leave, populated by 'protect' middleware

    // IMPORTANT: Keep these logs to confirm IDs are present
    console.log('POST /api/v1/leave: Request received.');
    console.log('POST /api/v1/leave: User ID from token:', userId);
    console.log('POST /api/v1/leave: Organization ID from token:', organizationId);

    if (!organizationId) {
        return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
    }
    // Also, ensure userId is available if it's strictly required by the LeaveApplication model
    if (!userId) {
        return next(new ErrorResponse('Authentication error: User ID not found.', 401));
    }

    const { leaveReason, fromDate, toDate, leaveType, description } = req.body;

    // Basic validation (Frontend should also handle this for better UX)
    if (!leaveReason || !fromDate || !toDate || !leaveType) {
        return next(new ErrorResponse('Please provide all required leave details', 400));
    }

    // Date validation
    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) { // Use .getTime() for robust date validity check
        return next(new ErrorResponse('Invalid date format. Dates must be valid.', 400));
    }

    if (end < start) {
        return next(new ErrorResponse('From Date cannot be after To Date.', 400));
    }

    try {
        const newLeaveApplication = new LeaveApplication({
            user: userId,
            organization: organizationId, // <--- RE-ADDED THIS CRITICAL FIELD
            leaveReason,
            fromDate,
            toDate,
            leaveType,
            description,
            status: 'Pending' // <--- CORRECTED CASING: 'Pending' matches schema enum
        });

        // Add this log to see the object right before saving
        console.log('POST /api/v1/leave: Attempting to save newLeaveApplication:', newLeaveApplication);

        const savedLeave = await newLeaveApplication.save();

        // Add this log to confirm successful save
        console.log('POST /api/v1/leave: New leave application saved successfully:', savedLeave);

        // Notifications (if needed in the future, currently removed)

        res.status(201).json({
            success: true,
            message: 'Leave application submitted successfully. Awaiting approval.',
            data: savedLeave // Send back the saved object, including its _id
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

/**
 * @desc    Update a leave application (e.g., change status by admin/manager)
 * @route   PUT /api/v1/leave/:id
 * @access  Private (Admin/Manager)
 */
router.put('/:id', auth.protect, auth.authorizeRoles('admin', 'manager'), asyncHandler(async (req, res, next) => {
    const organizationId = req.organizationId;
    const leaveId = req.params.id;
    const { status, remarks } = req.body; // Allow updating status and adding remarks

    if (!organizationId) {
        return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
    }

    const leaveApplication = await LeaveApplication.findOne({ _id: leaveId, organization: organizationId });

    if (!leaveApplication) {
        return next(new ErrorResponse('Leave application not found in your organization.', 404));
    }

    // Only allow specific fields to be updated by this route for security
    if (status !== undefined) {
        // This validation should now align with your Mongoose schema's enum
        // which we've set to lowercase: ['pending', 'approved', 'rejected', 'cancelled']
        if (!['pending', 'approved', 'rejected', 'cancelled'].includes(status)) {
            return next(new ErrorResponse('Invalid status provided.', 400));
        }
        leaveApplication.status = status;
    }
    if (remarks !== undefined) {
        leaveApplication.remarks = remarks;
    }
    leaveApplication.reviewedBy = req.user._id; // Record who reviewed it
    leaveApplication.reviewedAt = Date.now(); // Record when it was reviewed

    await leaveApplication.save();

    // --- START OF REMOVED EMAIL NOTIFICATION LOGIC ---
    // The previous code block for sending email notification has been removed.
    // --- END OF REMOVED EMAIL NOTIFICATION LOGIC ---

    res.status(200).json({
        success: true,
        message: 'Leave application updated successfully.',
        data: leaveApplication
    });
}));

/**
 * @desc    Delete a leave application
 * @route   DELETE /api/v1/leave/:id
 * @access  Private (Admin)
 */
router.delete('/:id', auth.protect, auth.authorizeRoles('admin'), asyncHandler(async (req, res, next) => {
    const organizationId = req.organizationId;
    const leaveId = req.params.id;

    if (!organizationId) {
        return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
    }

    const leaveApplication = await LeaveApplication.findOneAndDelete({ _id: leaveId, organization: organizationId });

    if (!leaveApplication) {
        return next(new ErrorResponse('Leave application not found in your organization.', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Leave application deleted successfully.'
    });
}));

module.exports = router;

