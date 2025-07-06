// backend/src/models/LeaveApplication.js

const mongoose = require('mongoose');

const leaveApplicationSchema = new mongoose.Schema({
  // Reference to the User who is applying for leave
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This should match the name of your User model
    required: true,
  },
  leaveReason: {
    type: String,
    required: true,
    enum: ['Sick Leave', 'Casual Leave', 'Annual Leave', 'Maternity Leave', 'Paternity Leave', 'Unpaid Leave', 'Other'], // Add 'Other' if applicable
  },
  fromDate: {
    type: Date,
    required: true,
  },
  toDate: {
    type: Date,
    required: true,
  },
  leaveType: { // Full Day, Half Day (Morning), Half Day (Afternoon)
    type: String,
    required: true,
    enum: ['Full Day', 'Half Day (Morning)', 'Half Day (Afternoon)'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500, // Limit description length
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
    default: 'Pending',
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  // You might add fields for approval/rejection details later
  // approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // approvedAt: { type: Date },
  // rejectionReason: { type: String },
});

const LeaveApplication = mongoose.model('LeaveApplication', leaveApplicationSchema);

module.exports = LeaveApplication;
