// // backend/src/routes/leaveRoutes.js

// const express = require('express');
// const router = express.Router();
// const mongoose = require('mongoose'); // Import mongoose to use mongoose.Types.ObjectId()
// const LeaveApplication = require('../models/LeaveApplication');
// const Notification = require('../models/Notification'); // Your Notification model
// const User = require('../models/user'); // Your User model (for finding admin)
// const asyncHandler = require('../middleware/asyncHandler');
// const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Assuming auth middleware
// const ErrorResponse = require('../utils/errorResponse');

// // Assuming APP_NAME and COMPANY_NAME are available via process.env or similar
// const APP_NAME = process.env.APP_NAME || 'Your Application';
// const COMPANY_NAME = process.env.COMPANY_NAME || 'Your Company Name';

// // --- Admin User ID for Notifications (Dynamic Fetch or Configured Fallback) ---
// // This variable will hold the ObjectId of an admin user to send notifications to.
// // In a production environment, you might fetch multiple admin users or use a specific
// // admin ID from environment variables for critical alerts.
// let adminUserId = null;

// // Helper function to find an admin user dynamically on server startup.
// // This ensures notifications are sent to a valid admin user.
// async function findAdminUser() {
//   try {
//     // Attempt to find a user with the 'admin' role. Adjust 'role' field as per your User model.
//     const admin = await User.findOne({ role: 'admin' });
//     if (admin) {
//       adminUserId = admin._id;
//       console.log('Admin user found for notifications:', adminUserId);
//     } else {
//       // Fallback if no user with 'admin' role is found.
//       // You could also use an environment variable here: process.env.DEFAULT_ADMIN_NOTIFICATION_ID
//       console.warn('No admin user found with role "admin". Admin notifications will not be sent unless configured otherwise.');
//     }
//   } catch (error) {
//     console.error('Error finding admin user for notifications:', error);
//   }
// }

// // Execute this function once when the server starts to set up the adminUserId.
// findAdminUser();


// // --- Route: Submit New Leave Application ---
// // This route is protected by the 'protect' middleware, ensuring only authenticated users can apply.
// router.post('/', protect, asyncHandler(async (req, res, next) => {
//     const { leaveReason, fromDate, toDate, leaveType, description } = req.body;
//     const userId = req.user.id; // User applying for leave, populated by 'protect' middleware

//     // Basic validation
//     if (!leaveReason || !fromDate || !toDate || !leaveType) {
//         return next(new ErrorResponse('Please provide all required leave details', 400));
//     }

//     if (new Date(fromDate) > new Date(toDate)) {
//         return next(new ErrorResponse('From Date cannot be after To Date.', 400));
//     }

//     try {
//         const newLeaveApplication = new LeaveApplication({
//             user: userId, // Link to the dynamically obtained user ID
//             leaveReason,
//             fromDate,
//             toDate,
//             leaveType,
//             description,
//             status: 'Pending' // Default status
//         });

//         const savedLeave = await newLeaveApplication.save();

//         // --- Notification for Admin (or relevant recipient) ---
//         const adminUsers = await User.find({ role: 'admin' }); // Find all users with 'admin' role

//         if (adminUsers.length > 0) {
//             const notificationMessage = `New leave application from ${req.user.firstName} ${req.user.lastName} (${req.user.emailId}) for ${leaveReason} from ${new Date(fromDate).toLocaleDateString()} to ${new Date(toDate).toLocaleDateString()}.`;

//             const notificationPromises = adminUsers.map(async (adminUser) => {
//                 const newNotification = new Notification({
//                     recipient: adminUser._id, // CORRECTED: Use 'recipient' field
//                     message: notificationMessage,
//                     type: 'leave_application',
//                     relatedDocument: savedLeave._id,
//                     relatedModel: 'LeaveApplication',
//                     schedule: undefined, // Set to undefined as it's not relevant for leave applications (requires Notification model to have required:false for schedule)
//                     isRead: false,
//                 });
//                 return newNotification.save();
//             });

//             await Promise.allSettled(notificationPromises);
//             console.log('Notifications sent to admin(s) for new leave application.');
//         } else {
//             console.warn('No admin users found to send leave application notification to.');
//         }

//         res.status(201).json({
//             success: true,
//             message: 'Leave application submitted successfully. Awaiting approval.',
//             data: savedLeave
//         });

//     } catch (error) {
//         console.error('Error submitting leave application:', error);
//         if (error.name === 'ValidationError') {
//             const messages = Object.values(error.errors).map(val => val.message);
//             return next(new ErrorResponse(messages.join(', '), 400));
//         }
//         next(new ErrorResponse('Server error submitting leave application.', 500));
//     }
// }));

