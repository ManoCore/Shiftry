
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Organization = require("../models/Organization"); // <--- Ensure Organization model is imported!
const asyncHandler = require("../middleware/asyncHandler"); // Your custom async error handler
const ErrorResponse = require("../utils/errorResponse"); // Your custom error response class
const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken"); // No longer directly used here, sendTokenResponse handles it
const  isStrongPassword  = require("../utils/passwordValidator"); // Your password validation utility
const { sendTokenResponse } = require("../utils/sendTokenResponse"); // Your token response utility
const jwt = require('jsonwebtoken');

// const { protect, authorizeRoles } = require("../middleware/auth");
const auth = require('../middleware/auth');

// Load environment variables (ensure these are set in your .env file)
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10; // Use env var for salt rounds

router.post("/signup",asyncHandler(async (req, res, next) => {
    // For signup, we expect user details and an organizationName.
    // The first user signing up with a new organizationName becomes its initial admin.
    const { firstName, lastName, emailId, password, organizationName } = req.body;

    // --- Input Validation ---
    if (!firstName || !lastName || !emailId || !password || !organizationName) {
        return next(new ErrorResponse("All fields (firstName, lastName, emailId, password, organizationName) are required", 400));
    }

    if (!/^\S+@\S+\.\S+$/.test(emailId)) {
        return next(new ErrorResponse("Invalid email format", 400));
    }

    if (!isStrongPassword(password)) {
        return next(
            new ErrorResponse(
                "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
                400
            )
        );
    }

    // --- Organization Handling ---
    let organization = await Organization.findOne({ name: organizationName.trim() });

    if (organization) {
        // If an organization with this name already exists, we prevent direct signup.
        // In a more complex SaaS, you might offer an "invite" flow or "join existing organization".
        return next(new ErrorResponse(`Organization with name "${organizationName}" already exists. Please choose a different name or contact support.`, 409));
    }

    // If no existing organization, create a new one for this signup.
    organization = await Organization.create({
        name: organizationName.trim(),
        // Add any other default fields for a new organization here (e.g., subscriptionPlan: 'Trial')
    });
    console.log(`New Organization created: ${organization.name} (${organization._id})`);

    // --- User Existence Check (Global) ---
    // This check ensures that an email ID is not used across different organizations for initial signup.
    // If you intend for users to belong to multiple organizations with the same email, this logic needs adjustment.
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
        // If the email exists, and they are trying to create a *new* organization,
        // it means this email is already associated with another organization.
        // Rollback the newly created organization to prevent orphaned data.
        await Organization.findByIdAndDelete(organization._id);
        console.error(`Signup failed: Email ${emailId} already registered with another organization. Rolled back organization creation.`);
        return next(new ErrorResponse("This email is already registered with another organization. Please use a different email or log in.", 409));
    }

    // --- Hash Password ---
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // --- Create User and Assign to Organization ---
    const newUser = await User.create({
        firstName,
        lastName,
        emailId,
        passwordHash,
        status: "active",
        role: "admin", 
        organization: organization._id, 
    });
    console.log(`New User created: ${newUser.emailId} (${newUser._id}) for Organization: ${organization._id}`);

    // --- Send Token Response ---
    // Pass the newly created user and the organization object to sendTokenResponse.
    sendTokenResponse(newUser, 201, res, organization);
}));
router.post("/login",asyncHandler(async (req, res, next) => {
    const { emailId, password } = req.body;

    // --- Input Validation ---
    if (!emailId || !password) {
        return next(new ErrorResponse("Please provide an email and password", 400));
    }

    // --- Find User and Populate Organization ---
    // CRUCIALLY, populate the 'organization' field to get its details.
    const user = await User.findOne({ emailId }).select("+passwordHash").populate("organization");

    if (!user) {
        return next(new ErrorResponse("Invalid credentials", 401));
    }

    // --- Check Password Match ---
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        return next(new ErrorResponse("Invalid credentials", 401));
    }

    // --- Check User Status ---
    if (user.status !== "active") {
        return next(new ErrorResponse("User account is inactive. Please contact your administrator.", 401));
    }

    // --- Ensure User is Associated with an Organization ---
    // This provides a safety net in case of data inconsistencies, though it should be linked from signup.
    if (!user.organization) {
        console.error(`Login failed: User ${user._id} does not have an associated organization!`);
        return next(new ErrorResponse("User account corrupted: Missing organization data. Please contact support.", 500));
    }

    // --- Send Token Response ---
    // Pass the authenticated user and their populated organization object to sendTokenResponse.
    sendTokenResponse(user, 200, res, user.organization);
}));
router.get("/me", auth.protect, asyncHandler(async (req, res, next) => {
        // Find the user by ID from the authenticated request.
        // CRITICAL CHANGE: Populate the 'organization' field to include its details.
        const user = await User.findById(req.user.id)
                               .select('-passwordHash -inviteToken') // Exclude sensitive fields
                               .populate('organization'); // <--- ADD THIS LINE TO POPULATE ORGANIZATION

        if (!user) {
            // This case should ideally not happen if 'protect' middleware works correctly,
            // but it's a good safeguard.
            return next(new ErrorResponse('Authenticated user not found.', 404));
        }

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                emailId: user.emailId,
                role: user.role,
                profilePicture: user.profilePicture,
                status: user.status, // Include status if it's relevant for frontend
                // CRITICAL ADDITION: Include the populated organization details
                organization: user.organization ? {
                    _id: user.organization._id,
                    name: user.organization.name,
                    // Add any other organization fields you want to expose to the frontend
                } : null,
            },
        });
    })
);
router.put("/updatepassword",auth.protect,asyncHandler(async (req, res, next) => {
        const { currentPassword, newPassword } = req.body;

        // Fetch user with password hash to compare
        const user = await User.findById(req.user.id).select("+passwordHash");

        if (!user) {
            return next(new ErrorResponse('Authenticated user not found.', 404));
        }

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            return next(new ErrorResponse("Password is incorrect", 401));
        }

        // Validate new password strength
        if (!isStrongPassword(newPassword)) {
            return next(
                new ErrorResponse(
                    "Password must be at least 8 characters and include uppercase, lowercase, number and special character",
                    400
                )
            );
        }

        // Hash new password and save
        user.passwordHash = await bcrypt.hash(newPassword, process.env.SALT_ROUNDS || 10); // Use SALT_ROUNDS from env or default
        await user.save();

        // Send token response (optional, but common to re-issue token after password change)
        const organization = await Organization.findById(user.organization);
        sendTokenResponse(user, 200, res, organization);
    })
);
router.post('/send-reset-email/:userId', auth.protect, auth.authorizeRoles('admin'), asyncHandler(async (req, res, next) => {
    const { userId } = req.params;

    try {
        // CRITICAL MULTI-TENANCY CHANGE: Ensure the targeted user belongs to the admin's organization
        const user = await User.findOne({ _id: userId, organization: req.organizationId });
        if (!user) {
            return next(new ErrorResponse('User not found in your organization.', 404));
        }

        // Generate reset token
        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Use process.env.JWT_SECRET
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const BASE_FRONTEND_URL = process.env.CLIENT_BASE_URL || 'http://localhost:3000';
        const APP_NAME = process.env.APP_NAME || 'Your Application';
        const COMPANY_NAME = process.env.COMPANY_NAME || 'Your Company Name';

        const resetUrl = `${BASE_FRONTEND_URL}/reset-password/${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.emailId,
            subject: `${APP_NAME} Password Reset (Admin Initiated)`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                    <h2 style="color: #333; text-align: center;">Password Reset Initiated by Admin</h2>
                    <p style="color: #555;">An administrator from ${COMPANY_NAME} has initiated a password reset for your ${APP_NAME} account.</p>
                    <p style="color: #555;">Please click on the following link to set a new password:</p>
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${resetUrl}" style="background-color: #6a0dad; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 1.1em; display: inline-block;">
                            Set New Password
                        </a>
                    </div>
                    <p style="color: #555; margin-top: 20px;">This link will expire in 1 hour.</p>
                    <p style="color: #888; font-size: 0.8em; text-align: center; margin-top: 30px;">If you did not expect this, please contact your administrator.</p>
                </div>
            `,
        };

        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT, 10),
            secure: process.env.EMAIL_PORT === '465',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(`Error sending admin-initiated password reset email to ${user.emailId}:`, error);
                return next(new ErrorResponse('Error sending password reset email.', 500));
            }
            console.log(`Admin-initiated password reset email sent to ${user.emailId}:`, info.response);
            res.status(200).json({ success: true, message: 'Password reset email sent successfully.' });
        });

    } catch (error) {
        console.error('Admin password reset initiation error:', error);
        next(new ErrorResponse('Server error initiating password reset.', 500));
    }
}));
router.put('/reset-credentials/:userId', auth.protect, auth.authorizeRoles('admin'), asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const { newEmail, newPassword } = req.body;

    if (!newEmail && !newPassword) {
        return next(new ErrorResponse('Either new email or new password must be provided.', 400));
    }

    try {
        // CRITICAL MULTI-TENANCY CHANGE: Ensure the targeted user belongs to the admin's organization
        const user = await User.findOne({ _id: userId, organization: req.organizationId });
        if (!user) {
            return next(new ErrorResponse('User not found in your organization.', 404));
        }

        let updateFields = {};
        if (newEmail && newEmail !== user.emailId) {
            // Check if new email already exists globally (assuming global email uniqueness)
            const existingUserWithNewEmail = await User.findOne({ emailId: newEmail });
            if (existingUserWithNewEmail && existingUserWithNewEmail._id.toString() !== userId) {
                return next(new ErrorResponse('New email address is already in use by another user.', 409));
            }
            updateFields.emailId = newEmail;
        }

        if (newPassword) {
            if (!isStrongPassword(newPassword)) {
                return next(new ErrorResponse('New password is not strong enough.', 400));
            }
            updateFields.passwordHash = await bcrypt.hash(newPassword, process.env.SALT_ROUNDS || 10); // Use SALT_ROUNDS from env or default
            // Clear any pending reset tokens if password is directly reset
            updateFields.resetPasswordToken = undefined;
            updateFields.resetPasswordExpires = undefined;
        }

        // Perform the update
        const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true, runValidators: true }).select('-passwordHash');

        // Optionally send a notification to the user about credentials change
        // Ensure Notification model is imported and available at the top of this file if you want to use it
        // e.g., const Notification = require('../models/Notification');
        if (typeof Notification !== 'undefined' && Notification) {
            const APP_NAME = process.env.APP_NAME || 'Your Application';
            const notificationMessage = `Your login credentials for ${APP_NAME} have been updated by an administrator. Please check your email for details if applicable.`;
            const userNotification = new Notification({
                recipient: updatedUser._id,
                message: notificationMessage,
                type: 'credentials_update',
                schedule: undefined, // Set to undefined as it's not relevant here
                isRead: false,
                organization: updatedUser.organization, // CRITICAL: Assign notification to user's organization
            });
            await userNotification.save();
        } else {
            console.warn('Notification model not available or not imported. Skipping user notification for credentials update.');
        }

        res.status(200).json({ success: true, message: 'Login credentials updated successfully.', user: updatedUser });

    } catch (error) {
        console.error('Admin reset credentials error:', error);
        next(new ErrorResponse('Server error resetting credentials.', 500));
    }
}));
router.put("/updatedetails", auth.protect,asyncHandler(async (req, res, next) => {
        const { firstName, lastName, emailId } = req.body;

        // Check if email is being updated and if it already exists
        if (emailId && emailId !== req.user.emailId) {
            const existingUser = await User.findOne({ emailId });
            if (existingUser) {
                return next(new ErrorResponse("Email already exists", 400));
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                firstName,
                lastName,
                emailId,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                emailId: user.emailId,
                role: user.role,
                profilePicture: user.profilePicture,
            },
        });
    })
);
router.put("/reset-password/:resettoken",asyncHandler(async (req, res, next) => {
        const { newPassword } = req.body;

        if (!isStrongPassword(newPassword)) {
            return next(
                new ErrorResponse(
                    "Password must be at least 8 characters and include uppercase, lowercase, number and special character",
                    400
                )
            );
        }

        // Verify token
        const decoded = jwt.verify(req.params.resettoken, JWT_SECRET);

        // Find user
        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new ErrorResponse("User not found", 404));
        }

        // Hash new password
        user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        user.resetPasswordToken = undefined; // Clear the token after use
        user.resetPasswordExpires = undefined; // Clear the expiration
        await user.save();

        sendTokenResponse(user, 200, res);
    })
);
router.post("/forgot-password", asyncHandler(async (req, res, next) => {
    const { emailId } = req.body;

    const user = await User.findOne({ emailId });
    if (!user) {
        return next(new ErrorResponse("Email not found", 404));
    }

    const resetToken = jwt.sign({ id: user._id }, JWT_SECRET, {
        expiresIn: "1h",
    });

    // Save the reset token to the user in the database
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `${BASE_FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
        from: process.env.EMAIL_USER, // Dynamic sender email
        to: user.emailId,
        subject: `${APP_NAME} Password Reset`, // Dynamic app name in subject
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${APP_NAME} Password Reset</title>
                <style type="text/css">
                    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
                    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
                    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; display: block; }
                    a[x-apple-data-detectors] {
                        color: inherit !important;
                        text-decoration: none !important;
                        font-size: inherit !important;
                        font-family: inherit !important;
                        font-weight: inherit !important;
                        line-height: inherit !important;
                    }
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333333;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f4;
                    }
                    .email-container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border: 1px solid #dddddd;
                        border-radius: 5px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                        overflow: hidden;
                    }
                    .header-section {
                        padding: 20px;
                        text-align: center;
                        background-color: #ffffff;
                    }
                    .logo {
                        max-width: 150px;
                        height: auto;
                        display: block;
                        margin: 0 auto;
                    }
                    .content-section {
                        padding: 20px;
                    }
                    .button {
                        background-color: #6a0dad;
                        color: white;
                        padding: 12px 25px;
                        text-decoration: none;
                        border-radius: 5px;
                        font-size: 1.1em;
                        display: inline-block;
                    }
                    .footer-section {
                        text-align: center;
                        padding: 20px;
                        font-size: 0.85em;
                        color: #777777;
                        border-top: 1px solid #eeeeee;
                        margin-top: 20px;
                    }
                    @media only screen and (max-width: 620px) {
                        .email-container {
                            width: 100% !important;
                            border-radius: 0 !important;
                        }
                    }
                </style>
            </head>
            <body>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="min-width: 100%;">
                    <tr>
                        <td align="center" style="padding: 20px 0;">
                            <table class="email-container" width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="max-width: 600px; background-color: #ffffff; border: 1px solid #dddddd; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                                <tr>
                                    <td class="header-section" style="padding: 20px; text-align: center; background-color: #ffffff;">
                                        <img src="${LOGO_URL}" alt="${APP_NAME} Logo" class="logo" width="150" height="auto">
                                    </td>
                                </tr>
                                <tr>
                                    <td class="content-section" style="padding: 20px;">
                                        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 10px;">Dear ${user.firstName || 'User'},</p>
                                        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 10px;">You are receiving this because you (or someone else) have requested the reset of the password for your ${APP_NAME} account at ${COMPANY_NAME}.</p>
                                        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 10px;">Please click on the following link, or paste this into your browser to complete the process:</p>
                                        <div style="text-align: center; margin-top: 30px;">
                                            <a href="${resetLink}" class="button">
                                                Reset Password
                                            </a>
                                        </div>
                                        <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">This link will expire in 1 hour.</p>
                                        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 0;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
                                        <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">Thank you!</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="footer-section">
                                        <p style="margin: 0;">&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
                                        <p style="margin: 5px 0 0 0;">This is an automated email, please do not reply.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
          `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(`NODEMAILER ERROR: Failed to send password reset email to ${user.emailId}:`, error);
            return next(new ErrorResponse('Error sending password reset email.', 500));
        }
        console.log('Password reset email sent:', info.response);
        res.status(200).json({ success: true, message: 'Password reset email sent.' });
    });
}));

module.exports = router;
