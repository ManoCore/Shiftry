// routes/scheduleRoutes.js
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { parseISO, format, isBefore, isAfter, areIntervalsOverlapping } = require('date-fns');
const nodemailer = require('nodemailer');
const auth = require('../middleware/auth');

const Schedule = require('../models/Schedule');
const Location = require('../models/Location');
const User = require("../models/user");
const Notification = require('../models/Notification');

// const { protect, authorizeRoles } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT, 10);
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const SHIFTRY_LOGO_URL = process.env.SHIFTRY_LOGO_URL || 'https://papaya-jalebi-91fef3.netlify.app/shiftrylogo.png';
const BASE_FRONTEND_URL = process.env.BASE_FRONTEND_URL || 'http://localhost:3000';

const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

const getDateTime = (dateStr, timeStr) => {
    return parseISO(`${dateStr}T${timeStr}:00`);
};

/**
 * @desc    Get schedules for a specific week for the authenticated user's organization
 * @route   GET /api/schedules/week/:startDate
 * @access  Private (requires protect middleware)
 */
router.get('/week/:startDate', auth.protect, asyncHandler(async (req, res, next) => {
    const { startDate } = req.params;
    const organizationId = req.organizationId;

    if (!organizationId) {
        return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(startDateObj.getDate() + 6);

    const schedules = await Schedule.find({
        organization: organizationId,
        date: {
            $gte: startDateObj.toISOString().split('T')[0],
            $lte: endDateObj.toISOString().split('T')[0]
        }
    })
    .populate('careWorker', 'firstName lastName emailId avatar name')
    .populate('location', 'name workType');

    res.status(200).json({ success: true, count: schedules.length, data: schedules });
}));


/**
 * @desc    Create multiple schedules in a batch for the authenticated user's organization
 * @route   POST /api/schedules/create-schedule
 * @access  Private (Admin/Manager)
 *
 * This route expects an array of schedule objects in req.body.scheduleIds.
 * Each schedule object should contain:
 * {
 * start: "HH:MM",
 * end: "HH:MM",
 * description?: string,
 * careWorkers?: string[], // Array of User _id strings (optional for open shifts)
 * location: string, // Location name (e.g., "India")
 * date: "YYYY-MM-DD",
 * break?: string | number, // e.g., "30 mins", "0 mins", or 30
 * isPublished?: boolean,
 * ratePerHour?: number,
 * status?: string, // e.g., 'pending', 'open'
 * notes?: string,
 * id: string // Temporary frontend ID for error mapping
 * }
 */
router.post('/create-schedule', // This is the correct path for batch creation
    auth.protect,
    auth.authorizeRoles('admin', 'manager'),
    asyncHandler(async (req, res, next) => {
        console.log("create-schedule (BATCH) is clicked");
        console.log("Received request body:", JSON.stringify(req.body, null, 2));

        const organizationId = req.organizationId;
        if (!organizationId) {
            return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
        }

        const schedulesToCreate = req.body.scheduleIds;

        if (!Array.isArray(schedulesToCreate) || schedulesToCreate.length === 0) {
            return next(new ErrorResponse('Request body must contain a non-empty array of schedules under "scheduleIds".', 400));
        }

        const createdSchedules = [];
        const errors = [];

        for (const scheduleData of schedulesToCreate) {
            // Define frontendTempId at the start of the loop's try block
            let frontendTempId = scheduleData.id; // Directly assign, or use destructuring below

            try {
                const {
                    start,
                    end,
                    description,
                    careWorkers: receivedCareWorkerIds,
                    location,
                    date: dateISOString,
                    break: receivedBreakValue,
                    ratePerHour,
                    status,
                    notes
                } = scheduleData;

                const careWorkerIds = Array.isArray(receivedCareWorkerIds)
                    ? receivedCareWorkerIds.map(id => id.trim()).filter(Boolean)
                    : (receivedCareWorkerIds ? [receivedCareWorkerIds.trim()] : []).filter(Boolean);

                const locationName = location ? location.trim() : null;
                if (!locationName) {
                    throw new Error('Location name is required.');
                }
                const locationDoc = await Location.findOne({ name: { $regex: new RegExp(`^${locationName}$`, 'i') }, organization: organizationId }, '_id');
                if (!locationDoc) {
                    throw new Error(`Location '${locationName}' not found or does not belong to your organization.`);
                }
                const locationObjectId = locationDoc._id;

                if (!dateISOString) {
                    throw new Error('Date is required.');
                }
                if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISOString)) {
                    throw new Error('Date must be inYYYY-MM-DD format.');
                }
                const date = dateISOString;

                const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
                if (!timeRegex.test(start) || !timeRegex.test(end)) {
                    throw new Error('Start and end times must be in HH:MM format.');
                }

                let parsedBreakDuration = 0;
                if (typeof receivedBreakValue === 'string' && receivedBreakValue.endsWith(' mins')) {
                    parsedBreakDuration = parseInt(receivedBreakValue.replace(' mins', ''), 10);
                } else if (typeof receivedBreakValue === 'number') {
                    parsedBreakDuration = receivedBreakValue;
                }
                if (parsedBreakDuration < 0) {
                    throw new Error('Break duration cannot be negative.');
                }
                console.log(`Debug: Parsed break duration for ${frontendTempId}: ${receivedBreakValue} -> ${parsedBreakDuration}`);

                let careWorkerUsers = [];
                if (careWorkerIds.length > 0) {
                    // Fetch all care worker users with their emailId for notifications
                    careWorkerUsers = await User.find({ _id: { $in: careWorkerIds }, organization: organizationId }, '_id emailId firstName lastName avatar name');
                    if (careWorkerUsers.length !== careWorkerIds.length) {
                        const foundIds = careWorkerUsers.map(u => u._id.toString());
                        const missingIds = careWorkerIds.filter(id => !foundIds.includes(id));
                        throw new Error(`Some care worker IDs not found or do not belong to your organization: ${missingIds.join(', ')}.`);
                    }
                }

                const newScheduleStartDateTime = getDateTime(date, start);
                const newScheduleEndDateTime = getDateTime(date, end);

                if (isBefore(newScheduleEndDateTime, newScheduleStartDateTime)) {
                    throw new Error('End time cannot be before start time for the new schedule.');
                }

                for (const worker of careWorkerUsers) { // Loop through all selected workers for overlap check
                    const existingSchedulesForWorker = await Schedule.find({
                        careWorker: worker._id, // Check for this specific worker's schedules
                        date: date,
                        organization: organizationId
                    });

                    for (const existingSchedule of existingSchedulesForWorker) {
                        const existingScheduleStartDateTime = getDateTime(existingSchedule.date, existingSchedule.start);
                        const existingScheduleEndDateTime = getDateTime(existingSchedule.date, existingSchedule.end);

                        const overlaps = areIntervalsOverlapping(
                            { start: newScheduleStartDateTime, end: newScheduleEndDateTime },
                            { start: existingScheduleStartDateTime, end: existingScheduleEndDateTime }
                        );

                        if (overlaps) {
                            const workerIdentifier = worker ? (worker.emailId || worker.name || worker._id) : worker._id;
                            throw new Error(
                                `Care worker '${workerIdentifier}' is already assigned an overlapping schedule: ${existingSchedule.start} - ${existingSchedule.end} on ${existingSchedule.date}.`
                            );
                        }
                    }
                }

                const newSchedule = new Schedule({
                    organization: organizationId,
                    start,
                    end,
                    description: description || '',
                    careWorker: careWorkerUsers.map(u => u._id), // Store array of ObjectIds
                    location: locationObjectId,
                    date,
                    break: parsedBreakDuration, // Ensure your Schedule Mongoose schema defines 'break' as a Number type
                    isPublished: scheduleData.isPublished !== undefined ? scheduleData.isPublished : false,
                    ratePerHour: ratePerHour || 0,
                    status: status || (careWorkerUsers.length > 0 ? 'pending' : 'open'), // Set status based on careWorker assignment
                    notes: notes || '',
                    createdBy: req.user.id
                });

                let savedSchedule = await newSchedule.save();

                // Populate careWorker details including emailId for response and notifications
                savedSchedule = await Schedule.findById(savedSchedule._id)
                    .populate('careWorker', 'firstName lastName avatar name emailId')
                    .populate('location', 'name workType');

                createdSchedules.push(savedSchedule);

                if (savedSchedule.isPublished) {
                    for (const assignedWorker of savedSchedule.careWorker) {
                        if (assignedWorker && assignedWorker.emailId && assignedWorker.emailId.trim() !== '') {
                            const mailOptions = {
                                from: EMAIL_USER,
                                to: assignedWorker.emailId,
                                subject: 'Your Schedule Has Been Published!',
                                html: `
                                    <!DOCTYPE html>
                                    <html lang="en">
                                    <head>
                                        <meta charset="UTF-8">
                                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                        <title>Your Schedule Has Been Published!</title>
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
                                                color: #007bff;
                                                position: absolute;
                                                left: 0;
                                            }
                                            strong {
                                                color: #0056b3;
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
                                                                <img src="${SHIFTRY_LOGO_URL}" alt="Shiftry Logo" width="150" height="auto">
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td class="content-section" style="padding: 20px;">
                                                                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 10px;">Dear ${assignedWorker.firstName || 'Care Worker'},</p>
                                                                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 10px;">Your schedule for <strong style="color: #0056b3;">${format(parseISO(date), 'PPP')}</strong> has been published:</p>
                                                                <ul style="list-style-type: none; padding: 0; margin: 0;">
                                                                    <li style="margin-bottom: 10px; padding-left: 20px; position: relative;"><span style="position: absolute; left: 0; color: #007bff;">•</span> <strong style="color: #0056b3;">Location:</strong> ${locationDoc ? locationDoc.name : 'N/A'}</li>
                                                                    <li style="margin-bottom: 10px; padding-left: 20px; position: relative;"><span style="position: absolute; left: 0; color: #007bff;">•</span> <strong style="color: #0056b3;">Time:</strong> ${start} - ${end}</li>
                                                                    <li style="margin-bottom: 10px; padding-left: 20px; position: relative;"><span style="position: absolute; left: 0; color: #007bff;">•</span> <strong style="color: #0056b3;">Description:</strong> ${description || 'No description provided.'}</li>
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

                            transporter.sendMail(mailOptions, (error, info) => {
                                if (error) {
                                    console.error(`Error sending email to ${assignedWorker.emailId} for schedule ${newSchedule._id}:`, error);
                                } else {
                                    console.log(`Email sent to ${assignedWorker.emailId} for schedule ${newSchedule._id}:`, info.response);
                                }
                            });

                            const notificationMessage = `Your schedule for ${format(parseISO(date), 'PPP')} at ${locationDoc ? locationDoc.name : 'N/A'} from ${start} to ${end} has been published.`;
                            const newNotification = new Notification({
                                recipient: assignedWorker._id,
                                message: notificationMessage,
                                schedule: newSchedule._id,
                                type: 'schedule_published',
                                relatedDocument: newSchedule._id,
                                relatedModel: 'Schedule',
                                isRead: false,
                                organization: organizationId,
                            });
                            await newNotification.save();
                        } else {
                            console.warn(`Care worker ${assignedWorker ? assignedWorker._id : 'N/A'} assigned to schedule ${newSchedule._id} has missing or empty email. Email/Notification not sent.`);
                        }
                    }
                } else {
                    console.warn(`Schedule ${newSchedule._id} not published. Email/Notification not sent.`);
                }

            } catch (innerErr) {
                console.error(`Error processing one schedule in batch (${frontendTempId || 'N/A'}):`, innerErr.message, scheduleData);
                console.log(`DEBUG: frontendTempId before error push: ${frontendTempId}`);
                errors.push({ frontendTempId: frontendTempId || 'N/A', message: innerErr.message, originalData: scheduleData });
            }
        }

        if (createdSchedules.length > 0) {
            res.status(201).json({
                success: true,
                message: "Schedules processed. Some may have failed.",
                createdCount: createdSchedules.length,
                data: createdSchedules,
                errors: errors
            });
        } else {
            return next(new ErrorResponse("No schedules were created. All failed validation or overlap checks.", 400, { errors: errors }));
        }
    })
);

router.post(
    '/',
    auth.protect,
    auth.authorizeRoles('admin', 'manager'),
    [
        check('start', 'Start time is required').not().isEmpty(),
        check('end', 'End time is required').not().isEmpty(),
        check('date', 'Date is required').not().isEmpty().isISO8601().withMessage('Date must be in YYYY-MM-DD format'),
        // CHANGE 1: Validate 'location' as a valid MongoDB ObjectId
        check('location', 'Location ID is required and must be a valid MongoDB ID')
            .not().isEmpty()
            .isMongoId(), // Add isMongoId validator
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

        const {
            start,
            end,
            description,
            careWorker: receivedCareWorkerId,
            location: receivedLocationId, // CHANGE 2: Destructure as receivedLocationId (expecting an ID)
            date: dateISOString,
            break: receivedBreakValue,
            isPublished,
            ratePerHour,
            status,
            notes
        } = req.body;

        // --- Basic Time Format Validation ---
        const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(start) || !timeRegex.test(end)) {
            return next(new ErrorResponse('Invalid time format. Use HH:MM.', 400));
        }

        // --- Validate End Time is After Start Time ---
        const newScheduleStartDateTime = getDateTime(dateISOString, start);
        const newScheduleEndDateTime = getDateTime(dateISOString, end);

        if (isBefore(newScheduleEndDateTime, newScheduleStartDateTime)) {
            return next(new ErrorResponse('End time must be after start time.', 400));
        }

        // --- Parse Break Duration ---
        let parsedBreakDuration = 0;
        if (typeof receivedBreakValue === 'string' && receivedBreakValue.endsWith(' mins')) {
            parsedBreakDuration = parseInt(receivedBreakValue.replace(' mins', ''), 10);
        } else if (typeof receivedBreakValue === 'number') {
            parsedBreakDuration = receivedBreakValue;
        }
        if (parsedBreakDuration < 0) {
            return next(new ErrorResponse('Break duration cannot be negative.', 400));
        }

        // --- Validate Location by ID and Scope to Organization ---
        // CHANGE 3: Query by _id instead of name
        const locationDoc = await Location.findOne({
            _id: receivedLocationId, // Use the ID directly
            organization: organizationId // CRITICAL: Filter by organization
        }, '_id name'); // Fetch ID and name for potential use in response/error

        if (!locationDoc) {
            // Updated error message to reflect that an ID was expected
            return next(new ErrorResponse(`Location with ID '${receivedLocationId}' not found or does not belong to your organization.`, 400));
        }
        const locationObjectId = locationDoc._id; // Get the ObjectId from the found document

        // --- Validate Care Worker and Scope to Organization (if provided) ---
        let careWorkerObjectId = null;
        if (receivedCareWorkerId) {
            // Optional: Add isMongoId validation for careWorkerId if it's coming from frontend
            if (!mongoose.Types.ObjectId.isValid(receivedCareWorkerId)) {
                 return next(new ErrorResponse('Provided care worker ID is not a valid MongoDB ID.', 400));
            }

            const careWorkerUser = await User.findOne({
                _id: receivedCareWorkerId,
                organization: organizationId
            }, '_id emailId firstName lastName avatar name');

            if (!careWorkerUser) {
                return next(new ErrorResponse('Assigned care worker not found or does not belong to your organization.', 400));
            }
            careWorkerObjectId = careWorkerUser._id;

            // --- Overlap Check for Assigned Care Worker ---
            const existingSchedulesForWorker = await Schedule.find({
                careWorker: careWorkerObjectId,
                date: dateISOString,
                organization: organizationId
            });

            for (const existingSchedule of existingSchedulesForWorker) {
                const existingScheduleStartDateTime = getDateTime(existingSchedule.date, existingSchedule.start);
                const existingScheduleEndDateTime = getDateTime(existingSchedule.date, existingSchedule.end);

                const overlaps = areIntervalsOverlapping(
                    { start: newScheduleStartDateTime, end: newScheduleEndDateTime },
                    { start: existingScheduleStartDateTime, end: existingScheduleEndDateTime }
                );

                if (overlaps) {
                    const workerIdentifier = careWorkerUser ? (careWorkerUser.emailId || careWorkerUser.name || careWorkerUser._id) : receivedCareWorkerId;
                    return next(new ErrorResponse(
                        `Care worker '${workerIdentifier}' is already assigned an overlapping schedule: ${existingSchedule.start} - ${existingSchedule.end} on ${existingSchedule.date}.`,
                        400
                    ));
                }
            }
        }

        // --- Create New Schedule Document ---
        const newSchedule = new Schedule({
            organization: organizationId,
            start,
            end,
            description: description || '',
            careWorker: careWorkerObjectId,
            location: locationObjectId, // Use the validated ObjectId here
            date: dateISOString,
            break: parsedBreakDuration,
            isPublished: isPublished !== undefined ? isPublished : false,
            ratePerHour: ratePerHour || 0,
            status: status || (careWorkerObjectId ? 'pending' : 'open'),
            notes: notes || '',
            createdBy: req.user.id
        });

        let savedSchedule = await newSchedule.save();

        // Populate careWorker and location details for the response
        savedSchedule = await Schedule.findById(savedSchedule._id)
            .populate('careWorker', 'firstName lastName emailId avatar name')
            .populate('location', 'name workType');

        // --- Send Success Response ---
        res.status(201).json({
            success: true,
            data: savedSchedule
        });
    })
);



/**
 * @desc    Get schedules within a date range for the authenticated user's organization
 * @route   GET /api/schedules/range
 * @access  Private (requires protect middleware)
 * @query   startDate (YYYY-MM-DD), endDate (YYYY-MM-DD)
 * IMPORTANT: This route must be defined BEFORE any generic /:id routes
 */
router.get('/range', auth.protect, asyncHandler(async (req, res, next) => {
    let { startDate, endDate } = req.query;
    const organizationId = req.organizationId;

    if (!organizationId) {
        return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
    }

    if (!startDate || !endDate) {
        return next(new ErrorResponse('startDate and endDate query parameters are required', 400));
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime()) || endDateObj < startDateObj) {
        return next(new ErrorResponse('Invalid startDate or endDate provided', 400));
    }

    const queryStartDate = startDateObj.toISOString().split('T')[0];
    const queryEndDate = endDateObj.toISOString().split('T')[0];

    const schedules = await Schedule.find({
        organization: organizationId,
        date: {
            $gte: queryStartDate,
            $lte: queryEndDate
        }
    })
    .populate('careWorker', 'firstName lastName emailId avatar name status')
    .populate('location', 'name workType address');

    res.status(200).json({ success: true, count: schedules.length, data: schedules });
}));


/**
 * @desc    Publish multiple schedules (set isPublished to true) for the authenticated user's organization
 * @route   POST /api/schedules/publish
 * @access  Private (Admin/Manager)
 */
router.post('/publish', auth.protect, auth.authorizeRoles('admin', 'manager'), asyncHandler(async (req, res, next) => {
    const organizationId = req.organizationId;
    const EMAIL_USER = process.env.EMAIL_USER;
    const SHIFTRY_LOGO_URL = process.env.SHIFTRY_LOGO_URL || '';

    if (!organizationId) {
        return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
    }

    const { scheduleIds } = req.body;

    if (!Array.isArray(scheduleIds) || scheduleIds.length === 0) {
        return next(new ErrorResponse('scheduleIds must be a non-empty array', 400));
    }

    const updateResult = await Schedule.updateMany(
        { _id: { $in: scheduleIds }, organization: organizationId },
        { $set: { isPublished: true } }
    );

    const updatedSchedules = await Schedule.find({ _id: { $in: scheduleIds }, organization: organizationId })
        .populate('careWorker', 'firstName lastName emailId name') // Added emailId here
        .populate('location', 'name');

    const emailPromises = [];
    const notificationPromises = [];

    for (const schedule of updatedSchedules) {
        if (schedule.isPublished) { // Only send if published
            for (const careWorker of schedule.careWorker) { // Loop through all assigned care workers
                if (careWorker && careWorker.emailId && careWorker.emailId.trim() !== '') {
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
                                                            <img src="${SHIFTRY_LOGO_URL}" alt="Shiftry Logo" class="logo" width="150" height="auto" style="max-width: 150px; height: auto; display: block; margin: 0 auto;">
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

                    const notificationMessage = `Your schedule for ${format(parseISO(schedule.date), 'PPP')} at ${schedule.location ? schedule.location.name : 'N/A'} from ${schedule.start} to ${schedule.end} has been published.`;
                    const newNotification = new Notification({
                        recipient: careWorker._id,
                        message: notificationMessage,
                        schedule: schedule._id,
                        type: 'schedule_published',
                        relatedDocument: schedule._id,
                        relatedModel: 'Schedule',
                        isRead: false,
                        organization: organizationId,
                    });
                    notificationPromises.push(newNotification.save());

                } else {
                    console.warn(`Care worker ${careWorker ? careWorker._id : 'N/A'} assigned to schedule ${schedule._id} has missing or empty email. Email/Notification not sent.`);
                }
            }
        } else {
            console.warn(`Schedule ${schedule._id} not published. Email/Notification not sent.`);
        }
    }

    await Promise.allSettled([...emailPromises, ...notificationPromises]);

    res.status(200).json({ success: true, count: updatedSchedules.length, data: updatedSchedules });
}));

/**
 * @desc    Get schedules assigned to the authenticated care worker for their organization
 * @route   GET /api/schedules/my-assigned-shifts
 * @access  Private (Care Worker)
 */
router.get('/my-assigned-shifts', auth.protect, asyncHandler(async (req, res, next) => {
    const loggedInUserId = req.user.id;
    const organizationId = req.organizationId;

    if (!organizationId) {
        return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
    }

    const assignedSchedules = await Schedule.find({
        careWorker: loggedInUserId,
        organization: organizationId
    })
    .populate('location', 'name workType address')
    .populate('careWorker', 'firstName lastName emailId name avatar');

    res.status(200).json({ success: true, count: assignedSchedules.length, data: assignedSchedules });
}));

/**
 * @desc    Get a single schedule by ID for the authenticated user's organization
 * @route   GET /api/schedules/:id
 * @access  Private
 * IMPORTANT: This route must be defined AFTER all other specific GET routes (like /range, /week/:startDate)
 */
router.get('/:id', auth.protect, asyncHandler(async (req, res, next) => {
    const scheduleId = req.params.id;
    const organizationId = req.organizationId;

    if (!organizationId) {
        return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
    }

    const schedule = await Schedule.findOne({ _id: scheduleId, organization: organizationId })
        .populate('careWorker', 'firstName lastName emailId name')
        .populate('location', 'name workType');

    if (!schedule) {
        return next(new ErrorResponse('Schedule not found in your organization.', 404));
    }

    res.status(200).json({ success: true, data: schedule });
}));

/**
 * @desc    Update a schedule by ID for the authenticated user's organization
 * @route   PUT /api/schedules/:id
 * @access  Private (Admin/Manager)
 */
router.put('/:id', auth.protect, auth.authorizeRoles('admin', 'manager'), asyncHandler(async (req, res, next) => {
    const scheduleId = req.params.id;
    const organizationId = req.organizationId;

    if (!organizationId) {
        return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
    }

    const {
        start, end, description, careWorker, location, date,
        break: receivedBreakValue, isPublished, ratePerHour, status, notes
    } = req.body;

    const updateFields = {};
    if (start !== undefined) updateFields.start = start;
    if (end !== undefined) updateFields.end = end;
    if (description !== undefined) updateFields.description = description;

    if (careWorker !== undefined) {
        if (careWorker === null || (Array.isArray(careWorker) && careWorker.length === 0)) {
            updateFields.careWorker = []; // Set to empty array if null or empty array is sent
        } else {
            // Ensure careWorker is an array, convert single ID to array if necessary
            const careWorkerIdsToSet = Array.isArray(careWorker) ? careWorker.map(id => id.trim()).filter(Boolean) : [careWorker.trim()].filter(Boolean);
            
            // Validate that all provided careWorkerIds belong to the current organization
            const assignedCareWorkers = await User.find({ _id: { $in: careWorkerIdsToSet }, organization: organizationId });
            if (assignedCareWorkers.length !== careWorkerIdsToSet.length) {
                const foundIds = assignedCareWorkers.map(u => u._id.toString());
                const missingIds = careWorkerIdsToSet.filter(id => !foundIds.includes(id));
                return next(new ErrorResponse(`One or more assigned care workers not found or do not belong to your organization: ${missingIds.join(', ')}.`, 404));
            }
            updateFields.careWorker = assignedCareWorkers.map(u => u._id);
        }
    }

    if (location !== undefined) {
        const trimmedLocationId = location.trim();
        const existingLocation = await Location.findOne({ _id: trimmedLocationId, organization: organizationId });
        if (!existingLocation) {
            return next(new ErrorResponse('Location not found or does not belong to your organization.', 404));
        }
        updateFields.location = existingLocation._id;
    }

    if (date !== undefined) updateFields.date = date;

    if (receivedBreakValue !== undefined) {
        let parsedBreakDuration = 0;
        if (typeof receivedBreakValue === 'string' && receivedBreakValue.endsWith(' mins')) {
            parsedBreakDuration = parseInt(receivedBreakValue.replace(' mins', ''), 10);
        } else if (typeof receivedBreakValue === 'number') {
            parsedBreakDuration = receivedBreakValue;
        }
        if (parsedBreakDuration < 0) {
            return next(new ErrorResponse('Break duration cannot be negative.', 400));
        }
        updateFields.break = parsedBreakDuration;
    }

    if (isPublished !== undefined) updateFields.isPublished = isPublished;
    if (ratePerHour !== undefined) updateFields.ratePerHour = ratePerHour;
    if (status !== undefined) updateFields.status = status;
    if (notes !== undefined) updateFields.notes = notes;

    updateFields.updatedAt = Date.now();

    const updatedSchedule = await Schedule.findOneAndUpdate(
        { _id: scheduleId, organization: organizationId },
        { $set: updateFields },
        { new: true, runValidators: true }
    )
    .populate('careWorker', 'firstName lastName emailId name') // Added emailId here
    .populate('location', 'name workType');

    if (!updatedSchedule) {
        return next(new ErrorResponse('Schedule not found in your organization.', 404));
    }

    // After updating, if isPublished is true, send emails to all assigned care workers
    if (updatedSchedule.isPublished) {
        for (const careWorker of updatedSchedule.careWorker) {
            if (careWorker && careWorker.emailId && careWorker.emailId.trim() !== '') {
                const mailOptions = {
                    from: EMAIL_USER,
                    to: careWorker.emailId,
                    subject: 'Your Schedule Has Been Updated!',
                    html: `
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Your Schedule Has Been Updated!</title>
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
                                    color: #007bff;
                                    position: absolute;
                                    left: 0;
                                }
                                strong {
                                    color: #0056b3;
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
                                                    <img src="${SHIFTRY_LOGO_URL}" alt="Shiftry Logo" width="150" height="auto">
                                                </td>
                                            </tr>
                                            <tr>
                                                <td class="content-section" style="padding: 20px;">
                                                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 10px;">Dear ${careWorker.firstName || 'Care Worker'},</p>
                                                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 10px;">Your schedule for <strong style="color: #0056b3;">${format(parseISO(updatedSchedule.date), 'PPP')}</strong> has been updated:</p>
                                                    <ul style="list-style-type: none; padding: 0; margin: 0;">
                                                        <li style="margin-bottom: 10px; padding-left: 20px; position: relative;"><span style="position: absolute; left: 0; color: #007bff;">•</span> <strong style="color: #0056b3;">Location:</strong> ${updatedSchedule.location ? updatedSchedule.location.name : 'N/A'}</li>
                                                        <li style="margin-bottom: 10px; padding-left: 20px; position: relative;"><span style="position: absolute; left: 0; color: #007bff;">•</span> <strong style="color: #0056b3;">Time:</strong> ${updatedSchedule.start} - ${updatedSchedule.end}</li>
                                                        <li style="margin-bottom: 10px; padding-left: 20px; position: relative;"><span style="position: absolute; left: 0; color: #007bff;">•</span> <strong style="color: #0056b3;">Description:</strong> ${updatedSchedule.description || 'No description provided.'}</li>
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

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error(`Error sending update email to ${careWorker.emailId} for schedule ${updatedSchedule._id}:`, error);
                    } else {
                        console.log(`Update email sent to ${careWorker.emailId} for schedule ${updatedSchedule._id}:`, info.response);
                    }
                });

                const notificationMessage = `Your schedule for ${format(parseISO(updatedSchedule.date), 'PPP')} at ${updatedSchedule.location ? updatedSchedule.location.name : 'N/A'} from ${updatedSchedule.start} to ${updatedSchedule.end} has been updated.`;
                const newNotification = new Notification({
                    recipient: careWorker._id,
                    message: notificationMessage,
                    schedule: updatedSchedule._id,
                    type: 'schedule_updated',
                    relatedDocument: updatedSchedule._id,
                    relatedModel: 'Schedule',
                    isRead: false,
                    organization: organizationId,
                });
                await newNotification.save();
            } else {
                console.warn(`Care worker ${careWorker ? careWorker._id : 'N/A'} assigned to updated schedule ${updatedSchedule._id} has missing or empty email. Email/Notification not sent.`);
            }
        }
    } else {
        console.warn(`Updated schedule ${updatedSchedule._id} not published. Email/Notification not sent.`);
    }

    res.status(200).json(updatedSchedule);
}));

