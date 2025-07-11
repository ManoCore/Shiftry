const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Node.js file system module

const Invoice = require('../models/Invoice'); // Your new Invoice model
const User = require('../models/user'); // Your User model
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const auth = require('../middleware/auth'); // Your authentication middleware

const router = express.Router();

// --- Multer Storage Configuration ---
// Define where to store the files and how to name them
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure the uploads directory exists
        const uploadDir = path.join(__dirname, '../uploads/invoices');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Create a unique filename: adminId-timestamp.ext
        const adminId = req.params.adminId; // Get adminId from URL parameter
        const extname = path.extname(file.originalname);
        cb(null, `${adminId}-${Date.now()}${extname}`);
    }
});

// Multer upload middleware
// Allow only PDF, DOC, or DOCX files and limit size
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Allowed MIME types for PDF, DOC, and DOCX
        const allowedMimeTypes = [
            'application/pdf',
            'application/msword', // .doc files
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx files
        ];

        // Check if the file's MIME type is in the allowed list
        const isMimeTypeAllowed = allowedMimeTypes.includes(file.mimetype);

        // Check if the file's extension is one of the allowed ones
        const extname = path.extname(file.originalname).toLowerCase();
        const isExtAllowed = ['.pdf', '.doc', '.docx'].includes(extname);

        if (isMimeTypeAllowed && isExtAllowed) {
            return cb(null, true);
        } else {
            cb(new ErrorResponse('Only PDF, DOC, or DOCX files are allowed!', 400));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
});

// --- API Endpoints ---

/**
 * @desc    Upload an invoice for a specific admin
 * @route   POST /api/v1/invoices/upload/:adminId
 * @access  Private (Super Admin)
 */
router.post('/upload/:adminId', auth.protect, auth.authorizeRoles('superadmin'), upload.single('invoiceFile'), asyncHandler(async (req, res, next) => {
    // req.file contains information about the uploaded file
    if (!req.file) {
        return next(new ErrorResponse('No file uploaded.', 400));
    }

    const { adminId } = req.params;
    const { invoiceNumber, amount, invoiceDate } = req.body; // Optional metadata

    // Verify the adminId exists and belongs to an organization (for security/integrity)
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') { // Ensure it's an actual admin user
        // If the admin is not found or not an 'admin' role, delete the uploaded file
        fs.unlink(req.file.path, (err) => {
            if (err) console.error(`Error deleting file: ${req.file.path}`, err);
        });
        return next(new ErrorResponse('Admin not found or not authorized to receive invoices.', 404));
    }

    // Removed the organization-specific check for superadmin here.
    // A superadmin can upload invoices for any admin, regardless of their own organization.
    // The invoice will still be linked to the admin's organization in the database.

    const invoice = await Invoice.create({
        admin: adminId,
        organization: admin.organization, // Automatically set from admin's organization
        filePath: req.file.path, // Full path on the server
        originalFileName: req.file.originalname,
        mimeType: req.file.mimetype,
        invoiceNumber,
        amount,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : undefined,
    });

    res.status(201).json({
        success: true,
        message: 'Invoice uploaded successfully.',
        data: invoice
    });
}));

router.get('/:adminId', auth.protect, auth.authorizeRoles('admin', 'superadmin'), asyncHandler(async (req, res, next) => {
    const { adminId } = req.params;

    // If the requesting user is an 'admin', ensure they are requesting their own invoices
    if (req.user.role === 'admin' && req.user._id.toString() !== adminId) {
        return next(new ErrorResponse('You are not authorized to view invoices for other administrators.', 403));
    }

    // Verify the adminId exists and belongs to an organization
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
        return next(new ErrorResponse('Admin not found.', 404));
    }

    const invoices = await Invoice.find({ admin: adminId, organization: admin.organization }).sort({ uploadedAt: -1 });

    res.status(200).json({
        success: true,
        count: invoices.length,
        data: invoices
    });
}));

/**
 * @desc    Download a specific invoice file
 * @route   GET /api/v1/invoices/download/:invoiceId
 * @access  Private (Admin, Super Admin)
 */
router.get('/download/:invoiceId', auth.protect, auth.authorizeRoles('admin', 'superadmin'), asyncHandler(async (req, res, next) => {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
        return next(new ErrorResponse('Invoice not found.', 404));
    }

    // If the requesting user is an 'admin', ensure they are downloading their own invoice
    if (req.user.role === 'admin' && invoice.admin.toString() !== req.user._id.toString()) {
        return next(new ErrorResponse('You are not authorized to download this invoice.', 403));
    }

    // Verify that the associated admin exists and is valid
    const adminOfInvoice = await User.findById(invoice.admin);
    if (!adminOfInvoice || adminOfInvoice.role !== 'admin') {
        return next(new ErrorResponse('Associated admin not found or not valid.', 404));
    }

    const filePath = invoice.filePath;

    // Check if the file exists on the disk
    if (fs.existsSync(filePath)) {
        // Set headers for download
        res.setHeader('Content-Disposition', `attachment; filename="${invoice.originalFileName}"`);
        res.setHeader('Content-Type', invoice.mimeType);
        // Send the file
        res.download(filePath, invoice.originalFileName, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                return next(new ErrorResponse('Could not download the file.', 500));
            }
        });
    } else {
        return next(new ErrorResponse('File not found on server.', 404));
    }
}));
module.exports = router;
