// Example: models/location.js (or wherever your Location schema is defined)

const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true // You might have a unique index here for the name, which is good
  },
  workType: {
    type: String,
    required: true
  },
  preferredTeamMember: {
    type: mongoose.Schema.Types.ObjectId, // Assuming this is an ObjectId
    ref: 'User'
  },
  address: {
    street: { type: String, default: 'N/A' },
    city: { type: String, default: 'N/A' },
    state: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: 'United Kingdom' }
  },
  contact: {
    phone: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  isCustom: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    default: ''
  },
  organization: { // NEW FIELD
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
}, { timestamps: true });

module.exports = mongoose.models.Location || mongoose.model('Location', locationSchema);
