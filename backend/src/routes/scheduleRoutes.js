// routes/scheduleRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const { parseISO, format, isBefore, isAfter, areIntervalsOverlapping } = require('date-fns');
const nodemailer = require('nodemailer'); // Import nodemailer

const Schedule = require('../models/Schedule');
const Location = require('../models/Location');
const User=require("../models/user");
const Notification = require('../models/Notification');
const logoUrl = process.env.SHIFTRY_LOGO_URL;

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,   // This will be 'smtp.office365.com'
    port: parseInt(process.env.EMAIL_PORT, 10), // This will be 587
    secure: false, // For port 587 (STARTTLS), 'secure' should be false
    auth: {
        user: process.env.EMAIL_USER, // 'support@manocore.com'
        pass: process.env.EMAIL_PASS  // Your app password for support@manocore.com
    },
    tls: {
        // This is often needed for Office 365 or if you face certificate issues.
        // In a production environment, ideally, you'd ensure valid certificates
        // and set rejectUnauthorized to true. For development, false can be useful.
        rejectUnauthorized: false
    }
});

const getDateTime = (dateStr, timeStr) => {
    return parseISO(`${dateStr}T${timeStr}:00`);
};


router.get('/week/:startDate', auth, async (req, res) => {
    try {
        const { startDate } = req.params;
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(startDateObj);
        endDateObj.setDate(startDateObj.getDate() + 6); // Calculates end date by adding 6 days

        // Problem 1: date format in query
        // Problem 2: population fields might not match frontend expectations
        const schedules = await Schedule.find({
            date: {
                $gte: startDateObj.toISOString().split('T')[0], // This gets 'YYYY-MM-DD'
                $lte: endDateObj.toISOString().split('T')[0]    // This gets 'YYYY-MM-DD'
            }
        }).populate('careWorker', 'firstName avatar')
          .populate('location', 'firstName workType'); // Problem 3: `firstName` for location?

        res.json(schedules);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


router.post(
    '/',
    [
        auth,
        [
            check('start', 'Start time is required').not().isEmpty(),
            check('end', 'End time is required').not().isEmpty(),
            check('date', 'Date is required').not().isEmpty(),
            // Make careWorker optional for initial creation of open shifts
            // It will be required when a user "joins" the shift (via PUT route)
            // check('careWorker', 'Care worker is required').not().isEmpty(), // <-- REMOVE or MODIFY THIS LINE
            check('location', 'Location is required').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            // Destructure 'isPublished' and 'break' (since break is also sent from frontend)
            // Make sure careWorker can be optional from the request body
            const {
                start,
                end,
                description,
                careWorker, // This can now be null/undefined for open shifts
                location,
                date,
                break: breakDuration, // Renamed 'break' to 'breakDuration' to avoid conflict with JS keyword
                isPublished, // <-- ADD THIS TO DESTRUCTURING
            } = req.body;

            // Validate time format (existing code)
            const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(start) || !timeRegex.test(end)) {
                return res.status(400).json({ msg: 'Invalid time format. Use HH:MM' });
            }

            // Validate end time is after start time (existing code)
            const startMinutes = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1]);
            const endMinutes = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1]);
            if (endMinutes <= startMinutes) {
                return res.status(400).json({ msg: 'End time must be after start time' });
            }

            const newSchedule = new Schedule({
                start,
                end,
                description,
                careWorker: careWorker || null, // Ensure careWorker is null if not provided
                location,
                break: breakDuration || 0, // Default break to 0 if not provided
                date,
                isPublished: isPublished !== undefined ? isPublished : false, // Default to false if not provided (for new open shifts)
                createdBy: req.user.id,
            });

            let schedule = await newSchedule.save();
            schedule = await Schedule.findById(schedule._id)
                                       .populate('location', 'name');
            res.json(schedule);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

router.put('/:id', auth, async (req, res) => {
    try {
        // ADD 'isPublished' to the destructuring.
        // Also, align 'breakDuration' name for consistency if frontend sends 'break'.
        const { start, end, description, status, careWorker, location, date, break: breakDuration, isPublished } = req.body;

        let schedule = await Schedule.findById(req.params.id);
        if (!schedule) {
            return res.status(404).json({ msg: 'Schedule not found' });
        }

        // Check if user is admin/manager or the assigned care worker
        // You might want to adjust this logic based on who is allowed to 'confirm' a shift.
        // If an employee confirms an open shift, they are not yet the careWorker,
        // so `schedule.careWorker.toString() !== req.user.id` would be true.
        // Consider if admin/manager or if the shift is currently unassigned.
        // Example adjustment for allowing unassigned shifts to be confirmed by any employee:
        if (req.user.role !== 'admin' && req.user.role !== 'manager' &&
            (schedule.careWorker && schedule.careWorker.toString() !== req.user.id)) {
            return res.status(401).json({ msg: 'Not authorized to update this specific shift' });
        }


        // Update fields
        if (start) schedule.start = start;
        if (end) schedule.end = end;
        if (description) schedule.description = description;
        // If 'status' is being used for something else, keep it.
        // Otherwise, 'isPublished' is typically enough to denote assignment status.
        // If you plan to use 'isPublished' as the primary indicator, you might remove 'status' from here.
        if (status) schedule.status = status;

        // careWorker can be explicitly set to null/undefined or an ID
        if (careWorker !== undefined) schedule.careWorker = careWorker;
        if (location) schedule.location = location;
        if (date) schedule.date = new Date(date).toISOString().split('T')[0];

        if (typeof breakDuration !== 'undefined') schedule.break = breakDuration;

        // ADD THIS LINE: Update the isPublished field
        if (isPublished !== undefined) schedule.isPublished = isPublished;

        schedule.updatedAt = Date.now();
        await schedule.save();

        const populatedSchedule = await Schedule.findById(schedule._id)
            .populate('careWorker', 'firstName avatar')
            .populate('location', 'name'); // Populate location with its 'name' for frontend display
                                           // and its '_id' is also available if needed.
        res.json(populatedSchedule); // Return the populated schedule
    } catch (err) {
        console.error(err.message);
        // Add more specific error handling if needed, e.g., for CastError (invalid ObjectId)
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Schedule ID' });
        }
        res.status(500).send('Server Error');
    }
});



