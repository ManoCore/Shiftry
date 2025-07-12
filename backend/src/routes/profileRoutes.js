// src/routes/profileRoutes.js
const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
// const { protect } = require("../middleware/auth"); // Corrected: Assuming auth.js exports protect
const ErrorResponse = require("../utils/errorResponse"); // Import ErrorResponse
const User = require("../models/user"); // Corrected casing for User model import
const multer = require("multer");
const path = require("path");
const fs = require('fs'); // Required for file system operations
const auth = require('../middleware/auth');

const router = express.Router();

// --- Multer Configuration for File Uploads ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure the path is absolute and correctly points to the root 'uploads' folder
        const uploadDir = path.join(__dirname, '..', '..', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            console.log(`[Multer] Creating uploads directory: ${uploadDir}`);
            try {
                fs.mkdirSync(uploadDir, { recursive: true });
                console.log(`[Multer] Directory created: ${uploadDir}`);
            } catch (err) {
                console.error(`[Multer ERROR] Failed to create directory ${uploadDir}:`, err);
                return cb(err); // Pass error to Multer
            }
        }
        console.log(`[Multer] Destination directory: ${uploadDir}`);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // req.user._id comes from the `protect` middleware
        const userId = req.user && req.user._id ? req.user._id.toString() : 'unknown-user';

        if (userId === 'unknown-user') {
            console.error('[Multer ERROR] userId is not available in req.user. This might indicate auth failure or middleware order issue.');
            // This error will be caught by the Multer error handler below
        }
        const ext = path.extname(file.originalname);
        const filename = `${userId}-${Date.now()}${ext}`;
        console.log(`[Multer] Received file originalname: ${file.originalname}`);
        console.log(`[Multer] User ID from protect middleware: ${userId}`);
        console.log(`[Multer] Generated filename: ${filename}`);
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    console.log(`[Multer] File filter: mimetype is ${file.mimetype}`);
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        console.error(`[Multer ERROR] File type not allowed: ${file.mimetype}`);
        // Pass an Error object to Multer, which will be caught by the error handling middleware
        cb(new ErrorResponse('Only image files are allowed!', 400), false);
    }
};

// Initialize multer with storage and fileFilter
const uploadMiddleware = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Custom middleware to handle multer errors before asyncHandler
const handleMulterError = (req, res, next) => {
    // This wraps the actual multer upload.single call
    uploadMiddleware.single('profilePicture')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error(`[MulterError] Code: ${err.code}, Message: ${err.message}`);
            return next(new ErrorResponse(`File upload error: ${err.message}`, 400));
        } else if (err) {
            console.error(`[Upload ERROR] An unknown error occurred during upload:`, err);
            // If it's an instance of ErrorResponse, pass it directly
            if (err instanceof ErrorResponse) {
                return next(err);
            }
            return next(new ErrorResponse(err.message || 'File upload failed due to an unknown error.', 500));
        }
        next(); // Proceed to the main route handler
    });
};


// --- GET User Profile Route (`/api/profile/me`) ---
router.get("/me", auth.protect, asyncHandler(async (req, res, next) => {
    console.log("GET /profile/me route hit");
    console.log("req.user (from protect middleware):", req.user);
    console.log("req.organizationId (from protect middleware):", req.organizationId);

    const userId = req.user._id;
    const organizationId = req.organizationId; // Get organization ID from authenticated request

    // Find the user by ID and ensure they belong to the current organization
    const user = await User.findOne({ _id: userId, organization: organizationId })
                           .select('-passwordHash -inviteToken') // Exclude sensitive fields
                           .populate('organization', 'name'); // Populate organization name

    if (!user) {
        console.log("User not found for ID:", userId);
        return next(new ErrorResponse("User not found in your organization.", 404));
    }

    res.status(200).json({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailId: user.emailId,
        role: user.role,
        status: user.status,
        profilePicture: user.profilePicture,
        preferredFullName: user.preferredFullName,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        pronouns: user.pronouns,
        address: user.address,
        emergencyContact: user.emergencyContact,
        social: user.social,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        // Include organization details
        organization: user.organization ? {
            _id: user.organization._id,
            name: user.organization.name,
        } : null,
    });
}));