/**
 * @desc    Delete a schedule by ID for the authenticated user's organization
 * @route   DELETE /api/schedules/:id
 * @access  Private (Admin/Manager)
 */
router.delete('/:id', auth.protect, auth.authorizeRoles('admin', 'manager'), asyncHandler(async (req, res, next) => {
    const scheduleId = req.params.id;
    const organizationId = req.organizationId;

    if (!organizationId) {
        return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
    }

    const schedule = await Schedule.findOne({ _id: scheduleId, organization: organizationId })
        .populate('careWorker', 'firstName lastName emailId name') // Added emailId here
        .populate('location', 'name');

    if (!schedule) {
        return next(new ErrorResponse('Schedule not found in your organization.', 404));
    }

    await Schedule.deleteOne({ _id: scheduleId, organization: organizationId });

    // Send deletion emails to all assigned care workers if they exist and have an email
    if (schedule.careWorker && schedule.careWorker.length > 0) {
        for (const careWorker of schedule.careWorker) {
            if (careWorker && careWorker.emailId && careWorker.emailId.trim() !== '') {
                const mailOptions = {
                    from: EMAIL_USER,
                    to: careWorker.emailId,
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
                                    color: #dc3545;
                                    position: absolute;
                                    left: 0;
                                }
                                strong {
                                    color: #dc3545;
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
                                                    <img src="${SHIFTRY_LOGO_URL}" alt="Shiftry Logo" width="150" height="auto">
                                                </td>
                                            </tr>
                                            <tr>
                                                <td class="content-section" style="padding: 20px;">
                                                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 10px;">Dear ${careWorker.firstName || 'Care Worker'},</p>
                                                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 10px;">Please be informed that your shift on <strong style="color: #dc3545;">${format(parseISO(schedule.date), 'PPP')}</strong> has been removed/canceled:</p>
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

                const notificationMessage = `Your shift at ${schedule.location ? schedule.location.name : 'N/A'} on ${format(parseISO(schedule.date), 'PPP')} from ${schedule.start} to ${schedule.end} has been removed/canceled.`;
                const newNotification = new Notification({
                    recipient: careWorker._id,
                    message: notificationMessage,
                    schedule: schedule._id,
                    type: 'schedule_removed',
                    relatedDocument: schedule._id,
                    relatedModel: 'Schedule',
                    isRead: false,
                    organization: organizationId,
                });
                await newNotification.save();

            } else {
                console.warn(`Care worker ${careWorker ? careWorker._id : 'N/A'} assigned to deleted schedule ${schedule._id} has missing or empty email. Deletion email/notification not sent.`);
            }
        }
    } else {
        console.warn(`No care workers found for deleted schedule ID: ${schedule._id}. Deletion email/notification not sent.`);
    }

    res.status(200).json({ success: true, message: 'Schedule removed successfully.' });
}));


module.exports = router;