router.delete('/:id', auth, async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id)
            .populate('careWorker', 'firstName lastName emailId') // Populate careWorker for email
            .populate('location', 'name'); // Populate location for email

        if (!schedule) {
            return res.status(404).json({ msg: 'Schedule not found' });
        }

        // Check if user is admin or manager
        if (req.user.role !== 'admin' && req.user.role !== 'manager') {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Schedule.deleteOne({ _id: req.params.id });

        // --- Start Email Sending Logic for Deleted Schedule ---
        const logoUrl = 'https://papaya-jalebi-91fef3.netlify.app/shiftrylogo.png'; // Your logo URL

        if (Array.isArray(schedule.careWorker) && schedule.careWorker.length > 0) {
            for (const careWorker of schedule.careWorker) {
                if (careWorker && careWorker.emailId) {
                    const mailOptions = {
                        from: 'support@manocore.com', // Sender address
                        to: careWorker.emailId, // Use the individual careWorker's emailId
                        subject: 'Your Shift Has Been Removed/Canceled',
                        html: `
                            <!DOCTYPE html>
                            <html lang="en">
                            <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>Your Shift Has Been Removed</title>
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
                                    ul {
                                        list-style-type: none;
                                        padding: 0;
                                        margin: 0;
                                    }
                                    ul li {
                                        margin-bottom: 10px;
                                        padding-left: 20px;
                                        position: relative;
                                    }
                                    ul li::before {
                                        content: "•";
                                        color: #dc3545; /* Red color for removed shift */
                                        position: absolute;
                                        left: 0;
                                    }
                                    strong {
                                        color: #dc3545; /* Red color for emphasis */
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
                                                        <img src="${logoUrl}" alt="Shiftry Logo" class="logo" width="150" height="auto" style="max-width: 150px; height: auto; display: block; margin: 0 auto;" onerror="this.src='https://placehold.co/150x50/cccccc/333333?text=Logo+Error';">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="content-section" style="padding: 20px;">
                                                        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 10px;">Dear ${careWorker.firstName || 'Care Worker'},</p>
                                                        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 10px;">Please be informed that your shift on <strong style="color: #dc3545;">${schedule.date}</strong> has been removed/canceled:</p>
                                                        <ul style="list-style-type: none; padding: 0; margin: 0;">
                                                            <li style="margin-bottom: 10px; padding-left: 20px; position: relative;"><span style="position: absolute; left: 0; color: #dc3545;">•</span> <strong style="color: #dc3545;">Location:</strong> ${schedule.location ? schedule.location.name : 'N/A'}</li>
                                                            <li style="margin-bottom: 10px; padding-left: 20px; position: relative;"><span style="position: absolute; left: 0; color: #dc3545;">•</span> <strong style="color: #dc3545;">Time:</strong> ${schedule.start} - ${schedule.end}</li>
                                                            <li style="margin-bottom: 10px; padding-left: 20px; position: relative;"><span style="position: absolute; left: 0; color: #dc3545;">•</span> <strong style="color: #dc3545;">Description:</strong> ${schedule.description || 'No description provided.'}</li>
                                                        </ul>
                                                        <p style="font-size: 16px; line-height: 1.6; margin-top: 20px; margin-bottom: 10px;">We apologize for any inconvenience this may cause. Please check your latest schedule on the app.</p>
                                                        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 0;">Thank you!</p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="footer-section" style="text-align: center; padding: 20px; font-size: 0.85em; color: #777777; border-top: 1px solid #eeeeee; margin-top: 20px;">
                                                        <p style="margin: 0; padding: 0;">&copy; ${new Date().getFullYear()} Manocore. All rights reserved.</p>
                                                        <p style="margin: 5px 0 0 0; padding: 0;">This is an automated email, please do not reply.</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </body>
                            </html>
                        `
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.error(`Error sending deletion email to ${careWorker.emailId} for schedule ${schedule._id}:`, error);
                        } else {
                            console.log(`Deletion email sent to ${careWorker.emailId} for schedule ${schedule._id}:`, info.response);
                        }
                    });
                } else {
                    console.warn(`Care worker object or email not found for deleted schedule ID: ${schedule._id} (careWorker ID: ${careWorker ? careWorker._id : 'N/A'}). Deletion email not sent.`);
                }
            }
        } else {
            console.warn(`No care workers found for deleted schedule ID: ${schedule._id}. Deletion email not sent.`);
        }
        // --- End Email Sending Logic for Deleted Schedule ---

        res.json({ msg: 'Schedule removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/range', auth,async (req, res) => {
    try {
        let { startDate, endDate } = req.query; // Get dates from query parameters

        if (!startDate || !endDate) {
            return res.status(400).json({ msg: 'startDate and endDate query parameters are required' });
        }

        // Convert incoming date strings to Date objects for validation
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);

        // Basic validation: ensure dates are valid and endDate is not before startDate
        if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime()) || endDateObj < startDateObj) {
            return res.status(400).json({ msg: 'Invalid startDate or endDate provided' });
        }

        // Use the YYYY-MM-DD format for MongoDB query, matching how you store dates
        const queryStartDate = startDateObj.toISOString().split('T')[0];
        const queryEndDate = endDateObj.toISOString().split('T')[0];

        const schedules = await Schedule.find({
            date: {
                $gte: queryStartDate, // Schedules on or after queryStartDate
                $lte: queryEndDate    // Schedules on or before queryEndDate
            }
        })
        .populate('careWorker', 'firstName lastName profilePicture status') // CORRECTED
.populate('location', 'name workType address.city address.country'); // CORRECTED // Populate location (assuming it's an ObjectId reference)

        res.json(schedules);
    } catch (err) {
        console.error("Error in /api/schedules/range:", err.message);
        res.status(500).send('Server Error');
    }
});


