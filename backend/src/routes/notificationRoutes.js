
// const express = require('express');
// const router = express.Router();
// const Notification = require('../models/Notification');
// const auth = require('../middleware/auth'); // Assuming auth.js exports protect and authorizeRoles
// const { check, validationResult } = require('express-validator');
// const User = require('../models/user'); // Corrected casing for User model import
// const asyncHandler = require('../middleware/asyncHandler'); // Import asyncHandler
// const ErrorResponse = require('../utils/errorResponse'); // Import ErrorResponse

// /**
//  * @route   GET /api/notifications
//  * @desc    Get all notifications for current user within their organization
//  * @access  Private
//  */
// router.get('/', auth.protect, asyncHandler(async (req, res, next) => {
//     const organizationId = req.organizationId;
//     if (!organizationId) {
//         return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
//     }

//     try {
//         // Get notifications for current user, scoped to their organization, sorted by most recent
//         const notifications = await Notification.find({
//             recipient: req.user.id,
//             organization: organizationId // CRITICAL: Filter by organization
//         })
//             .sort({ createdAt: -1 })
//             .limit(50); // Limit to 50 most recent notifications

//         res.json(notifications);
//     } catch (err) {
//         console.error(err.message);
//         return next(new ErrorResponse('Server Error fetching notifications.', 500));
//     }
// }));

// /**
//  * @route   GET /api/notifications/unread
//  * @desc    Get unread notifications count for current user within their organization
//  * @access  Private
//  */
// router.get('/unread', auth.protect, asyncHandler(async (req, res, next) => {
//     const organizationId = req.organizationId;
//     if (!organizationId) {
//         return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
//     }

//     try {
//         const count = await Notification.countDocuments({
//             recipient: req.user.id,
//             isRead: false,
//             organization: organizationId // CRITICAL: Filter by organization
//         });
//         res.json({ count });
//     } catch (err) {
//         console.error(err.message);
//         return next(new ErrorResponse('Server Error fetching unread notification count.', 500));
//     }
// }));

// /**
//  * @route   POST /api/notifications
//  * @desc    Create a new notification (typically called by other routes)
//  * @access  Private (usually called internally)
//  */
// router.post('/',
//     auth.protect, // Ensure user is authenticated to get req.user.id and req.organizationId
//     [
//         check('message', 'Message is required').not().isEmpty()
//     ],
//     asyncHandler(async (req, res, next) => {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return next(new ErrorResponse('Validation Error', 400, errors.array()));
//         }

//         const organizationId = req.organizationId;
//         if (!organizationId) {
//             return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
//         }

//         try {
//             const { message, type, relatedDocument, relatedModel, schedule } = req.body;

//             const newNotification = new Notification({
//                 recipient: req.user.id,
//                 message,
//                 type: type || 'system',
//                 relatedDocument,
//                 relatedModel,
//                 schedule,
//                 isRead: false,
//                 organization: organizationId // CRITICAL: Assign to the user's organization
//             });

//             const notification = await newNotification.save();
//             res.status(201).json(notification);
//         } catch (err) {
//             console.error(err.message);
//             return next(new ErrorResponse('Server Error creating notification.', 500));
//         }
//     })
// );

// /**
//  * @route   PUT /api/notifications/:id/read
//  * @desc    Mark a notification as read for current user within their organization
//  * @access  Private
//  */
// router.put('/:id/read', auth.protect, asyncHandler(async (req, res, next) => {
//     const organizationId = req.organizationId;
//     if (!organizationId) {
//         return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
//     }

//     try {
//         const notification = await Notification.findOne({
//             _id: req.params.id,
//             recipient: req.user.id,
//             organization: organizationId // CRITICAL: Filter by organization
//         });

//         if (!notification) {
//             return next(new ErrorResponse('Notification not found or does not belong to your organization.', 404));
//         }

//         notification.isRead = true;
//         await notification.save();

