// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const User = require('../models/user');
const Location = require('../models/Location');
const auth = require('../middleware/auth');

// @route    GET api/reports/hours
// @desc     Get hours worked report
// @access   Private
router.get('/hours', auth, async (req, res) => {
  try {
    const { startDate, endDate, careWorkerId, locationId } = req.query;

    // Build query
    const query = {};
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate).toISOString().split('T')[0],
        $lte: new Date(endDate).toISOString().split('T')[0]
      };
    }
    if (careWorkerId) {
      query.careWorker = careWorkerId;
    }
    if (locationId) {
      query.location = locationId;
    }

    const schedules = await Schedule.find(query)
      .populate('careWorker', 'name')
      .populate('location', 'name workType');

    // Calculate hours per care worker
    const report = schedules.reduce((acc, schedule) => {
      if (!schedule.careWorker || !schedule.careWorker._id) {
        console.warn(`⚠️ Skipping schedule due to missing careWorker: ${schedule._id}`);
        return acc;
      }

      if (!schedule.location || !schedule.location.name) {
        console.warn(`⚠️ Skipping schedule due to missing location: ${schedule._id}`);
        return acc;
      }

      const careWorkerId = schedule.careWorker._id.toString();
      const careWorkerName = schedule.careWorker.name || 'Unknown';
      const locationName = schedule.location.name || 'Unknown';

      // Calculate hours
      const start = new Date(`1970-01-01T${schedule.start}:00`);
      const end = new Date(`1970-01-01T${schedule.end}:00`);
      const hours = (end - start) / (1000 * 60 * 60);

      // Initialize if not exists
      if (!acc[careWorkerId]) {
        acc[careWorkerId] = {
          careWorkerId,
          careWorkerName,
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

      return acc;
    }, {});

    res.json(Object.values(report));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