router.post('/publish', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'manager') {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const { scheduleIds } = req.body;

        if (!Array.isArray(scheduleIds) || scheduleIds.length === 0) {
            return res.status(400).json({ msg: 'scheduleIds must be a non-empty array' });
        }

        await Schedule.updateMany(
            { _id: { $in: scheduleIds } },
            { $set: { isPublished: true } }
        );

        const updatedSchedules = await Schedule.find({ _id: { $in: scheduleIds } })
            .populate('careWorker', 'firstName lastName emailId')
            .populate('location', 'name');

        const logoUrl = 'https://papaya-jalebi-91fef3.netlify.app/shiftrylogo.png';

        // Arrays to hold promises for concurrent execution
        const emailPromises = [];
        const notificationPromises = []; // <--- NEW: Array for notification promises

        for (const schedule of updatedSchedules) {
            if (Array.isArray(schedule.careWorker) && schedule.careWorker.length > 0) {
                for (const careWorker of schedule.careWorker) {
                    if (careWorker && careWorker.emailId) {
                        const mailOptions = {
                            from: 'support@manocore.com',
                            to: careWorker.emailId,
                            subject: 'Your Schedule Has Been Published!',
                            html: `
                                <!DOCTYPE html>
                                <html lang="en">
                                <head>
                                    <meta charset="UTF-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <title>Your Schedule Has Been Published!</title>
                                    <style type="text/css">
                                        /* Basic email reset and styling for cross-client compatibility */
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

                                        /* General body and container styles */
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
                                            overflow: hidden; /* Helps with border-radius visually */
                                        }
                                        .header-section {
                                            padding: 20px;
                                            text-align: center;
                                            background-color: #ffffff;
                                        }
                                        /* Styling for the logo image */
                                        .logo {
                                            max-width: 150px; /* Adjust based on your logo size and desired display */
                                            height: auto;
                                            display: block; /* Important for centering and removing extra space */
                                            margin: 0 auto; /* Centers the image */
                                        }
                                        .content-section {
                                            padding: 20px;
                                        }
                                        /* Styling for the schedule list */
                                        ul {
                                            list-style-type: none;
                                            padding: 0;
                                            margin: 0;
                                        }
                                        ul li {
                                            margin-bottom: 10px;
                                            padding-left: 20px; /* Indent for custom bullet */
                                            position: relative;
                                        }
                                        ul li::before {
                                            content: "•"; /* Custom bullet point */
                                            color: #007bff; /* A nice blue color, can be customized */
                                            position: absolute;
                                            left: 0;
                                        }
                                        strong {
                                            color: #0056b3; /* A darker blue for emphasis */
                                        }
                                        .footer-section {
                                            text-align: center;
                                            padding: 20px;
                                            font-size: 0.85em;
                                            color: #777777;
                                            border-top: 1px solid #eeeeee;
                                            margin-top: 20px;
                                        }
                                        /* Basic responsiveness for smaller screens */
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
                                                            <img src="${logoUrl}" alt="Shiftry Logo" class="logo" width="150" height="auto" style="max-width: 150px; height: auto; display: block; margin: 0 auto;">
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td class="content-section" style="padding: 20px;">
                                                            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 10px;">Dear ${careWorker.firstName || 'Care Worker'},</p>
                                                            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 10px;">Your schedule for <strong style="color: #0056b3;">${schedule.date}</strong> has been published:</p>
                                                            <ul style="list-style-type: none; padding: 0; margin: 0;">
                                                                <li style="margin-bottom: 10px; padding-left: 20px; position: relative;"><span style="position: absolute; left: 0; color: #007bff;">•</span> <strong style="color: #0056b3;">Location:</strong> ${schedule.location ? schedule.location.name : 'N/A'}</li>
                                                                <li style="margin-bottom: 10px; padding-left: 20px; position: relative;"><span style="position: absolute; left: 0; color: #007bff;">•</span> <strong style="color: #0056b3;">Time:</strong> ${schedule.start} - ${schedule.end}</li>
                                                                <li style="margin-bottom: 10px; padding-left: 20px; position: relative;"><span style="position: absolute; left: 0; color: #007bff;">•</span> <strong style="color: #0056b3;">Description:</strong> ${schedule.description || 'No description provided.'}</li>
                                                            </ul>
                                                            <p style="font-size: 16px; line-height: 1.6; margin-top: 20px; margin-bottom: 10px;">Please check the app for full details.</p>
                                                            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 0;">Thank you!</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td class="footer-section" style="text-align: center; padding: 20px; font-size: 0.85em; color: #777777; border-top: 1px solid #eeeeee; margin-top: 20px;">
                                                            <p style="margin: 0; padding: 0;">&copy; ${new Date().getFullYear()} Manocore. All rights reserved.</p>
                                                            <p style="margin: 5px 0 0 0; padding: 0;">This is an automated email, please do not reply.</p>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </body>
                                </html>
                            `
                        };

                        // Instead of directly calling transporter.sendMail with a callback,
                        // push a promise into an array for Promise.allSettled later.
                        emailPromises.push(
                            new Promise((resolve, reject) => {
                                transporter.sendMail(mailOptions, (error, info) => {
                                    if (error) {
                                        console.error(`Error sending email to ${careWorker.emailId} for schedule ${schedule._id}:`, error);
                                        reject({ status: 'rejected', email: careWorker.emailId, scheduleId: schedule._id, error: error.message });
                                    } else {
                                        console.log(`Email sent to ${careWorker.emailId} for schedule ${schedule._id}:`, info.response);
                                        resolve({ status: 'fulfilled', email: careWorker.emailId, scheduleId: schedule._id });
                                    }
                                });
                            })
                        );
                        // --- NEW: Create Notification here ---
                        const notificationMessage = `Your schedule for ${new Date(schedule.date).toLocaleDateString()} at ${schedule.location ? schedule.location.name : 'N/A'} from ${schedule.start} to ${schedule.end} has been published.`;

                        const newNotification = new Notification({
                            recipient: careWorker._id,  // FIX: Changed 'user' to 'recipient'
                            message: notificationMessage,
                            schedule: schedule._id,     // Link directly to the schedule using its ID
                            type: 'schedule_published', // FIX: Added required 'type' field
                            relatedDocument: schedule._id, // Good practice to link related document
                            relatedModel: 'Schedule',   // Good practice to specify related model
                            isRead: false
                        });

                        notificationPromises.push(
                            newNotification.save()
                                .then(savedNotif => {
                                    console.log(`Notification created for ${careWorker.firstName} (${careWorker._id}) for schedule ${schedule._id}`);
                                    return { status: 'fulfilled', notificationId: savedNotif._id, userId: careWorker._id };
                                })
                                .catch(notifError => {
                                    console.error(`Error creating notification for ${careWorker.firstName} (${careWorker._id}) for schedule ${schedule._id}:`, notifError.message);
                                    return { status: 'rejected', userId: careWorker._id, scheduleId: schedule._id, error: notifError.message };
                                })
                        );


                    } else {
                        console.warn(`Care worker object or email not found for schedule ID: ${schedule._id} (careWorker ID: ${careWorker ? careWorker._id : 'N/A'}). Email/Notification not sent.`);
                    }
                }
            } else {
                console.warn(`No care workers found for schedule ID: ${schedule._id}. Email/Notification not sent.`);
            }
        }

        // Wait for all email and notification promises to settle
        await Promise.allSettled([...emailPromises, ...notificationPromises]); // Combine both arrays

        res.json(updatedSchedules);
        console.log('published successfully');
    } catch (err) {
        console.error('Error in publishSchedules:', err.message);
        res.status(500).send('Server Error');
    }
});