// --- UPDATE User Profile Route (`/api/profile/me`) - ACCESSIBLE BY ANY AUTHENTICATED USER ---
router.put("/me",
    auth.protect,
    handleMulterError, // Use the custom error handling middleware here
     asyncHandler(async (req, res, next) => {
        console.log(`[Backend] PUT /me - After Multer: req.body:`, req.body);
        console.log(`[Backend] PUT /me - After Multer: req.file:`, req.file);

        // --- FIX STARTS HERE ---
        // Destructure fields, using the full dot-notation keys for nested objects
        // as they are sent by FormData and parsed by Multer.
        const {
            firstName,
            lastName,
            preferredFullName,
            phoneNumber,
            dateOfBirth,
            gender,
            pronouns,
            // Address fields will be flat keys like 'address.addressLine1'
            'address.addressLine1': addressLine1,
            'address.addressLine2': addressLine2,
            'address.city': city,
            'address.state': state,
            'address.postcode': postcode,
            'address.country': country,
            // Emergency contact fields will be flat keys like 'emergencyContact.contactName'
            'emergencyContact.contactName': contactName,
            'emergencyContact.contactRelationship': contactRelationship,
            'emergencyContact.contactPhone': contactPhone,
            // Social fields will be flat keys like 'social.facebook'
            'social.facebook': facebook,
            'social.twitter': twitter,
            'social.linkedin': linkedin
        } = req.body || {}; // Use || {} to prevent errors if req.body is undefined

        console.log(`[Backend] Destructured contactName:`, contactName);
        console.log(`[Backend] Destructured contactRelationship:`, contactRelationship);
        console.log(`[Backend] Destructured contactPhone:`, contactPhone);
        // --- FIX ENDS HERE ---

        const userId = req.user._id;
        const organizationId = req.organizationId; // Get organization ID from authenticated request

        // Find the user by ID and ensure they belong to the current organization
        const user = await User.findOne({ _id: userId, organization: organizationId });

        if (!user) {
            console.error(`[Backend] User not found for ID: ${userId} in organization ${organizationId}`);
            return next(new ErrorResponse("User not found in your organization.", 404));
        }

        // --- Delete old profile picture if a new one is uploaded ---
        // Check if a new file was uploaded AND if the old profilePicture path is local
        // (i.e., contains '/uploads/' and is not the default image)
        if (req.file && user.profilePicture && user.profilePicture.includes('/uploads/')) {
            const oldFilename = path.basename(user.profilePicture);
            const oldFilePath = path.join(__dirname, '..', '..', 'uploads', oldFilename);
            const defaultImagePath = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'; // Make sure this matches your actual default

            if (user.profilePicture !== defaultImagePath && fs.existsSync(oldFilePath)) {
                fs.unlink(oldFilePath, (err) => {
                    if (err) console.error("Failed to delete old profile picture:", err);
                });
            }
        }

        // Update profile picture URL
        if (req.file) {
            const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            user.profilePicture = imageUrl;
            console.log(`[Backend] New profile picture URL set: ${imageUrl}`);
        }

        // Update fields if provided (check for undefined to allow clearing fields if client sends null/empty string explicitly)
        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (preferredFullName !== undefined) user.preferredFullName = preferredFullName;
        if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
        if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
        if (gender !== undefined) user.gender = gender;
        if (pronouns !== undefined) user.pronouns = pronouns;

        // Update nested address object
        user.address = user.address || {}; // Initialize if not exists
        if (addressLine1 !== undefined) user.address.addressLine1 = addressLine1;
        if (addressLine2 !== undefined) user.address.addressLine2 = addressLine2;
        if (city !== undefined) user.address.city = city;
        if (state !== undefined) user.address.state = state;
        if (postcode !== undefined) user.address.postcode = postcode;
        if (country !== undefined) user.address.country = country;

        // Update nested emergencyContact object
        user.emergencyContact = user.emergencyContact || {}; // Initialize if not exists
        // Now, contactName, contactRelationship, contactPhone will be correctly destructured
        if (contactName !== undefined) user.emergencyContact.contactName = contactName;
        if (contactRelationship !== undefined) user.emergencyContact.contactRelationship = contactRelationship;
        if (contactPhone !== undefined) user.emergencyContact.contactPhone = contactPhone;

        // Update nested social object
        user.social = user.social || {}; // Initialize if not exists
        if (facebook !== undefined) user.social.facebook = facebook;
        if (twitter !== undefined) user.social.twitter = twitter;
        if (linkedin !== undefined) user.social.linkedin = linkedin;

        await user.save({ runValidators: true }); // Run schema validators on save
        console.log(`[Backend] User ${userId} saved successfully. User object after save:`, user);

        // Return the updated user object, ensuring all relevant fields are included
        // Populate organization again if not already populated on `user` object from `findById`
        const updatedUser = await User.findById(user._id)
                                    .select('-passwordHash -inviteToken')
                                    .populate('organization', 'name'); // Re-populate for the response

        console.log(`[Backend] Final user object sent in response:`, updatedUser);

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: updatedUser._id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                emailId: updatedUser.emailId,
                role: updatedUser.role,
                profilePicture: updatedUser.profilePicture,
                status: updatedUser.status,
                preferredFullName: updatedUser.preferredFullName,
                phoneNumber: updatedUser.phoneNumber,
                dateOfBirth: updatedUser.dateOfBirth,
                gender: updatedUser.gender,
                pronouns: updatedUser.pronouns,
                address: updatedUser.address,
                emergencyContact: updatedUser.emergencyContact, // This should now be populated
                social: updatedUser.social,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt,
                // Include organization details
                organization: updatedUser.organization ? {
                    _id: updatedUser.organization._id,
                    name: updatedUser.organization.name,
                } : null,
            },
        });
    })
);

