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
  }
}, { timestamps: true });

// >>> FIND THIS LINE OR SIMILAR IN YOUR LOCATION MODEL AND REMOVE OR COMMENT OUT unique: true <<<
// Example of what you might have that creates the unique index:
// If address is a subdocument with its own index:
// locationSchema.index({ 'address.street': 1, 'address.city': 1, 'address.state': 1, 'address.postalCode': 1, 'address.country': 1 }, { unique: true });

// If individual fields had unique: true, remove it from them:
// street: { type: String, default: 'N/A', unique: true }, // <-- Remove unique: true if it's here
module.exports = mongoose.models.Location || mongoose.model('Location', locationSchema);