router.post('/publish-by-careworker', async (req, res) => {
    try {
        const { careWorkerEmails, locationName, startDate, endDate } = req.body;
        let scheduleQuery = {};

        // 1. Basic Validation
        if (!careWorkerEmails || !Array.isArray(careWorkerEmails) || careWorkerEmails.length === 0) {
            return res.status(400).json({ msg: 'Please provide at least one careWorkerEmail.' });
        }
        if (!locationName || typeof locationName !== 'string') {
            return res.status(400).json({ msg: 'Please provide a valid locationName.' });
        }
        if (!startDate || !endDate) {
            return res.status(400).json({ msg: 'Please provide both startDate and endDate.' });
        }

        // 2. Process 'careWorkerEmails' to get IDs
        const lowercasedEmails = careWorkerEmails.map(email => email.toLowerCase());
        const workers = await User.find({ emailId: { $in: lowercasedEmails } }, '_id');
        const careWorkerIds = workers.map(worker => worker._id);

        if (careWorkerIds.length === 0) {
            return res.status(404).json({ msg: 'No care workers found for the provided emails.' });
        }
        scheduleQuery.careWorker = { $in: careWorkerIds };

        // 3. Process 'locationName' to get ID
        const locationDoc = await Location.findOne({ name: { $regex: new RegExp(`^${locationName}$`, 'i') } }, '_id');

        if (!locationDoc) {
            return res.status(404).json({ msg: `Location '${locationName}' not found.` });
        }
        scheduleQuery.location = locationDoc._id;

        // 4. Process dates for the query
        // Since schedule.date is a String 'YYYY-MM-DD', we need to query by string.
        // We'll extract the YYYY-MM-DD part from the incoming ISO strings.
        const parsedStartDateTime = parseISO(startDate); // Parse incoming ISO string
        const parsedEndDateTime = parseISO(endDate);   // Parse incoming ISO string

        if (isNaN(parsedStartDateTime.getTime()) || isNaN(parsedEndDateTime.getTime())) {
            return res.status(400).json({ msg: 'Invalid startDate or endDate format. Use ISO 8601 (e.g., "YYYY-MM-DDTHH:MM:SS.sssZ").' });
        }

        // Format the parsed Date objects back to 'YYYY-MM-DD' strings for the query
        const queryStartDateString = format(parsedStartDateTime, 'yyyy-MM-dd');
        const queryEndDateString = format(parsedEndDateTime, 'yyyy-MM-dd');

        scheduleQuery.date = {
            $gte: queryStartDateString,
            $lte: queryEndDateString
        };

        // 5. Log the constructed query for debugging
        console.log("Constructed scheduleQuery:", JSON.stringify(scheduleQuery, null, 2));

        // 6. Define the update operation
        // We want to set 'isPublished' to true
        const updateDoc = {
            $set: {
                isPublished: true
            }
        };

        // 7. Perform the update
        const updateResult = await Schedule.updateMany(scheduleQuery, updateDoc);

        // 8. Send the response
        if (updateResult.matchedCount > 0) {
            res.status(200).json({
                msg: `Successfully published ${updateResult.modifiedCount} schedules.`,
                matchedCount: updateResult.matchedCount,
                modifiedCount: updateResult.modifiedCount,
                queryUsed: scheduleQuery // Good for debugging
            });
        } else {
            res.status(404).json({
                msg: 'No matching schedules found to publish for the given criteria.',
                queryUsed: scheduleQuery
            });
        }

    } catch (err) {
        console.error('Error publishing schedule by careworker:', err);
        // Differentiate server errors from validation/not found errors
        if (err.name === 'CastError' && err.path === '_id') {
             res.status(400).json({ msg: 'Invalid ID format in query.', error: err.message });
        } else {
             res.status(500).json({ msg: 'Server error', error: err.message });
        }
    }
});

