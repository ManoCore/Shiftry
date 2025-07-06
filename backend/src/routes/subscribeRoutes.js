const express = require('express');
const Subscriber = require("../models/Subscribe");
const router = express.Router();
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

router.post('/subscribe', async (req, res) => {
  const { email } = req.body; // Removed timestamp as it's typically generated on the backend

  // Server-side validation: Check if email is provided and is a valid format
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }
  if (!/.+@.+\..+/.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }

  try {
    // Check if email already exists to avoid duplicate entries and emails
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(409).json({ message: 'Email already subscribed.' });
    }

    // Create a new Subscriber document
    const newSubscriber = new Subscriber({
      email,
      subscribedAt: new Date(), // Always set the timestamp on the backend for accuracy
    });

    // Save the new subscriber to the database
    await newSubscriber.save();
    console.log('New subscriber saved to DB:', newSubscriber);

    // ---
    // 1. Send Subscription Confirmation Email to the User
    // ---
    const userMailOptions = {
      from: process.env.EMAIL_FROM, // The "from" address (support@manocore.com)
      to: email, // The user's email address
      subject: 'Welcome to the Shiftry Newsletter!',
      html: `
        <p>Dear Subscriber,</p>
        <p>Thank you for subscribing to the Shiftry newsletter! We're excited to have you join our community.</p>
        <p>You'll now receive updates, news, and special offers directly in your inbox.</p>
        <p>If you have any questions, feel free to contact us.</p>
        <p>Best regards,</p>
        <p>The Shiftry Team</p>
        <p><a href="mailto:${process.env.EMAIL_FROM}">${process.env.EMAIL_FROM}</a></p>
      `,
    };

    await transporter.sendMail(userMailOptions);
    console.log(`Subscription confirmation email sent to ${email} successfully.`);

    // ---
    // 2. Send New Subscriber Notification Email to Support Team (support@manocore.com)
    // ---
    const adminMailOptions = {
      from: process.env.EMAIL_FROM, // The "from" address (support@manocore.com)
      to: process.env.EMAIL_FROM, // Send to support@manocore.com
      subject: `New Newsletter Subscriber: ${email}`,
      html: `
        <p>A new user has subscribed to the newsletter:</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Subscription Date:</strong> ${newSubscriber.subscribedAt.toLocaleString()}</li>
        </ul>
      `,
    };

    await transporter.sendMail(adminMailOptions);
    console.log('New subscriber notification email sent to support@manocore.com successfully.');

    // Send a success response
    res.status(201).json({ message: 'Successfully subscribed! A confirmation email has been sent to your inbox.', subscriber: newSubscriber });

  } catch (error) {
    // Handle specific MongoDB duplicate key error (code 11000)
    // This block might be less critical now that we do a findOne check first,
    // but it's good for robustness against race conditions.
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email already subscribed.' });
    }
    // Handle other potential errors (e.g., validation errors, network issues)
    console.error('Error during subscription process:', error);
    res.status(500).json({ message: 'Server error during subscription. Please try again later.' });
  }
});

module.exports = router; // Export the router to be used in app.js