// // --- Route: Fetch User's Leave Applications (for current authenticated user) ---
// // Fetches all leave applications for the currently authenticated user.
// router.get('/my-applications', protect, asyncHandler(async (req, res, next) => {
//   try {
//     const userId = req.user.id; // Dynamically get user ID from authentication
//     console.log('Backend /my-applications: Authenticated User ID from Token:', userId); // DEBUG LOG

//     if (!userId) {
//         console.error('Backend /my-applications: User ID is missing from token. Cannot fetch user-specific leaves.');
//         return next(new ErrorResponse('Authentication error: User ID not found.', 401));
//     }

//     // Dynamically find and sort applications by the most recent.
//     const applications = await LeaveApplication.find({ user: userId }).sort({ appliedAt: -1 });
//     console.log('Backend /my-applications: Found applications for user:', applications.length, 'leaves.'); // DEBUG LOG

//     res.status(200).json({ success: true, data: applications });
//   } catch (error) {
//     console.error('Error fetching user leave applications:', error);
//     next(new ErrorResponse('Failed to fetch your leave applications.', 500));
//   }
// }));

// // --- NEW ROUTE: Fetch Leave Applications for a Specific User (by Admin/Manager) ---
// // This route is intended for administrators or managers to view another user's leave.
// router.get('/user/:userId', protect, authorizeRoles('admin', 'manager'), asyncHandler(async (req, res, next) => {
//     const { userId } = req.params; // Get the user ID from the URL parameter

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//         return next(new ErrorResponse('Invalid user ID format.', 400));
//     }

//     try {
//         const applications = await LeaveApplication.find({ user: userId })
//             .populate('user', 'firstName lastName emailId') // Populate user details if needed
//             .sort({ appliedAt: -1 });

//         if (!applications) { // Check if any applications were found for the user
//             return next(new ErrorResponse('No leave applications found for this user.', 404));
//         }

//         res.status(200).json({ success: true, data: applications });
//     } catch (error) {
//         console.error(`Error fetching leave applications for user ${userId}:`, error);
//         next(new ErrorResponse('Server error fetching user leaves.', 500));
//     }
// }));


// // --- Route: Fetch All Leave Applications (Admin/Manager View) ---
// // This route is intended for administrators or managers.
// router.get('/all', protect, authorizeRoles('admin', 'manager'), asyncHandler(async (req, res, next) => {
//     const leaveApplications = await LeaveApplication.find()
//         .populate('user', 'firstName lastName emailId') // Populate user details
//         .sort({ appliedAt: -1 }); // Sort by most recent

//     res.status(200).json({ success: true, data: leaveApplications });
// }));

// // --- Route: Update Leave Application Status (Admin/Manager Action) ---
// // Allows an admin/manager to change the status of a leave application.
// router.put('/:id/status', protect, authorizeRoles('admin', 'manager'), asyncHandler(async (req, res, next) => {
//     const { id } = req.params;
//     const { status } = req.body;

//     if (!['Pending', 'Approved', 'Rejected', 'Cancelled'].includes(status)) {
//         return next(new ErrorResponse('Invalid status provided.', 400));
//     }

//     const leaveApplication = await LeaveApplication.findById(id);

//     if (!leaveApplication) {
//         return next(new ErrorResponse('Leave application not found.', 404));
//     }

//     leaveApplication.status = status;
//     const updatedLeave = await leaveApplication.save();

//     // --- Notification for User about Status Update ---
//     const user = await User.findById(leaveApplication.user); // Get the user who applied for leave
//     if (user) {
//         const notificationMessage = `Your leave application (${updatedLeave.leaveReason} from ${new Date(updatedLeave.fromDate).toLocaleDateString()} to ${new Date(updatedLeave.toDate).toLocaleDateString()}) has been ${status.toLowerCase()}.`;
//         const newNotification = new Notification({
//             recipient: user._id, // Send notification to the user who applied
//             message: notificationMessage,
//             type: 'leave_status_update',
//             relatedDocument: updatedLeave._id,
//             relatedModel: 'LeaveApplication',
//             schedule: undefined, // Not relevant here (requires Notification model to have required:false for schedule)
//             isRead: false,
//         });
//         await newNotification.save();
//         console.log(`Notification sent to user ${user.emailId} about leave status update.`);
//     }

//     res.status(200).json({ success: true, message: 'Leave application status updated successfully.', data: updatedLeave });
// }));

// module.exports = router;


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
// router.post('/', auth.protect, asyncHandler(async (req, res, next) => {
//     const organizationId = req.organizationId;
//     const userId = req.user._id; // The user applying for leave
//     console.log('POST /api/v1/leave: Request received.'); // New DEBUG log
//     console.log('POST /api/v1/leave: User ID from token:', userId); // New DEBUG log
//     console.log('POST /api/v1/leave: Organization ID from token:', organizationId); // New DEBUG log