module.exports = router;



// // src/routes/profileRoutes.js
// const express = require("express");
// const asyncHandler = require("../middleware/asyncHandler");
// // const { protect } = require("../middleware/auth"); // Corrected: Assuming auth.js exports protect
// const ErrorResponse = require("../utils/errorResponse"); // Import ErrorResponse
// const User = require("../models/user"); // Corrected casing for User model import
// const multer = require("multer");
// const path = require("path");
// const fs = require('fs'); // Required for file system operations
// const auth = require('../middleware/auth');

// const router = express.Router();

// // --- Multer Configuration for File Uploads ---
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         // Ensure the path is absolute and correctly points to the root 'uploads' folder
//         const uploadDir = path.join(__dirname, '..', '..', 'uploads');
//         if (!fs.existsSync(uploadDir)) {
//             console.log(`[Multer] Creating uploads directory: ${uploadDir}`);
//             try {
//                 fs.mkdirSync(uploadDir, { recursive: true });
//                 console.log(`[Multer] Directory created: ${uploadDir}`);
//             } catch (err) {
//                 console.error(`[Multer ERROR] Failed to create directory ${uploadDir}:`, err);
//                 return cb(err); // Pass error to Multer
//             }
//         }
//         console.log(`[Multer] Destination directory: ${uploadDir}`);
//         cb(null, uploadDir);
//     },
//     filename: (req, file, cb) => {
//         // req.user._id comes from the `protect` middleware
//         const userId = req.user && req.user._id ? req.user._id.toString() : 'unknown-user';

//         if (userId === 'unknown-user') {
//             console.error('[Multer ERROR] userId is not available in req.user. This might indicate auth failure or middleware order issue.');
//             // This error will be caught by the Multer error handler below
//         }
//         const ext = path.extname(file.originalname);
//         const filename = `${userId}-${Date.now()}${ext}`;
//         console.log(`[Multer] Received file originalname: ${file.originalname}`);
//         console.log(`[Multer] User ID from protect middleware: ${userId}`);
//         console.log(`[Multer] Generated filename: ${filename}`);
//         cb(null, filename);
//     }
// });

