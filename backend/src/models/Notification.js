// // backend/src/models/Notification.js

// const mongoose = require('mongoose');

// const notificationSchema = new mongoose.Schema({
//   // CORRECTED: Changed 'user' to 'recipient' to match the intended field name
//   recipient: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User', // This should match the name of your User model
//     required: true,
//   },
//   message: { // The actual message content of the notification
//     type: String,
//     required: true,
//   },
//   // CORRECTED: Made schedule field OPTIONAL to accommodate notifications not tied to schedules
//   schedule: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Schedule',
//     required: false, // Set to false to allow notifications not tied to a schedule
//   },
//   type: { // Categorizes the notification (e.g., 'leave_application', 'schedule_update', 'leave_status_update', 'credentials_update')
//     type: String,
//     required: true,
//     enum: [
//       'schedule_update',
//       'leave_application', // Ensure this enum value is present for leave notifications
//       'leave_status_update',
//       'admin_alert',
//       'other',
//       'credentials_update', // Ensure this enum value is present for credential updates
//       'schedule_published', // Keep if used elsewhere
//     ],
//     default: 'other', // A safe default type
//   },
//   relatedDocument: { // A generic field to link to any related document (e.g., LeaveApplication ID, Post ID, User ID)
//     type: mongoose.Schema.Types.ObjectId,
//     required: false, // This is optional, as not all notifications will have a specific related document
//   },
//   relatedModel: { // Specifies which Mongoose model 'relatedDocument' refers to
//     type: String,
//     required: false, // Optional, only needed if relatedDocument is present
//     enum: ['Schedule', 'LeaveApplication', 'User', 'Post'], // List of possible related models
//   },
//   isRead: { // Status of whether the notification has been read
//     type: Boolean,
//     default: false,
//   },
//   createdAt: { // Timestamp of when the notification was created
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model('Notification', notificationSchema);
// backend/src/models/Notification.js

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // CORRECTED: Changed 'user' to 'recipient' to match the intended field name
   organization: { // NEW FIELD: Notification belongs to an organization
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
    },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This should match the name of your User model
    required: true,
  },
  message: { // The actual message content of the notification
    type: String,
    required: true,
  },
  // CORRECTED: Made schedule field OPTIONAL to accommodate notifications not tied to schedules
  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: false, // Set to false to allow notifications not tied to a schedule
  },
  type: { // Categorizes the notification (e.g., 'leave_application', 'schedule_update', 'leave_status_update', 'credentials_update')
    type: String,
    required: true,
    enum: [
      'schedule_update',
      'leave_application', // Ensure this enum value is present for leave notifications
      'leave_status_update',
      'admin_alert',
      'other',
      'credentials_update', // Ensure this enum value is present for credential updates
      'schedule_published', // Keep if used elsewhere
    ],
    default: 'other', // A safe default type
  },
  relatedDocument: { // A generic field to link to any related document (e.g., LeaveApplication ID, Post ID, User ID)
    type: mongoose.Schema.Types.ObjectId,
    required: false, // This is optional, as not all notifications will have a specific related document
  },
  relatedModel: { // Specifies which Mongoose model 'relatedDocument' refers to
    type: String,
    required: false, // Optional, only needed if relatedDocument is present
    enum: ['Schedule', 'LeaveApplication', 'User', 'Post'], // List of possible related models
  },
  isRead: { // Status of whether the notification has been read
    type: Boolean,
    default: false,
  },
  createdAt: { // Timestamp of when the notification was created
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notification', notificationSchema);
