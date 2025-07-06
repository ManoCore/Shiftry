// File: controllers/scheduleController.js (from the provided zip)
const asyncHandler = require('express-async-handler');
const Schedule = require('../models/Schedule');

// @desc    Get all schedules
// @route   GET /api/schedules
// @access  Private
const getSchedules = asyncHandler(async (req, res) => {
  const schedules = await Schedule.find({ createdBy: req.user._id });
  res.status(200).json(schedules);
});

// @desc    Create a new schedule
// @route   POST /api/schedules
// @access  Private
const createSchedule = asyncHandler(async (req, res) => {
  const { title, start, end, description, careWorker, location, date } = req.body;

  if (!title || !start || !end || !location || !date) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Validate time
  if (start >= end) {
    res.status(400);
    throw new Error('End time must be after start time');
  }

  const schedule = await Schedule.create({
    title,
    start,
    end,
    description: description || '',
    careWorker: careWorker || '',
    location,
    date,
    createdBy: req.user._id,
  });

  res.status(201).json(schedule);
});

// @desc    Update a schedule
// @route   PUT /api/schedules/:id
// @access  Private
const updateSchedule = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id);

  if (!schedule) {
    res.status(404);
    throw new Error('Schedule not found');
  }

  if (schedule.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this schedule');
  }

  const { title, start, end, description, careWorker, location, date } = req.body;

  if (!title || !start || !end || !location || !date) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Validate time
  if (start >= end) {
    res.status(400);
    throw new Error('End time must be after start time');
  }

  const updatedSchedule = await Schedule.findByIdAndUpdate(
    req.params.id,
    { title, start, end, description, careWorker, location, date },
    { new: true }
  );

  res.status(200).json(updatedSchedule);
});

// @desc    Delete a schedule
// @route   DELETE /api/schedules/:id
// @access  Private
const deleteSchedule = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id);

  if (!schedule) {
    res.status(404);
    throw new Error('Schedule not found');
  }

  if (schedule.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this schedule');
  }

  await schedule.remove();
  res.status(200).json({ message: 'Schedule deleted' });
});

module.exports = {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};