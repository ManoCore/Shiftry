// backend/src/routes/contactRoutes.js

const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/Contact'); // Import the new model
const nodemailer = require('nodemailer'); // Import Nodemailer

// ---
// Configure Nodemailer Transporter
// ---
// Ensure you have dotenv or similar package loaded to access process.env variables
// In your main app file (e.g., app.js or server.js), you'd typically have:
// require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true', // Convert string 'true' to boolean true
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post('/', async (req, res) => {
  const { name, email, phone, message } = req.body;

  // Basic server-side validation
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required fields.' });
  }

  if (!/.+@.+\..+/.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }

  try {
    // 1. Save the message to the database (recommended for record-keeping)
    const newContactMessage = new ContactMessage({
      name,
      email,
      phone,
      message,
    });
    await newContactMessage.save();
    console.log('Contact message saved to DB:', newContactMessage);

    // ---
    // 2. Send Contact Confirmation Email to the User
    // ---
    const userMailOptions = {
      from: process.env.EMAIL_FROM, // The "from" address (support@manocore.com)
      to: email, // The user's email address
      subject: 'Thank You for Your Message - Manocore',
      html: `
        <p>Dear ${name},</p>
        <p>Thank you for reaching out to Shiftry! We've received your message and appreciate you taking the time to contact us.</p>
        <p>We'll review your inquiry and get back to you as soon as possible. Please note that response times may vary.</p>
        <p>Here's a copy of the message you sent:</p>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Message:</strong><br><p>${message}</p></li>
        </ul>
        <p>In the meantime, feel free to explore more about our services on our website.</p>
        <p>Best regards,</p>
        <p>The Manocore Team</p>
        <p><a href="mailto:${process.env.EMAIL_FROM}">${process.env.EMAIL_FROM}</a></p>
      `,
    };

    await transporter.sendMail(userMailOptions);
    console.log(`Confirmation email sent to ${email} successfully.`);
    // <li><strong>Phone:</strong> ${phone || 'N/A'}</li>
    // ---
    // 3. Send Contact Details Email to Support Team (support@manocore.com)
    // ---
    const adminMailOptions = {
      from: process.env.EMAIL_FROM, // The "from" address (support@manocore.com)
      to: process.env.EMAIL_FROM, // Send to support@manocore.com
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <p>You have a new contact form submission:</p>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Phone:</strong> ${phone || 'N/A'}</li>
          <li><strong>Message:</strong><br><p>${message}</p></li>
        </ul>
        <p>Submitted On: ${new Date().toLocaleString()}</p>
        <hr/>
        <p>To reply to this inquiry, you can email ${email}.</p>
      `,
    };

    await transporter.sendMail(adminMailOptions);
    console.log('Contact details email sent to support@manocore.com successfully.');

    res.status(200).json({ message: 'Your message has been sent successfully! A confirmation email has been sent to your inbox.' });

  } catch (error) {
    console.error('Error handling contact form submission:', error);
    // You might want to be more specific with error messages here,
    // e.g., if email sending failed vs. DB saving failed.
    res.status(500).json({ message: 'Failed to send your message. Please try again later.' });
  }
});

module.exports = router;