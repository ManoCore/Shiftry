// src/routes/profileRoutes.js
const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/user");
const multer = require("multer");
const path = require("path");
const fs = require('fs'); // Required for file system operations

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
        // req.user.userId comes from the `protect` middleware
        const userId = req.user && req.user._id ? req.user._id.toString() : 'unknown-user';

        if (userId === 'unknown-user') {
            console.error('[Multer ERROR] userId is not available in req.user. This might indicate auth failure or middleware order issue.');
            // Do NOT call cb(new Error(...)) here unless you want to stop the request immediately.
            // For file naming, 'unknown-user' is a fallback. The main issue is that protect might not have run or set req.user correctly.
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
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// --- GET User Profile Route (`/api/profile/me`) ---
router.get("/me", protect, asyncHandler(async (req, res) => {
    console.log("GET /profile/me route hit");
    console.log("req.user:", req.user);

    const userId = req.user._id;
    const user = await User.findById(userId).select('-passwordHash');

    if (!user) {
        console.log("User not found for ID:", userId);
        return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailId: user.emailId,
        role: user.role,
        status: user.status,
        profilePicture: user.profilePicture,
        preferredFullName: user.preferredFullName, // Added
        phoneNumber: user.phoneNumber,             // Added
        dateOfBirth: user.dateOfBirth,             // Added
        gender: user.gender,                       // Added
        pronouns: user.pronouns,                   // Added
        address: user.address,                     // Added (assuming this is an object in your User model)
        emergencyContact: user.emergencyContact,   // Added (assuming this is an object in your User model)
        social: user.social,                       // Added (assuming this is an object in your User model)
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    });
}));


// --- UPDATE User Profile Route (`/api/profile/me`) - ACCESSIBLE BY ANY AUTHENTICATED USER ---
router.put("/me", protect,
    upload.single('profilePicture'),
    (err, req, res, next) => {
        if (err instanceof multer.MulterError) {
            console.error(`[MulterError] Code: ${err.code}, Message: ${err.message}`);
            return res.status(400).json({ message: `File upload error: ${err.message}` });
        } else if (err) {
            console.error(`[Upload ERROR] An unknown error occurred during upload:`, err);
            return res.status(500).json({ message: err.message || 'File upload failed due to an unknown error.' });
        }
        next();
    },
    asyncHandler(async (req, res) => {
        console.log(`[Route] PUT /me - After Multer: req.body:`, req.body);
        console.log(`[Route] PUT /me - After Multer: req.file:`, req.file);

        const {
            firstName,
            lastName,
            preferredFullName, // Added
            phoneNumber,       // Added
            dateOfBirth,       // Added
            gender,            // Added
            pronouns,          // Added
            addressLine1, addressLine2, city, state, postcode, country, // Address fields
            contactName, contactRelationship, contactPhone, // Emergency contact fields
            facebook, twitter, linkedin // Social fields
        } = req.body || {};

        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) {
            console.error(`[Route] User not found for ID: ${userId}`);
            return res.status(404).json({ message: "User not found" });
        }

        // --- Delete old profile picture if a new one is uploaded ---
        if (req.file && user.profilePicture && user.profilePicture.includes('/uploads/')) {
            const oldFilename = path.basename(user.profilePicture);
            const oldFilePath = path.join(__dirname, '..', '..', 'uploads', oldFilename);
            const defaultImagePath = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
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
            console.log(`[Route] New profile picture URL set: ${imageUrl}`);
        }

        // Update fields if provided
        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (preferredFullName !== undefined) user.preferredFullName = preferredFullName; // Added
        if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;                   // Added
        if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;                   // Added
        if (gender !== undefined) user.gender = gender;                                 // Added
        if (pronouns !== undefined) user.pronouns = pronouns;                           // Added

        // Update nested address object
        if (addressLine1 !== undefined || addressLine2 !== undefined || city !== undefined || state !== undefined || postcode !== undefined || country !== undefined) {
            user.address = user.address || {}; // Initialize if not exists
            if (addressLine1 !== undefined) user.address.addressLine1 = addressLine1;
            if (addressLine2 !== undefined) user.address.addressLine2 = addressLine2;
            if (city !== undefined) user.address.city = city;
            if (state !== undefined) user.address.state = state;
            if (postcode !== undefined) user.address.postcode = postcode;
            if (country !== undefined) user.address.country = country;
        }

        // Update nested emergencyContact object
        if (contactName !== undefined || contactRelationship !== undefined || contactPhone !== undefined) {
            user.emergencyContact = user.emergencyContact || {}; // Initialize if not exists
            if (contactName !== undefined) user.emergencyContact.contactName = contactName;
            if (contactRelationship !== undefined) user.emergencyContact.contactRelationship = contactRelationship;
            if (contactPhone !== undefined) user.emergencyContact.contactPhone = contactPhone;
        }

        // Update nested social object
        if (facebook !== undefined || twitter !== undefined || linkedin !== undefined) {
            user.social = user.social || {}; // Initialize if not exists
            if (facebook !== undefined) user.social.facebook = facebook;
            if (twitter !== undefined) user.social.twitter = twitter;
            if (linkedin !== undefined) user.social.linkedin = linkedin;
        }

        await user.save();
        console.log(`[Route] User ${userId} saved successfully.`);

        // Return the updated user object, ensuring all relevant fields are included
        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                emailId: user.emailId,
                role: user.role,
                profilePicture: user.profilePicture,
                status: user.status,
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
            },
        });
    })
);

module.exports = router;