//         res.json(notification);
//     } catch (err) {
//         console.error(err.message);
//         if (err.kind === 'ObjectId') {
//             return next(new ErrorResponse('Invalid Notification ID format.', 400));
//         }
//         return next(new ErrorResponse('Server Error marking notification as read.', 500));
//     }
// }));

// /**
//  * @route   PUT /api/notifications/read-all
//  * @desc    Mark all notifications as read for current user within their organization
//  * @access  Private
//  */
// router.put('/read-all', auth.protect, asyncHandler(async (req, res, next) => {
//     const organizationId = req.organizationId;
//     if (!organizationId) {
//         return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
//     }

//     try {
//         await Notification.updateMany(
//             { recipient: req.user.id, isRead: false, organization: organizationId }, // CRITICAL: Filter by organization
//             { $set: { isRead: true } }
//         );

//         res.json({ msg: 'All notifications marked as read' });
//     } catch (err) {
//         console.error(err.message);
//         return next(new ErrorResponse('Server Error marking all notifications as read.', 500));
//     }
// }));

// /**
//  * @route   DELETE /api/notifications/:id
//  * @desc    Delete a notification for current user within their organization
//  * @access  Private
//  */
// router.delete('/:id', auth.protect, asyncHandler(async (req, res, next) => {
//     const organizationId = req.organizationId;
//     if (!organizationId) {
//         return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
//     }

//     try {
//         const notification = await Notification.findOneAndDelete({
//             _id: req.params.id,
//             recipient: req.user.id,
//             organization: organizationId // CRITICAL: Filter by organization
//         });

//         if (!notification) {
//             return next(new ErrorResponse('Notification not found or does not belong to your organization.', 404));
//         }

//         res.json({ msg: 'Notification removed' });
//     } catch (err) {
//         console.error(err.message);
//         if (err.kind === 'ObjectId') {
//             return next(new ErrorResponse('Invalid Notification ID format.', 400));
//         }
//         return next(new ErrorResponse('Server Error deleting notification.', 500));
//     }
// }));

// /**
//  * @route   DELETE /api/notifications
//  * @desc    Clear all notifications for current user within their organization
//  * @access  Private
//  */
// router.delete('/', auth.protect, asyncHandler(async (req, res, next) => {
//     const organizationId = req.organizationId;
//     if (!organizationId) {
//         return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
//     }

//     try {
//         await Notification.deleteMany({
//             recipient: req.user.id,
//             organization: organizationId // CRITICAL: Filter by organization
//         });
//         res.json({ msg: 'All notifications cleared' });
//     } catch (err) {
//         console.error(err.message);
//         return next(new ErrorResponse('Server Error clearing all notifications.', 500));
//     }
// }));

// module.exports = router;


// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth'); // Assuming auth.js exports protect and authorizeRoles
const { check, validationResult } = require('express-validator');
const User = require('../models/user'); // Corrected casing for User model import
const asyncHandler = require('../middleware/asyncHandler'); // Import asyncHandler
const ErrorResponse = require('../utils/errorResponse'); // Import ErrorResponse

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for current user within their organization
 * @access  Private
 */
router.get('/', auth.protect, asyncHandler(async (req, res, next) => {
    const organizationId = req.organizationId;
    if (!organizationId) {
        return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
    }

    try {
        // Get notifications for current user, scoped to their organization, sorted by most recent
        const notifications = await Notification.find({
            recipient: req.user.id,
            organization: organizationId // CRITICAL: Filter by organization
        })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to 50 most recent notifications

        res.json(notifications);
    } catch (err) {
        console.error(err.message);
        return next(new ErrorResponse('Server Error fetching notifications.', 500));
    }
}));

/**
 * @route   GET /api/notifications/unread
 * @desc    Get unread notifications count for current user within their organization
 * @access  Private
 */
