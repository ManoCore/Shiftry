// // routes/companyRoutes.js (or organizationRoutes.js based on your project structure)
// const express = require('express');
// const router = express.Router();
// const Company = require('../models/Company'); // Import your Company model
// const { protect, authorizeRoles } = require('../middleware/auth'); // Import both middleware functions
// const asyncHandler = require("../middleware/asyncHandler"); // For error handling
// const ErrorResponse = require('../utils/errorResponse'); // Import ErrorResponse

// // @desc    Get company profile for the authenticated user's organization
// // @route   GET /api/company/profile
// // @access  Private (Admin user only, specific to their organization)
// router.get('/profile', protect, authorizeRoles('admin'), asyncHandler(async (req, res, next) => {
//     const organizationId = req.organizationId;
//     const organizationName = req.organizationName; // Get organizationName from token
//     const adminUserId = req.user._id; // Get the admin user's ID from req.user

//     console.log("DEBUG: [CompanyRoutes] Attempting to fetch/create company profile for:");
//     console.log(`DEBUG: [CompanyRoutes] organizationId: ${organizationId}`);
//     console.log(`DEBUG: [CompanyRoutes] organizationName: ${organizationName}`);
//     console.log(`DEBUG: [CompanyRoutes] adminUserId: ${adminUserId}`); // Log the actual admin user ID
//     console.log(`DEBUG: [CompanyRoutes] req.user.emailId: ${req.user.emailId}`); // Log user email for context


//     if (!organizationId) {
//         return next(new ErrorResponse('Organization ID not found for this user. Ensure your user is associated with an organization.', 400));
//     }

//     try {
//         let company = await Company.findById(organizationId);

//         if (!company) {
//             console.log("DEBUG: [CompanyRoutes] Company profile not found. Attempting to auto-create.");
//             // Company profile not found for this organizationId.
//             // Attempt to auto-create it using the organizationId as its _id.
//             try {
//                 const companyData = {
//                     _id: organizationId, // Assign the organizationId as the _id of the company document
//                     companyName: organizationName || 'Default Company Name', // Use organizationName from token for 'companyName' field
//                     adminUser: adminUserId, // Map to adminUser
//                     contactEmail: req.user.emailId || 'default@example.com',
//                     // Add other default fields as per your Company model schema
//                     companyAddress: {
//                         addressLine1: '', addressLine2: '', city: '', state: '', postcode: '', country: '',
//                     },
//                     billingAddress: { name: '', street: '', city: '', postcode: '', country: '' },
//                     invoiceEmail: req.user.emailId || 'default@example.com',
//                     companyAddressForBilling: { name: '', street: '', city: '', postcode: '', country: '' },
//                     taxInfo: 'N/A',
//                     paymentDetails: 'Not set',
//                     scheduling: 'MONTHLY',
//                     nextInvoiceDate: new Date(),
//                     hrPricePerUser: '£0.00',
//                     hrDescription: 'Default HR plan description.',
//                     currentUsers: 0,
//                 };
//                 console.log("DEBUG: [CompanyRoutes] Data for Company.create:", companyData); // CRITICAL LOG: See what's actually passed

//                 company = await Company.create(companyData);
//                 console.log("DEBUG: [CompanyRoutes] Company auto-created successfully:", company._id);
//                 return res.status(201).json(company); // Return 201 Created if a new profile was made
//             } catch (createError) {
//                 console.error('ERROR: [CompanyRoutes] Error auto-creating company profile:', createError);
//                 if (createError.code === 11000) { // Duplicate key error
//                     return next(new ErrorResponse('A company with this ID already exists (duplicate organization ID or adminUser). Please contact support.', 409));
//                 }
//                 if (createError.name === 'ValidationError') {
//                     const messages = Object.values(createError.errors).map(val => val.message);
//                     // Log the validation errors for more detail
//                     console.error("DEBUG: [CompanyRoutes] Validation Errors:", messages); // Log specific validation messages
//                     return next(new ErrorResponse(`Validation Error during company creation: ${messages.join(', ')}`, 400));
//                 }
//                 return next(new ErrorResponse('Failed to create default company profile. ' + createError.message, 500));
//             }
//         }

//         console.log("DEBUG: [CompanyRoutes] Company profile found:", company._id);
//         res.status(200).json(company);

//     } catch (error) {
//         console.error('ERROR: [CompanyRoutes] Error fetching company profile:', error);
//         next(new ErrorResponse('Server Error: Could not fetch company profile', 500));
//     }
// }));

// // @desc    Update company profile for the authenticated user's organization
// // @route   PUT /api/company/profile
// // @access  Private (Admin user only, specific to their organization)
// router.put('/profile', protect, authorizeRoles('admin'), asyncHandler(async (req, res, next) => {
//     const organizationId = req.organizationId;

//     if (!organizationId) {
//         return next(new ErrorResponse('Organization ID not found for this user.', 400));
//     }

//     try {
//         let company = await Company.findById(organizationId);

//         if (!company) {
//             return next(new ErrorResponse('Company profile not found for your organization. Cannot update.', 404));
//         }

//         Object.keys(req.body).forEach(key => {
//             if (typeof req.body[key] === 'object' && req.body[key] !== null && !Array.isArray(req.body[key])) {
//                 company[key] = { ...company[key], ...req.body[key] };
//             } else {
//                 company[key] = req.body[key];
//             }
//         });

//         if (req.body.nextInvoiceDate && typeof req.body.nextInvoiceDate === 'string') {
//             company.nextInvoiceDate = new Date(req.body.nextInvoiceDate);
//         }

//         await company.save();
//         res.status(200).json(company);