//     if (!organizationId) {
//         return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
//     }

//      const { fromDate, toDate, leaveType, leaveReason, description, status = 'pending' } = req.body;

//     // Basic validation
//     if (!fromDate || !toDate || !leaveType || !leaveReason) {
//         return next(new ErrorResponse('Please provide start date, end date, leave type, and reason.', 400));
//     }

//     const start = parseISO(fromDate);
//     const end = parseISO(toDate);
//      if (isNaN(start) || isNaN(end)) {
//         return next(new ErrorResponse('Invalid date format. Dates must be in YYYY-MM-DD format.', 400));
//     }

//     if (end < start) {
//         return next(new ErrorResponse('End date cannot be before start date.', 400));
//     }

//      const newLeaveApplication = new LeaveApplication({
//         user: userId,
//         organization: organizationId,
//         startDate: fromDate,   // Map fromDate from frontend to startDate in schema
//         endDate: toDate,       // Map toDate from frontend to endDate in schema
//         leaveType,             // This name is consistent
//         reason: leaveReason,   // Map leaveReason from frontend to reason in schema
//         description,           // Include description if you want to save it
//         status
//     });

//     // Notify admins/managers about new leave application
//     const adminsAndManagers = await User.find({
//         organization: organizationId,
//         role: { $in: ['admin', 'manager'] }
//     });

//     const mailPromises = adminsAndManagers.map(async (admin) => {
//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: admin.emailId,
//             subject: `New Leave Application from ${req.user.firstName} ${req.user.lastName}`,
//             html: `
//                 <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
//                     <div style="text-align: center; margin-bottom: 20px;">
//                         <img src="${LOGO_URL}" alt="${APP_NAME} Logo" style="max-width: 100px;">
//                     </div>
//                     <h2 style="color: #333; text-align: center;">New Leave Application</h2>
//                     <p style="color: #555;">Dear ${admin.firstName},</p>
//                     <p style="color: #555;">A new leave application has been submitted by ${req.user.firstName} ${req.user.lastName} (${req.user.emailId}):</p>
//                     <ul>
//                         <li><strong>Leave Type:</strong> ${leaveType}</li>
//                         <li><strong>Dates:</strong> ${format(start, 'PPP')} to ${format(end, 'PPP')}</li>
//                         <li><strong>Reason:</strong> ${reason}</li>
//                         <li><strong>Status:</strong> ${status}</li>
//                     </ul>
//                     <p style="color: #555;">Please log in to ${APP_NAME} to review and approve/reject this application.</p>
//                     <p style="color: #888; font-size: 0.8em; text-align: center; margin-top: 30px;">Thank you!</p>
//                 </div>
//             `
//         };
//         return transporter.sendMail(mailOptions);
//     });

//     Promise.allSettled(mailPromises)
//         .then(results => {
//             results.forEach((result, index) => {
//                 if (result.status === 'rejected') {
//                     console.error(`Failed to send email to admin/manager ${adminsAndManagers[index].emailId}:`, result.reason);
//                 }
//             });
//         });

//     res.status(201).json({
//         success: true,
//         message: 'Leave application submitted successfully.',
//         data: newLeaveApplication
//     });
// }));

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

    // Notify the user about the status change
    const applicant = await User.findById(leaveApplication.user);
    if (applicant) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: applicant.emailId,
            subject: `Your Leave Application Status Updated (${leaveApplication.status})`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="${LOGO_URL}" alt="${APP_NAME} Logo" style="max-width: 100px;">
                    </div>
                    <h2 style="color: #333; text-align: center;">Leave Application Status Update</h2>
                    <p style="color: #555;">Dear ${applicant.firstName},</p>
                    <p style="color: #555;">Your leave application for ${format(parseISO(leaveApplication.startDate), 'PPP')} to ${format(parseISO(leaveApplication.endDate), 'PPP')} has been <strong>${leaveApplication.status}</strong>.</p>
                    ${remarks ? `<p style="color: #555;"><strong>Remarks:</strong> ${remarks}</p>` : ''}
                    <p style="color: #555;">Please log in to ${APP_NAME} for more details.</p>
                    <p style="color: #888; font-size: 0.8em; text-align: center; margin-top: 30px;">Thank you!</p>
                </div>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(`Error sending leave status update email to ${applicant.emailId}:`, error);
            } else {
                console.log(`Leave status update email sent to ${applicant.emailId}:`, info.response);
            }
        });
    }

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


