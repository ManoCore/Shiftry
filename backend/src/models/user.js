const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'employee', 'user', 'careWorker'], // Combined and ordered
    default: 'user', // Set your desired default role for new users
    required: true // Roles are typically required
  },
  emailId: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
  },
  
  passwordHash: { // Make sure your login/register routes interact with this field name
    type: String,
    required: function () {
      return this.status !== "invited";
    },
  },
  status: {
    type: String,
    enum: ["active", "inactive", "invited"],
    default: "active",
  },
  mobile: {
    type: String,
    trim: true,
  },
  visaStatus: {
    type: String,
    trim: true,
    type: String,
    enum: ['Student', 'PSW', 'COS', 'Other'], // Added 'Other' for flexibility, adjust if strict
    required: false,
  },
  training: {
    type: String,
    enum: ['Mandatory', 'PMVA', 'Both'], // These are your specified options
    required: false, // Set to true if training is always required
  },
  employmentType: {
    type: String,
    enum: ['Part time', 'Full time'],
    required: false, // Make required:true if it must always be filled
  },
  inviteToken: {
    type: String,
    unique: true,
    sparse: true,
  },
  profilePicture: {
    type: String,
    default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
  },
  preferredFullName: { type: String },
  phoneNumber: { type: String },
  dateOfBirth: { type: Date }, // Consider storing as Date
  gender: { type: String },
  pronouns: { type: String },
  address: {
    addressLine1: { type: String },
    addressLine2: { type: String },
    city: { type: String },
    state: { type: String },
    postcode: { type: String },
    country: { type: String },
  },
  emergencyContact: {
    contactName: { type: String },
    contactRelationship: { type: String },
    contactPhone: { type: String },
  },
  social: {
    facebook: { type: String },
    twitter: { type: String },
    linkedin: { type: String },
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);