router.get('/unread', auth.protect, asyncHandler(async (req, res, next) => {
    const organizationId = req.organizationId;
    if (!organizationId) {
        return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
    }

    try {
        const count = await Notification.countDocuments({
            recipient: req.user.id,
            isRead: false,
            organization: organizationId // CRITICAL: Filter by organization
        });
        res.json({ count });
    } catch (err) {
        console.error(err.message);
        return next(new ErrorResponse('Server Error fetching unread notification count.', 500));
    }
}));

/**
 * @route   POST /api/notifications
 * @desc    Create a new notification (typically called by other routes)
 * @access  Private (usually called internally)
 */
router.post('/',
    auth.protect, // Ensure user is authenticated to get req.user.id and req.organizationId
    [
        check('message', 'Message is required').not().isEmpty()
    ],
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ErrorResponse('Validation Error', 400, errors.array()));
        }

        const organizationId = req.organizationId;
        if (!organizationId) {
            return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
        }

        try {
            const { message, type, relatedDocument, relatedModel, schedule } = req.body;

            const newNotification = new Notification({
                recipient: req.user.id,
                message,
                type: type || 'system',
                relatedDocument,
                relatedModel,
                schedule,
                isRead: false,
                organization: organizationId // CRITICAL: Assign to the user's organization
            });

            const notification = await newNotification.save();
            res.status(201).json(notification);
        } catch (err) {
            console.error(err.message);
            return next(new ErrorResponse('Server Error creating notification.', 500));
        }
    })
);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark a notification as read for current user within their organization
 * @access  Private
 */
router.put('/:id/read', auth.protect, asyncHandler(async (req, res, next) => {
    const organizationId = req.organizationId;
    if (!organizationId) {
        return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
    }

    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            recipient: req.user.id,
            organization: organizationId // CRITICAL: Filter by organization
        });

        if (!notification) {
            return next(new ErrorResponse('Notification not found or does not belong to your organization.', 404));
        }

        notification.isRead = true;
        await notification.save();

        res.json(notification);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return next(new ErrorResponse('Invalid Notification ID format.', 400));
        }
        return next(new ErrorResponse('Server Error marking notification as read.', 500));
    }
}));

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read for current user within their organization
 * @access  Private
 */
router.put('/read-all', auth.protect, asyncHandler(async (req, res, next) => {
    const organizationId = req.organizationId;
    if (!organizationId) {
        return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
    }

    try {
        await Notification.updateMany(
            { recipient: req.user.id, isRead: false, organization: organizationId }, // CRITICAL: Filter by organization
            { $set: { isRead: true } }
        );

        res.json({ msg: 'All notifications marked as read' });
    } catch (err) {
        console.error(err.message);
        return next(new ErrorResponse('Server Error marking all notifications as read.', 500));
    }
}));

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification for current user within their organization
 * @access  Private
 */
router.delete('/:id', auth.protect, asyncHandler(async (req, res, next) => {
    const organizationId = req.organizationId;
    if (!organizationId) {
        return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
    }

    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            recipient: req.user.id,
            organization: organizationId // CRITICAL: Filter by organization
        });

        if (!notification) {
            return next(new ErrorResponse('Notification not found or does not belong to your organization.', 404));
        }

        res.json({ msg: 'Notification removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return next(new ErrorResponse('Invalid Notification ID format.', 400));
        }
        return next(new ErrorResponse('Server Error deleting notification.', 500));
    }
}));

/**
 * @route   DELETE /api/notifications
 * @desc    Clear all notifications for current user within their organization
 * @access  Private
 */
router.delete('/', auth.protect, asyncHandler(async (req, res, next) => {
    const organizationId = req.organizationId;
    if (!organizationId) {
        return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
    }

    try {
        await Notification.deleteMany({
            recipient: req.user.id,
            organization: organizationId // CRITICAL: Filter by organization
        });
        res.json({ msg: 'All notifications cleared' });
    } catch (err) {
        console.error(err.message);
        return next(new ErrorResponse('Server Error clearing all notifications.', 500));
    }
}));

module.exports = router;