// const fileFilter = (req, file, cb) => {
//     console.log(`[Multer] File filter: mimetype is ${file.mimetype}`);
//     if (file.mimetype.startsWith('image/')) {
//         cb(null, true);
//     } else {
//         console.error(`[Multer ERROR] File type not allowed: ${file.mimetype}`);
//         // Pass an Error object to Multer, which will be caught by the error handling middleware
//         cb(new ErrorResponse('Only image files are allowed!', 400), false);
//     }
// };

// // Initialize multer with storage and fileFilter
// const uploadMiddleware = multer({
//     storage: storage,
//     fileFilter: fileFilter,
//     limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
// });

// // Custom middleware to handle multer errors before asyncHandler
// const handleMulterError = (req, res, next) => {
//     // This wraps the actual multer upload.single call
//     uploadMiddleware.single('profilePicture')(req, res, (err) => {
//         if (err instanceof multer.MulterError) {
//             console.error(`[MulterError] Code: ${err.code}, Message: ${err.message}`);
//             return next(new ErrorResponse(`File upload error: ${err.message}`, 400));
//         } else if (err) {
//             console.error(`[Upload ERROR] An unknown error occurred during upload:`, err);
//             // If it's an instance of ErrorResponse, pass it directly
//             if (err instanceof ErrorResponse) {
//                 return next(err);
//             }
//             return next(new ErrorResponse(err.message || 'File upload failed due to an unknown error.', 500));
//         }
//         next(); // Proceed to the main route handler
//     });
// };


// // --- GET User Profile Route (`/api/profile/me`) ---
// router.get("/me", auth.protect, asyncHandler(async (req, res, next) => {
//     console.log("GET /profile/me route hit");
//     console.log("req.user (from protect middleware):", req.user);
//     console.log("req.organizationId (from protect middleware):", req.organizationId);

//     const userId = req.user._id;
//     const organizationId = req.organizationId; // Get organization ID from authenticated request

//     // Find the user by ID and ensure they belong to the current organization
//     const user = await User.findOne({ _id: userId, organization: organizationId })
//                            .select('-passwordHash -inviteToken') // Exclude sensitive fields
//                            .populate('organization', 'name'); // Populate organization name

//     if (!user) {
//         console.log("User not found for ID:", userId);
//         return next(new ErrorResponse("User not found in your organization.", 404));
//     }

//     res.status(200).json({
//         id: user._id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         emailId: user.emailId,
//         role: user.role,
//         status: user.status,
//         profilePicture: user.profilePicture,
//         preferredFullName: user.preferredFullName,
//         phoneNumber: user.phoneNumber,
//         dateOfBirth: user.dateOfBirth,
//         gender: user.gender,
//         pronouns: user.pronouns,
//         address: user.address,
//         emergencyContact: user.emergencyContact,
//         social: user.social,
//         createdAt: user.createdAt,
//         updatedAt: user.updatedAt,
//         // Include organization details
//         organization: user.organization ? {
//             _id: user.organization._id,
//             name: user.organization.name,
//         } : null,
//     });
// }));


// // --- UPDATE User Profile Route (`/api/profile/me`) - ACCESSIBLE BY ANY AUTHENTICATED USER ---
// router.put("/me",
//     auth.protect,
//     handleMulterError, // Use the custom error handling middleware here
//     asyncHandler(async (req, res, next) => {
//         console.log(`[Route] PUT /me - After Multer: req.body:`, req.body);
//         console.log(`[Route] PUT /me - After Multer: req.file:`, req.file);

//         const {
//             firstName,
//             lastName,
//             preferredFullName,
//             phoneNumber,
//             dateOfBirth,
//             gender,
//             pronouns,
//             addressLine1, addressLine2, city, state, postcode, country, // Address fields
//             contactName, contactRelationship, contactPhone, // Emergency contact fields
//             facebook, twitter, linkedin // Social fields
//         } = req.body || {}; // Use || {} to prevent errors if req.body is undefined

//         const userId = req.user._id;
//         const organizationId = req.organizationId; // Get organization ID from authenticated request

//         // Find the user by ID and ensure they belong to the current organization
//         const user = await User.findOne({ _id: userId, organization: organizationId });

//         if (!user) {
//             console.error(`[Route] User not found for ID: ${userId} in organization ${organizationId}`);
//             return next(new ErrorResponse("User not found in your organization.", 404));
//         }

