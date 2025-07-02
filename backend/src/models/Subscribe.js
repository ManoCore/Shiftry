// models/Subscribe.js

const mongoose = require('mongoose');

// Define the schema for your subscriber data
const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Ensure each email is unique in the database
    lowercase: true, // Store emails in lowercase
    trim: true, // Remove leading/trailing whitespace
    match: [/.+@.+\..+/, 'Please enter a valid email address'] // Basic email format validation
  },
  subscribedAt: {
    type: Date,
    default: Date.now, // Automatically set the current timestamp when a new subscriber is created
  },
});

// Create the Mongoose model and EXPORT IT DIRECTLY
// The model name 'Subscriber' (first argument) should match the variable name you want to use
// when importing it, for clarity and convention.
const Subscriber = mongoose.model('Subscriber', subscriberSchema);

module.exports = Subscriber; // <-- This is the crucial line for exporting the model correctly
