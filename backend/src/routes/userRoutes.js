const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const exportUsersToCSV = require("../utils/exportToCSV");
const generateInviteToken = require("../utils/inviteToken");
const isStrongPassword = require("../utils/passwordValidator");
const auth = require('../middleware/auth');
const asyncHandler = require("../middleware/asyncHandler");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const multer = require('multer');
const upload = multer();
const nodemailer = require('nodemailer'); // Import Nodemailer
 
const router = express.Router();
const SALT_ROUNDS = 10;
 
// Load environment variables (ensure dotenv is configured in your main app.js or server.js)
// If not already done globally, you might need: require('dotenv').config(); here
// However, it's best practice to configure dotenv once at your app's entry point.
 
// Define BASE_FRONTEND_URL and LOGO_URL from environment variables
// Ensure these are defined AFTER dotenv.config() has run in your application's entry file.
const BASE_FRONTEND_URL = process.env.CLIENT_BASE_URL || 'http://localhost:3000'; // Default for local dev
const LOGO_URL = process.env.LOGO_URL || `${BASE_FRONTEND_URL}/shiftrylogo.png`; // Assuming shiftrylogo.png is directly in frontend public
 
// Extract company and app names from environment variables for email customization
const COMPANY_NAME = process.env.COMPANY_NAME || 'Your Company Name'; // e.g., "MATCHOPTIONS LUTON"
const APP_NAME = process.env.APP_NAME || 'Your Application'; // e.g., "Deputy"
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin'; // e.g., "MATCHOPTIONS LUTON ADMIN"
 
 
// Nodemailer transporter setup (use your actual credentials from .env)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: false, // Use 'true' for port 465 (SSL), 'false' for 587 (TLS/STARTTLS)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // This can be set to true in production if you have valid certs
    }
});
 
// --- Get All Users (Admin/Manager View) ---
router.get("/all", asyncHandler(async (req, res) => {
    const users = await User.find({}, "_id firstName lastName emailId status role visaStatus employmentType training");
 
    const formattedUsers = users.map(user => ({
        _id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.emailId,
        access: user.role || "user",
        status: user.status,
        visaStatus: user.visaStatus,
        employmentType: user.employmentType,
        training: user.training,
    }));
 
    res.status(200).json(formattedUsers);
}));
router.get('/:id', auth, asyncHandler(async (req, res) => { // <-- ADDED THIS ROUTE
  try {
    const userId = req.params.id;
 
    // Optional: Add authorization check here.
    // For example, only an admin or the user themselves can view this profile.
    // if (req.user.role !== 'admin' && req.user.id !== userId) {
    //   return res.status(403).json({ message: 'Access denied. You can only view your own profile or require admin privileges.' });
    // }
 
    const user = await User.findById(userId).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    // Handle invalid ObjectId format specifically
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid user ID format.' });
    }
    res.status(500).json({ message: 'Failed to fetch user details.' });
  }
}));
 
router.put('/:id', protect, authorizeRoles('admin'), upload.none(),asyncHandler(async (req, res) => {
    console.log('Received FormData fields:', req.body);
    const userId = req.params.id;
    const {
        firstName, lastName, emailId, role, status, mobile, visaStatus,
        training, employmentType, preferredFullName, phoneNumber, dateOfBirth,
        gender, pronouns,
        // Nested object fields are sent as flat keys by FormData, e.g., 'address.city'
        'address.addressLine1': addressLine1, 'address.addressLine2': addressLine2,
        'address.city': city, 'address.state': state, 'address.postcode': postcode, 'address.country': country,
        'emergencyContact.contactName': contactName, 'emergencyContact.contactRelationship': contactRelationship,
        'emergencyContact.contactPhone': contactPhone,
        'social.facebook': facebook, 'social.twitter': twitter, 'social.linkedin': linkedin
    } = req.body;
 
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        // Update basic fields if provided (and not undefined)
        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (mobile !== undefined) user.mobile = mobile;
        if (visaStatus !== undefined) user.visaStatus = visaStatus;
        if (training !== undefined) user.training = training;
        if (employmentType !== undefined) user.employmentType = employmentType;
        if (preferredFullName !== undefined) user.preferredFullName = preferredFullName;
        if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
        if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
        if (gender !== undefined) user.gender = gender;
        if (pronouns !== undefined) user.pronouns = pronouns;
 
        // Handle emailId update: Check for uniqueness if email is changed
        if (emailId !== undefined && emailId !== user.emailId) {
            const existingUserWithNewEmail = await User.findOne({ emailId });
            if (existingUserWithNewEmail && existingUserWithNewEmail._id.toString() !== userId) {
                return res.status(409).json({ message: 'Email address is already in use by another user.' });
            }
            user.emailId = emailId;
        }
 
        // Handle role and status updates (only for admin/manager, which is already enforced by authorizeRoles)
        if (role !== undefined) user.role = role;
        if (status !== undefined) user.status = status;
 
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
        if (contactName !== undefined) user.emergencyContact.contactName = contactName;
        if (contactRelationship !== undefined) user.emergencyContact.contactRelationship = contactRelationship;
        if (contactPhone !== undefined) user.emergencyContact.contactPhone = contactPhone;
 
        // Update nested social object
        user.social = user.social || {}; // Initialize if not exists
        if (facebook !== undefined) user.social.facebook = facebook;
        if (twitter !== undefined) user.social.twitter = twitter;
        if (linkedin !== undefined) user.social.linkedin = linkedin;
 
        await user.save({ runValidators: true }); // Run schema validators on save
 
        res.status(200).json({
            message: 'User profile updated successfully.',
            user: user // Send back the updated user object
        });
 
    } catch (error) {
        console.error('Error updating user by ID:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Failed to update user details.' });
    }
}));
 
