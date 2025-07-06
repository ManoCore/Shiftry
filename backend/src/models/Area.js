const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Area name is required'],
    trim: true,
    unique: true, // Ensures no two areas have the same name
  },
  workType: {
    type: String,
    required: [true, 'Work type is required'],
    trim: true,
  },
  preferredTeamMember: {
    type: String, // Or mongoose.Schema.Types.ObjectId if it references a User/TeamMember document
    trim: true,
    default: '', // Empty string if not selected
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to your User model
    required: true, // This should come from your auth middleware
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Area', areaSchema);