//     } catch (error) {
//         console.error('Error updating company profile:', error);
//         if (error.name === 'ValidationError') {
//             const messages = Object.values(error.errors).map(val => val.message);
//             return next(new ErrorResponse(`Validation Error: ${messages.join(', ')}`, 400));
//         }
//         next(new ErrorResponse('Server Error: Could not update company profile', 500));
//     }
// }));

// module.exports = router;


// routes/companyRoutes.js (or organizationRoutes.js based on your project structure)
const express = require('express');
const router = express.Router();
const Company = require('../models/Company'); // Import your Company model
const { protect, authorizeRoles } = require('../middleware/auth'); // Import both middleware functions
const asyncHandler = require("../middleware/asyncHandler"); // For error handling
const ErrorResponse = require('../utils/errorResponse'); // Import ErrorResponse

// @desc    Get company profile for the authenticated user's organization
// @route   GET /api/company/profile
// @access  Private (Admin user only, specific to their organization)
router.get('/profile', protect, authorizeRoles('admin'), asyncHandler(async (req, res, next) => {
    const organizationId = req.organizationId;
    const organizationName = req.organizationName; // Get organizationName from token
    const adminUserId = req.user._id; // Get the admin user's ID from req.user

    console.log("DEBUG: [CompanyRoutes] Attempting to fetch/create company profile for:");
    console.log(`DEBUG: [CompanyRoutes] organizationId: ${organizationId}`);
    console.log(`DEBUG: [CompanyRoutes] organizationName: ${organizationName}`);
    console.log(`DEBUG: [CompanyRoutes] adminUserId: ${adminUserId}`); // Log the actual admin user ID
    console.log(`DEBUG: [CompanyRoutes] req.user.emailId: ${req.user.emailId}`); // Log user email for context


    if (!organizationId) {
        return next(new ErrorResponse('Organization ID not found for this user. Ensure your user is associated with an organization.', 400));
    }

    try {
        let company = await Company.findById(organizationId);

        if (!company) {
            console.log("DEBUG: [CompanyRoutes] Company profile not found. Attempting to auto-create.");
            // Company profile not found for this organizationId.
            // Attempt to auto-create it using the organizationId as its _id.
            try {
                const companyData = {
                    _id: organizationId, // Assign the organizationId as the _id of the company document
                    companyName: organizationName || 'Default Company Name', // Use organizationName from token for 'companyName' field
                    adminUser: adminUserId, // Map to adminUser
                    contactEmail: req.user.emailId || 'default@example.com',
                    // Add other default fields as per your Company model schema
                    companyAddress: {
                        addressLine1: '', addressLine2: '', city: '', state: '', postcode: '', country: '',
                    },
                    billingAddress: { name: '', street: '', city: '', postcode: '', country: '' },
                    invoiceEmail: req.user.emailId || 'default@example.com',
                    companyAddressForBilling: { name: '', street: '', city: '', postcode: '', country: '' },
                    taxInfo: 'N/A',
                    paymentDetails: 'Not set',
                    scheduling: 'MONTHLY',
                    nextInvoiceDate: new Date(),
                    hrPricePerUser: '£0.00',
                    hrDescription: 'Default HR plan description.',
                    currentUsers: 0,
                };
                console.log("DEBUG: [CompanyRoutes] Data for Company.create:", companyData); // CRITICAL LOG: See what's actually passed

                company = await Company.create(companyData);
                console.log("DEBUG: [CompanyRoutes] Company auto-created successfully:", company._id);
                return res.status(201).json(company); // Return 201 Created if a new profile was made
            } catch (createError) {
                console.error('ERROR: [CompanyRoutes] Error auto-creating company profile:', createError);
                if (createError.code === 11000) { // Duplicate key error
                    return next(new ErrorResponse('A company with this ID already exists (duplicate organization ID or adminUser). Please contact support.', 409));
                }
                if (createError.name === 'ValidationError') {
                    const messages = Object.values(createError.errors).map(val => val.message);
                    // Log the validation errors for more detail
                    console.error("DEBUG: [CompanyRoutes] Validation Errors:", messages); // Log specific validation messages
                    return next(new ErrorResponse(`Validation Error during company creation: ${messages.join(', ')}`, 400));
                }
                return next(new ErrorResponse('Failed to create default company profile. ' + createError.message, 500));
            }
        }

        console.log("DEBUG: [CompanyRoutes] Company profile found:", company._id);
        res.status(200).json(company);

    } catch (error) {
        console.error('ERROR: [CompanyRoutes] Error fetching company profile:', error);
        next(new ErrorResponse('Server Error: Could not fetch company profile', 500));
    }
}));

// @desc    Update company profile for the authenticated user's organization
// @route   PUT /api/company/profile
// @access  Private (Admin user only, specific to their organization)
router.put('/profile', protect, authorizeRoles('admin'), asyncHandler(async (req, res, next) => {
    const organizationId = req.organizationId;

    if (!organizationId) {
        return next(new ErrorResponse('Organization ID not found for this user.', 400));
    }

    try {
        let company = await Company.findById(organizationId);

        if (!company) {
            return next(new ErrorResponse('Company profile not found for your organization. Cannot update.', 404));
        }

        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'object' && req.body[key] !== null && !Array.isArray(req.body[key])) {
                company[key] = { ...company[key], ...req.body[key] };
            } else {
                company[key] = req.body[key];
            }
        });

        if (req.body.nextInvoiceDate && typeof req.body.nextInvoiceDate === 'string') {
            company.nextInvoiceDate = new Date(req.body.nextInvoiceDate);
        }

        await company.save();
        res.status(200).json(company);

    } catch (error) {
        console.error('Error updating company profile:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return next(new ErrorResponse(`Validation Error: ${messages.join(', ')}`, 400));
        }
        next(new ErrorResponse('Server Error: Could not update company profile', 500));
    }
}));

module.exports = router;