//         // --- Delete old profile picture if a new one is uploaded ---
//         // Check if a new file was uploaded AND if the old profilePicture path is local
//         // (i.e., contains '/uploads/' and is not the default image)
//         if (req.file && user.profilePicture && user.profilePicture.includes('/uploads/')) {
//             const oldFilename = path.basename(user.profilePicture);
//             const oldFilePath = path.join(__dirname, '..', '..', 'uploads', oldFilename);
//             const defaultImagePath = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

//             if (user.profilePicture !== defaultImagePath && fs.existsSync(oldFilePath)) {
//                 fs.unlink(oldFilePath, (err) => {
//                     if (err) console.error("Failed to delete old profile picture:", err);
//                 });
//             }
//         }

//         // Update profile picture URL
//         if (req.file) {
//             const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
//             user.profilePicture = imageUrl;
//             console.log(`[Route] New profile picture URL set: ${imageUrl}`);
//         }

//         // Update fields if provided (check for undefined to allow clearing fields if client sends null/empty string explicitly)
//         if (firstName !== undefined) user.firstName = firstName;
//         if (lastName !== undefined) user.lastName = lastName;
//         if (preferredFullName !== undefined) user.preferredFullName = preferredFullName;
//         if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
//         if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
//         if (gender !== undefined) user.gender = gender;
//         if (pronouns !== undefined) user.pronouns = pronouns;

//         // Update nested address object
//         user.address = user.address || {}; // Initialize if not exists
//         if (addressLine1 !== undefined) user.address.addressLine1 = addressLine1;
//         if (addressLine2 !== undefined) user.address.addressLine2 = addressLine2;
//         if (city !== undefined) user.address.city = city;
//         if (state !== undefined) user.address.state = state;
//         if (postcode !== undefined) user.address.postcode = postcode;
//         if (country !== undefined) user.address.country = country;

//         // Update nested emergencyContact object
//         user.emergencyContact = user.emergencyContact || {}; // Initialize if not exists
//         if (contactName !== undefined) user.emergencyContact.contactName = contactName;
//         if (contactRelationship !== undefined) user.emergencyContact.contactRelationship = contactRelationship;
//         if (contactPhone !== undefined) user.emergencyContact.contactPhone = contactPhone;

//         // Update nested social object
//         user.social = user.social || {}; // Initialize if not exists
//         if (facebook !== undefined) user.social.facebook = facebook;
//         if (twitter !== undefined) user.social.twitter = twitter;
//         if (linkedin !== undefined) user.social.linkedin = linkedin;

//         await user.save({ runValidators: true }); // Run schema validators on save
//         console.log(`[Route] User ${userId} saved successfully.`);

//         // Return the updated user object, ensuring all relevant fields are included
//         // Populate organization again if not already populated on `user` object from `findById`
//         const updatedUser = await User.findById(user._id)
//                                       .select('-passwordHash -inviteToken')
//                                       .populate('organization', 'name'); // Re-populate for the response

//         res.status(200).json({
//             message: "Profile updated successfully",
//             user: {
//                 id: updatedUser._id,
//                 firstName: updatedUser.firstName,
//                 lastName: updatedUser.lastName,
//                 emailId: updatedUser.emailId,
//                 role: updatedUser.role,
//                 profilePicture: updatedUser.profilePicture,
//                 status: updatedUser.status,
//                 preferredFullName: updatedUser.preferredFullName,
//                 phoneNumber: updatedUser.phoneNumber,
//                 dateOfBirth: updatedUser.dateOfBirth,
//                 gender: updatedUser.gender,
//                 pronouns: updatedUser.pronouns,
//                 address: updatedUser.address,
//                 emergencyContact: updatedUser.emergencyContact,
//                 social: updatedUser.social,
//                 createdAt: updatedUser.createdAt,
//                 updatedAt: updatedUser.updatedAt,
//                 // Include organization details
//                 organization: updatedUser.organization ? {
//                     _id: updatedUser.organization._id,
//                     name: updatedUser.organization.name,
//                 } : null,
//             },
//         });
//     })
// );

// module.exports = router;