router.post('/create-schedule', auth, async (req, res) => {
    try {
        console.log("create-schedule (BATCH) is clicked");
        console.log("Received request body:", JSON.stringify(req.body, null, 2));
 
        const schedulesToCreate = req.body.scheduleIds; // Get the array of schedules
 
        // Basic check for valid input array
        if (!Array.isArray(schedulesToCreate) || schedulesToCreate.length === 0) {
            // If the input isn't an array, the frontend's .map won't be called anyway.
            // But if it expects an empty array in this case, we send it.
            // For a 400 error, typically a JSON object with error messages is sent.
            // If your frontend needs an empty array here to prevent crashes, adjust.
            // For now, let's assume it handles a 400 with a different error message display.
            return res.status(400).json({ msg: 'Request body must contain a non-empty array of schedules under "scheduleIds".' });
        }
 
        const createdSchedules = []; // To store successfully created schedules
        const errors = [];           // To store errors for individual schedules
 
        // Loop through each schedule object in the array
        for (const scheduleData of schedulesToCreate) {
            try {
                // Destructure relevant fields from the current scheduleData object
                const {
                    start,
                    end,
                    description,
                    careWorkers: receivedCareWorkerIds,
                    location,
                    date: dateISOString,
                    // breakDuration,
                    break: receivedBreakValue,
                    id: frontendTempId
                } = scheduleData;
 
                // --- 1. Basic Validation & Transformation for current scheduleData ---
 
                // Validate careWorkers array and get IDs
                if (!Array.isArray(receivedCareWorkerIds) || receivedCareWorkerIds.length === 0) {
                    throw new Error('At least one care worker ID is required for the schedule.');
                }
                const careWorkerIds = receivedCareWorkerIds;
 
                // Validate location name and get ObjectId
                const locationName = location ? location.trim() : null;
                if (!locationName) {
                    throw new Error('Location name is required.');
                }
                const locationDoc = await Location.findOne({ name: { $regex: new RegExp(`^${locationName}$`, 'i') } }, '_id');
                if (!locationDoc) {
                    throw new Error(`Location '${locationName}' not found.`);
                }
                const locationObjectId = locationDoc._id;
 
                // Validate and format date string
                let date = '';
                if (!dateISOString) {
    throw new Error('Date is required.');
}
                // Final check on date format
                if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISOString)) {
    throw new Error('Date must be in YYYY-MM-DD format.');
}
 
                // Validate time formats
                // if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(start) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(end)) {
                //     throw new Error('Start and end times must be in HH:MM format.');
                // }\
                   date = dateISOString;
 
                // Parse breakDuration
                const parsedBreakDuration = typeof receivedBreakValue === 'number' ? receivedBreakValue : 0;
 
if (parsedBreakDuration < 0) {
    throw new Error('Break duration cannot be negative.');
}
 
                // --- 2. Verify Care Worker IDs exist ---
                const careWorkerUsers = await User.find({ _id: { $in: careWorkerIds } }, '_id emailId firstName lastName avatar name');
                if (careWorkerUsers.length !== careWorkerIds.length) {
                    const foundIds = careWorkerUsers.map(u => u._id.toString());
                    const missingIds = careWorkerIds.filter(id => !foundIds.includes(id));
                    throw new Error(`Some care worker IDs not found: ${missingIds.join(', ')}.`);
                }
                const validCareWorkerObjectIds = careWorkerUsers.map(u => u._id);
 
                // --- 3. Overlap Check for EACH care worker in the current schedule ---
                const newScheduleStartDateTime = getDateTime(date, start);
                const newScheduleEndDateTime = getDateTime(date, end);
 
                if (isBefore(newScheduleEndDateTime, newScheduleStartDateTime)) {
                    throw new Error('End time cannot be before start time for the new schedule.');
                }
 
                for (const workerId of validCareWorkerObjectIds) {
                    const existingSchedulesForWorker = await Schedule.find({
                        careWorker: workerId,
                        date: date
                    });
 
                    for (const existingSchedule of existingSchedulesForWorker) {
                        const existingScheduleStartDateTime = getDateTime(existingSchedule.date, existingSchedule.start);
                        const existingScheduleEndDateTime = getDateTime(existingSchedule.date, existingSchedule.end);
 
                        const overlaps = areIntervalsOverlapping(
                            { start: newScheduleStartDateTime, end: newScheduleEndDateTime },
                            { start: existingScheduleStartDateTime, end: existingScheduleEndDateTime }
                        );
 
                        if (overlaps) {
                            const overlappingWorker = careWorkerUsers.find(u => u._id.toString() === workerId.toString());
                            const workerIdentifier = overlappingWorker ? (overlappingWorker.emailId || overlappingWorker.name || overlappingWorker._id) : workerId;
                            throw new Error(
                                `Care worker '${workerIdentifier}' is already assigned an overlapping schedule: ${existingSchedule.start} - ${existingSchedule.end} on ${existingSchedule.date}.`
                            );
                        }
                    }
                }
 
                // --- 4. Create new Schedule document ---
                const newSchedule = new Schedule({
                    // title: title || '',
                    start,
                    end,
                    description: description || '',
                    careWorker: validCareWorkerObjectIds,
                    location: locationObjectId,
                    date,
                    break: parsedBreakDuration,
                    isPublished: false,
                    createdBy: req.user.id
                });
 
                // --- 5. Save to database ---
                const savedSchedule = await newSchedule.save();
 
                // 6. Populate the saved schedule before adding to results for frontend
                const populatedSchedule = await Schedule.findById(savedSchedule._id)
                    .populate('careWorker', 'firstName lastName avatar name')
                    .populate('location', 'name workType');
 
                createdSchedules.push(populatedSchedule);
 
            } catch (innerErr) {
                errors.push({
                    frontendTempId: scheduleData.id || 'N/A',
                    message: innerErr.message,
                    originalData: scheduleData
                });
                console.error(`Error processing one schedule in batch (${scheduleData.id || 'N/A'}):`, innerErr.message, scheduleData);
            }
        }
 
        // --- THE KEY CHANGE HERE ---
        // If there are successfully created schedules, return just the array of them.
        // The frontend will then receive an array and can call .map() directly on it.
        if (createdSchedules.length > 0) {
            return res.status(201).json(createdSchedules); // Send only the array
        } else {
            // If all schedules failed, the frontend will likely get a 400.
            // If it still tries to .map() on data from a 400, it's a frontend issue.
            // We're returning an object here, as a 400 often contains an error message.
            return res.status(400).json({
                msg: 'No schedules were created. All failed validation or overlap checks.',
                errors: errors
            });
        }
 
    } catch (err) {
        console.error('Critical error during batch schedule creation (top-level):', err);
        if (err.name === 'ValidationError') {
            const validationErrors = Object.keys(err.errors).map(key => ({
                field: key,
                message: err.errors[key].message
            }));
            return res.status(400).json({ msg: 'Validation Error', errors: validationErrors });
        }
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

router.get('/my-assigned-shifts', auth, async (req, res) => {
    try {
        const loggedInUserId = req.user.id; // User ID from auth middleware

        // Find all schedules where the logged-in user's ID is in the careWorker array
        const assignedSchedules = await Schedule.find({
            careWorker: { $in: [loggedInUserId] }
        }).populate('location', 'name'); // Populate location name if you need it on frontend

        res.status(200).json(assignedSchedules);
    } catch (error) {
        console.error("Error fetching user's assigned schedules:", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

module.exports = router;