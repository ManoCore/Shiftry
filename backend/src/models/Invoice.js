const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
    // Reference to the User (Admin) this invoice belongs to
    admin: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // Assuming your User model is named 'User'
        required: true
    },
    // Reference to the Organization this invoice belongs to
    // This adds an extra layer of security/scoping
    organization: {
        type: mongoose.Schema.ObjectId,
        ref: 'Organization', // Assuming your Organization model is named 'Organization'
        required: true
    },
    // Path where the file is stored on the server
    filePath: {
        type: String,
        required: true
    },
    // Original name of the file when uploaded
    originalFileName: {
        type: String,
        required: true
    },
    // Mime type of the file (e.g., 'application/pdf')
    mimeType: {
        type: String,
        required: true
    },
    // Optional: Invoice number (if applicable)
    invoiceNumber: String,
    // Optional: Amount of the invoice
    amount: Number,
    // Optional: Date of the invoice
    invoiceDate: Date,
    // Date when the invoice was uploaded
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

// Add a pre-save hook to ensure the invoice is associated with the correct organization
// based on the admin's organization. This adds a layer of data integrity.
InvoiceSchema.pre('save', async function(next) {
    if (this.isNew || this.isModified('admin')) {
        const User = mongoose.model('User'); // Get the User model
        const admin = await User.findById(this.admin);
        if (admin) {
            this.organization = admin.organization;
        } else {
            return next(new Error('Admin not found for invoice.'));
        }
    }
    next();
});


module.exports = mongoose.model('Invoice', InvoiceSchema);