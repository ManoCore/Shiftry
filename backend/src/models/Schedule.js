const mongoose = require('mongoose');
const User=require('../models/user');
const Location = require('../models/Location');

const scheduleSchema = new mongoose.Schema({
  
  start: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be in HH:MM format'],
  },
  end: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'End time must be in HH:MM format'],
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  careWorker: [{ // <--- Changed to an array of ObjectIds
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true // If at least one care worker is required
    }],
  location: {
    type: mongoose.Schema.Types.ObjectId, // <-- Change this to ObjectId if you populate it as an object
    ref: 'Location', // <-- Assumes you have a 'Location' model
    required: [true, 'Location is required'],
  },
  date: {
    type: String,
    required: [true, 'Date is required'],
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
  },
  break: {
    type: Number, // Store break duration as a number (e.g., in minutes)
    default: 0,   // Default to 0 minutes if not provided
    min: [0, 'Break duration cannot be negative'], // Validator for Number type
    // max: [60, 'Break duration cannot exceed 60 minutes'], // Example: Uncomment if you need a max
  },
  isPublished: {
  type: Boolean,
  default: false
},
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Schedule', scheduleSchema);