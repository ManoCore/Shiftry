// // routes/reportRoutes.js
// const express = require('express');
// const router = express.Router();
// const Schedule = require('../models/Schedule');
// const User = require('../models/user');
// const Location = require('../models/Location');
// const auth = require('../middleware/auth');

// // @route    GET api/reports/hours
// // @desc     Get hours worked report
// // @access   Private
// router.get('/hours', auth, async (req, res) => {
//   try {
//     const { startDate, endDate, careWorkerId, locationId } = req.query;

//     // Build query
//     const query = {};
//     if (startDate && endDate) {
//       query.date = {
//         $gte: new Date(startDate).toISOString().split('T')[0],
//         $lte: new Date(endDate).toISOString().split('T')[0]
//       };
//     }
//     if (careWorkerId) {
//       query.careWorker = careWorkerId;
//     }
//     if (locationId) {
//       query.location = locationId;
//     }

//     const schedules = await Schedule.find(query)
//       .populate('careWorker', 'name')
//       .populate('location', 'name workType');

//     // Calculate hours per care worker
//     const report = schedules.reduce((acc, schedule) => {
//       if (!schedule.careWorker || !schedule.careWorker._id) {
//         console.warn(`⚠️ Skipping schedule due to missing careWorker: ${schedule._id}`);
//         return acc;
//       }

//       if (!schedule.location || !schedule.location.name) {
//         console.warn(`⚠️ Skipping schedule due to missing location: ${schedule._id}`);
//         return acc;
//       }

//       const careWorkerId = schedule.careWorker._id.toString();
//       const careWorkerName = schedule.careWorker.name || 'Unknown';
//       const locationName = schedule.location.name || 'Unknown';

//       // Calculate hours
//       const start = new Date(`1970-01-01T${schedule.start}:00`);
//       const end = new Date(`1970-01-01T${schedule.end}:00`);
//       const hours = (end - start) / (1000 * 60 * 60);

//       // Initialize if not exists
//       if (!acc[careWorkerId]) {
//         acc[careWorkerId] = {
//           careWorkerId,
//           careWorkerName,
//           totalHours: 0,
//           byLocation: {}
//         };
//       }

//       // Update totals
//       acc[careWorkerId].totalHours += hours;

//       // Update by location
//       if (!acc[careWorkerId].byLocation[locationName]) {
//         acc[careWorkerId].byLocation[locationName] = 0;
//       }
//       acc[careWorkerId].byLocation[locationName] += hours;

//       return acc;
//     }, {});

//     res.json(Object.values(report));
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// });

// module.exports = router;
// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const User = require('../models/user'); // Corrected casing for User model import
const Location = require('../models/Location');
// const { protect, authorizeRoles } = require('../middleware/auth'); // Assuming auth.js exports protect and authorizeRoles
const asyncHandler = require('../middleware/asyncHandler'); // Import asyncHandler
const ErrorResponse = require('../utils/errorResponse'); // Import ErrorResponse
const auth = require('../middleware/auth');

/**
 * @route   GET api/reports/hours
 * @desc    Get hours worked report for the authenticated user's organization
 * @access  Private (Admin/Manager/Employee/CareWorker - adjust as needed)
 */
router.get('/hours', auth.protect, asyncHandler(async (req, res, next) => {
    const organizationId = req.organizationId;
    if (!organizationId) {
        return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
    }

    const { startDate, endDate, careWorkerId, locationId } = req.query;

    // Build query, always including the organization filter
    const query = { organization: organizationId }; // CRITICAL: Filter by organization

    if (startDate && endDate) {
        // Ensure date format is consistent with how it's stored in MongoDB (YYYY-MM-DD string)
        query.date = {
            $gte: startDate, // Assuming startDate is already in 'YYYY-MM-DD' format
            $lte: endDate    // Assuming endDate is already in 'YYYY-MM-DD' format
        };
    }
    if (careWorkerId) {
        // If careWorkerId is provided, ensure it's a valid ObjectId and part of the organization
        if (!mongoose.Types.ObjectId.isValid(careWorkerId)) {
            return next(new ErrorResponse('Invalid careWorkerId format.', 400));
        }
        // Since careWorker in Schedule is an array, use $in for matching
        query.careWorker = careWorkerId;
    }
    if (locationId) {
        // If locationId is provided, ensure it's a valid ObjectId and part of the organization
        if (!mongoose.Types.ObjectId.isValid(locationId)) {
            return next(new ErrorResponse('Invalid locationId format.', 400));
        }
        query.location = locationId;
    }

    // Fetch schedules, populating careWorker and location details
    const schedules = await Schedule.find(query)
        .populate('careWorker', 'firstName lastName name emailId') // Populate more fields for better reporting
        .populate('location', 'name workType');

    // Calculate hours per care worker
    const report = schedules.reduce((acc, schedule) => {
        // Handle schedules with potentially unassigned or missing care workers/locations
        if (!schedule.careWorker || schedule.careWorker.length === 0) {
            console.warn(`⚠️ Skipping schedule ${schedule._id} due to no careWorker assigned.`);
            return acc;
        }

        if (!schedule.location || !schedule.location._id) {
            console.warn(`⚠️ Skipping schedule ${schedule._id} due to missing location details.`);
            return acc;
        }

        const locationName = schedule.location.name || 'Unknown Location';

        // Calculate hours for the schedule
        const start = new Date(`1970-01-01T${schedule.start}:00`);
        const end = new Date(`1970-01-01T${schedule.end}:00`);
        const hours = (end - start) / (1000 * 60 * 60); // Difference in hours

        // Iterate over each care worker assigned to the schedule
        for (const careWorker of schedule.careWorker) {
            if (!careWorker || !careWorker._id) {
                console.warn(`⚠️ Skipping a careWorker in schedule ${schedule._id} due to missing _id.`);
                continue;
            }

            const careWorkerId = careWorker._id.toString();
            const careWorkerFullName = `${careWorker.firstName || ''} ${careWorker.lastName || ''}`.trim() || careWorker.name || 'Unknown Care Worker';

            // Initialize if not exists
            if (!acc[careWorkerId]) {
                acc[careWorkerId] = {
                    careWorkerId,
                    careWorkerName: careWorkerFullName,
                    totalHours: 0,
                    byLocation: {}
                };
            }

            // Update totals
            acc[careWorkerId].totalHours += hours;

            // Update by location
            if (!acc[careWorkerId].byLocation[locationName]) {
                acc[careWorkerId].byLocation[locationName] = 0;
            }
            acc[careWorkerId].byLocation[locationName] += hours;
        }

        return acc;
    }, {});

    res.json(Object.values(report));
}));

module.exports = router;
