const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/.+@.+\..+/, 'Please enter a valid email address']
  },
  // phone: { // Assuming you might uncomment the phone field later
  //   type: String,
  //   trim: true,
  //   required: false, // Make this true if phone becomes mandatory
  // },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

module.exports = ContactMessage;