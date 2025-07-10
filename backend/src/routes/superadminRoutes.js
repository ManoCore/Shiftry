// routes/superadminRoutes.js

const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth'); // Your auth middleware
const User = require('../models/user'); // Import your User model directly
const ErrorResponse = require('../utils/errorResponse'); // Import your ErrorResponse utility
const asyncHandler = require('../middleware/asyncHandler'); // Import asyncHandler

const router = express.Router();

// All routes in this file will be protected and restricted to 'superadmin'
router.use(protect, authorizeRoles('superadmin'));

// @desc    Get all admin users
// @route   GET /api/superadmin/admins
// @access  Private (Superadmin only)
router.get('/admins', asyncHandler(async (req, res, next) => {
    // Logic to get all admin users directly in the route handler
    // This will fetch all users where the 'role' field is 'admin'.
    const admins = await User.find({ role: 'admin' }).select('-passwordHash');

    res.status(200).json({
        success: true,
        count: admins.length,
        data: admins
    });
}));

// @desc    Delete an admin user by ID
// @route   DELETE /api/superadmin/admins/:id
// @access  Private (Superadmin only)
router.delete('/admins/:id', asyncHandler(async (req, res, next) => {
    // Logic to delete a user directly in the route handler
    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
        return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    // Prevent superadmin from deleting themselves
    if (req.user._id.toString() === userToDelete._id.toString()) {
        return next(new ErrorResponse('You cannot delete your own account.', 400));
    }

    // IMPORTANT: Superadmin can only delete 'admin' or 'employee' roles via this route.
    // They cannot delete other 'superadmin' accounts.
    if (userToDelete.role === 'superadmin') {
        return next(new ErrorResponse('Superadmin cannot delete another superadmin account.', 403));
    }
    // Optional: If you want to restrict deletion from this specific route to ONLY 'admin' roles,
    // uncomment the following block. Otherwise, a superadmin can delete any non-superadmin role.
    // if (userToDelete.role !== 'admin') {
    //     return next(new ErrorResponse('This route is only for deleting admin users. To delete other roles, use a different route or endpoint.', 403));
    // }


    await userToDelete.deleteOne();

    res.status(200).json({
        success: true,
        message: 'User deleted successfully.'
    });
}));

router.put('/admins/:id/status', asyncHandler(async (req, res, next) => {
    const { status } = req.body; // Expecting 'active' or 'inactive'

    // Validate the incoming status
    if (!status || !['active', 'inactive'].includes(status)) {
        return next(new ErrorResponse('Invalid status provided. Status must be "active" or "inactive".', 400));
    }

    const adminToUpdate = await User.findById(req.params.id);

    if (!adminToUpdate) {
        return next(new ErrorResponse(`Admin user not found with id of ${req.params.id}`, 404));
    }

    // Prevent superadmin from changing their own status
    if (req.user._id.toString() === adminToUpdate._id.toString()) {
        return next(new ErrorResponse('You cannot change your own status.', 400));
    }

    // Ensure only 'admin' roles can be updated via this route (not other superadmins)
    if (adminToUpdate.role === 'superadmin') {
        return next(new ErrorResponse('Cannot change the status of another superadmin account.', 403));
    }
    
    // Ensure only 'admin' roles are targeted by this route
    if (adminToUpdate.role !== 'admin') {
        return next(new ErrorResponse('This route is only for updating admin user statuses.', 403));
    }

    adminToUpdate.status = status;
    await adminToUpdate.save(); // Save the updated user

    res.status(200).json({
        success: true,
        message: `Admin status updated to ${status} successfully.`,
        data: adminToUpdate.toObject({ getters: true, virtuals: false })
    });
}));


module.exports = router;