// --- Add New User (Directly, e.g., by Admin) ---
router.post("/add", asyncHandler(async (req, res) => {
    const { firstName, lastName, emailId, password } = req.body;
 
    if (!firstName || !lastName || !emailId || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
 
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
        return res.status(409).json({ message: "Email already exists" });
    }
 
    if (!isStrongPassword(password)) {
        return res.status(400).json({
            message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
        });
    }
 
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
 
    const newUser = new User({
        firstName,
        lastName,
        emailId,
        passwordHash,
        status: "active",
    });
 
    await newUser.save();
    await exportUsersToCSV();
    res.status(201).json({ message: "User added successfully" });
}));
 
// --- Generate User Invitation ---
router.post("/generate-invite", asyncHandler(async (req, res) => {
    const requiredFields = ["firstName", "lastName", "emailId", "role"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
 
    if (missingFields.length > 0) {
        return res.status(400).json({
            message: `Missing required fields: ${missingFields.join(", ")}`,
        });
    }
 
    const { firstName, emailId, role } = req.body;
 
    const existingUser = await User.findOne({ emailId });
 
    if (existingUser) {
        if (existingUser.status === "invited" && existingUser.inviteToken) {
            // If already invited, provide the existing invite URL and indicate it's already invited
            const inviteUrl = `${BASE_FRONTEND_URL}/invite/${existingUser.inviteToken}`;
            return res.status(200).json({
                inviteUrl: inviteUrl,
                message: "User already invited",
            });
        }
        return res.status(409).json({ message: "User already exists" });
    }
 
    const inviteToken = generateInviteToken();
    const newUser = new User({
        ...req.body,
        status: "invited",
        inviteToken,
    });
    await newUser.save();
 
    const inviteUrl = `${BASE_FRONTEND_URL}/invite/${inviteToken}`;
 
    // --- Start Email Sending Logic for Invitation ---
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emailId,
        subject: `${ADMIN_NAME} from ${COMPANY_NAME} has invited you to join ${APP_NAME}`, // Matches image subject
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="${LOGO_URL}" alt="${APP_NAME} Logo" style="max-width: 100px;">
                </div>
                <h2 style="color: #333; text-align: center;">Join ${COMPANY_NAME} on ${APP_NAME}</h2>
                <p style="color: #555; text-align: center; font-size: 1.1em;">
                    Dear ${firstName || 'User'},
                </p>
                <p style="color: #555; margin-top: 20px;">
                    ${ADMIN_NAME} from ${COMPANY_NAME} has invited you to receive your shifts using ${APP_NAME}.
                </p>
                <p style="color: #555; margin-top: 10px;">
                    Accept the invite below to start using ${APP_NAME}.
                </p>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="${inviteUrl}"
                       style="background-color: #6a0dad; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 1.1em; display: inline-block;">
                        Accept invitation
                    </a>
                </div>
                <p style="color: #888; font-size: 0.9em; text-align: center; margin-top: 20px;">
                    This invitation will expire in 7 days.
                </p>
                <p style="color: #888; font-size: 0.8em; text-align: center; margin-top: 30px;">
                    Thank you!
                </p>
            </div>
        `
    };
 
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(`Error sending invite email to ${emailId}:`, error);
        } else {
            console.log(`Invite email sent to ${emailId}:`, info.response);
        }
    });
    // --- End Email Sending Logic ---
 
    res.status(200).json({
        inviteUrl: inviteUrl,
        message: "Invite created successfully and email sent.",
    });
}));
 
// --- Accept Invitation ---
router.post("/accept-invite", asyncHandler(async (req, res) => {
    const { token, password } = req.body;
 
    if (!token || !password) {
        return res.status(400).json({ message: "Token and password required" });
    }
 
    const user = await User.findOne({ inviteToken: token });
    if (!user) return res.status(404).json({ message: "Invalid or expired invite token" });
 
    if (!isStrongPassword(password)) {
        return res.status(400).json({ message: "Weak password" });
    }
 
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    user.passwordHash = passwordHash;
    user.status = "active";
    user.inviteToken = undefined; // Clear the invite token after acceptance
 
    await user.save();
 
    res.status(200).json({ message: "Account created successfully" });
}));
 
// --- Get Invite Details by Token ---
router.get("/invite/:token", asyncHandler(async (req, res) => {
    const { token } = req.params;
    const user = await User.findOne({ inviteToken: token });
 
    if (!user) return res.status(404).json({ message: "Invalid invite token" });
 
    res.status(200).json({
        emailId: user.emailId,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
    });
}));

router.delete('/:id', protect, asyncHandler(async (req, res, next) => {
    const userId = req.params.id;

    // Ensure req.user exists
    if (!req.user) {
        return next(new ErrorResponse('Authentication required.', 401));
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorResponse('User not found.', 404));
    }

    // Prevent an admin from deleting themselves
    if (req.user.id.toString() === userId) {
        return next(new ErrorResponse('You cannot delete your own user account.', 400));
    }

    await User.findByIdAndDelete(userId);
    res.status(200).json({ success: true, message: 'User deleted successfully.' });
}));
 
module.exports = router;