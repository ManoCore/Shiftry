const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables from .env file

// Create a transporter object using the SMTP transport
// This is configured once and reused for sending multiple emails.
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports (like 587)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    // Optional: Add TLS/SSL options for better security, depending on your SMTP server
    tls: {
        // Do not fail on invalid certs, though in production you should use valid certs
        // rejectUnauthorized: false,
    },
});

/**
 * Sends an email using the configured Nodemailer transporter.
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject line of the email.
 * @param {string} htmlContent - The HTML body of the email.
 * @returns {Promise<Object>} - A promise that resolves with the Nodemailer info object.
 */
const sendEmail = async (to, subject, htmlContent) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM, // Sender address from .env
            to: to,                      // List of recipients
            subject: subject,            // Subject line
            html: htmlContent,           // HTML body
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        // Preview URL if using Ethereal/Mailtrap (for development)
        // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error(`Failed to send email to ${to}: ${error.message}`);
    }
};

module.exports = sendEmail;