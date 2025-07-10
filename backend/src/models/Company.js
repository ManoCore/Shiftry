// models/CompanyModel.js
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    // Link to the user who manages this company (e.g., an admin)
    // This ensures that each company profile is linked to a specific user.
    adminUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References your existing User model
        required: true,
        unique: true // Ensures one company record per admin user for simplicity
    },
    // --- General Company Details ---
    companyName: {
        type: String,
        required: true,
        trim: true,
    },
    companyAddress: {
        addressLine1: { type: String, trim: true },
        addressLine2: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        postcode: { type: String, trim: true },
        country: { type: String, trim: true },
    },
    contactEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    // --- Billing Information ---
    billingAddress: {
        name: { type: String, trim: true },
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        postcode: { type: String, trim: true },
        country: { type: String, trim: true },
    },
    invoiceEmail: {
        type: String,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    // This is for the company's own address as it appears on billing documents,
    // which might be different from their primary operational address.
    companyAddressForBilling: {
        name: { type: String, trim: true },
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        postcode: { type: String, trim: true },
        country: { type: String, trim: true },
    },
    taxInfo: { // e.g., VAT ID, Tax Registration Number
        type: String,
        trim: true,
    },
    paymentDetails: { // e.g., "Subscribed with Direct debit ****4655"
        type: String,
        trim: true,
    },

    // --- Subscription Details ---
    scheduling: {
        type: String,
        enum: ['MONTHLY', 'ANNUALLY', 'QUARTERLY'], // Example enums
        default: 'MONTHLY',
    },
    nextInvoiceDate: {
        type: Date, // Store as Date object
    },
    hrPricePerUser: {
        type: String, // Storing as string to include currency symbol, e.g., "£2.00"
        trim: true,
    },
    hrDescription: {
        type: String,
        trim: true,
    },
    currentUsers: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
