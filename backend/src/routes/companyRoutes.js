const express = require('express');
const router = express.Router();
const Company = require('../models/Company'); // Import your Company model
const auth = require('../middleware/auth'); // Import both middleware functions
const asyncHandler = require("../middleware/asyncHandler"); // For error handling
const ErrorResponse = require('../utils/errorResponse');
 
// @desc    Get company profile for the authenticated user's organization
// @route   GET /api/company/profile
// @access  Private (Admin user only, specific to their organization)
router.get('/profile', auth.protect, auth.authorizeRoles('admin'), asyncHandler(async (req, res, next) => {
    // This route is intended for an 'admin' user to manage THEIR organization's profile.
    // The 'req.organizationId' is populated by your 'protect' middleware from the user's JWT.
    const organizationId = req.organizationId;
 
    if (!organizationId) {
        // This should ideally not happen if the token is valid for an admin.
        return next(new ErrorResponse('Organization ID not found for this user. Ensure your user is associated with an organization.', 400));
    }
 
    try {
        // Find the company profile using the organizationId from the authenticated user.
        // This assumes that the Company model's _id corresponds to the organizationId.
        let company = await Company.findById(organizationId);
 
        if (!company) {
            // If no company profile is found for this organization ID, it means the organization
            // hasn't had its company profile set up yet in the Company collection.
            // In a multi-tenant system, the Company document (representing the tenant)
            // should typically be created during organization provisioning.
            // Returning 404 here is safer than auto-creating if the company 'name' is unique.
            return next(new ErrorResponse('Company profile not found for your organization. Please contact support.', 404));
 
            /*
            // Alternative: Auto-create a default company profile if it doesn't exist.
            // Use this with caution, especially if 'name' is a unique field.
            // You'd need a unique way to name the company, perhaps using req.organizationName
            // from the JWT, but even that might not be globally unique.
            // Example if you decide to auto-create (ensure unique name handling):
            try {
                company = await Company.create({
                    _id: organizationId, // Assign the organizationId as the _id of the company document
                    name: req.organizationName || 'Default Company Name', // Use organizationName from token
                    contactEmail: req.user.emailId || 'default@example.com',
                    // ... other default fields as per your Company model schema
                });
                return res.status(201).json(company); // Return 201 Created
            } catch (createError) {
                console.error('Error auto-creating company profile:', createError);
                return next(new ErrorResponse('Failed to create default company profile. ' + createError.message, 500));
            }
            */
        }
 
        // Return the found company profile
        res.status(200).json(company);
 
    } catch (error) {
        console.error('Error fetching company profile:', error);
        // Pass the error to the global error handler
        next(new ErrorResponse('Server Error: Could not fetch company profile', 500));
    }
}));
 
// @desc    Update company profile for the authenticated user's organization
// @route   PUT /api/company/profile
// @access  Private (Admin user only, specific to their organization)
router.put('/profile', auth.protect, auth.authorizeRoles('admin'), asyncHandler(async (req, res, next) => {
    // This route is intended for an 'admin' user to update THEIR organization's profile.
    const organizationId = req.organizationId;
 
    if (!organizationId) {
        return next(new ErrorResponse('Organization ID not found for this user.', 400));
    }
 
    try {
        // Find the company profile by its _id (which is the organizationId)
        let company = await Company.findById(organizationId);
 
        if (!company) {
            return next(new ErrorResponse('Company profile not found for your organization. Cannot update.', 404));
        }
 
        // Update fields based on the request body
        // This allows partial updates for any field in the consolidated schema
        Object.keys(req.body).forEach(key => {
            // Special handling for nested objects like companyAddress, billingAddress, etc.
            if (typeof req.body[key] === 'object' && req.body[key] !== null && !Array.isArray(req.body[key])) {
                // Merge nested objects to preserve existing sub-fields not in the request body
                company[key] = { ...company[key], ...req.body[key] };
            } else {
                // Directly assign for non-object fields
                company[key] = req.body[key];
            }
        });
 
        // Convert nextInvoiceDate string to Date object if it's provided and is a string
        if (req.body.nextInvoiceDate && typeof req.body.nextInvoiceDate === 'string') {
            company.nextInvoiceDate = new Date(req.body.nextInvoiceDate);
        }
 
        // Save the updated company profile
        await company.save();
        res.status(200).json(company);
 
    } catch (error) {
        console.error('Error updating company profile:', error);
        // Handle Mongoose validation errors specifically
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return next(new ErrorResponse(`Validation Error: ${messages.join(', ')}`, 400));
        }
        // Pass other errors to the global error handler
        next(new ErrorResponse('Server Error: Could not update company profile', 500));
    }
}));
 
module.exports = router;