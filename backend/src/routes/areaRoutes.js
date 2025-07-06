// src/routes/areaRoutes.js
const express = require('express');
const router = express.Router();
const Area = require('../models/Area'); // Import the Area model
const auth = require('../middleware/auth'); // Assuming you have an authentication middleware
const { check, validationResult } = require('express-validator'); // For robust validation

// Get all areas
router.get('/', auth, async (req, res) => { // Added auth middleware
  try {
    const areas = await Area.find().populate('createdBy', 'name email'); // Optionally populate createdBy user info
    res.json(areas);
  } catch (err) {
    console.error('Error fetching areas:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new area
router.post(
  '/',
  [
    auth, // Apply authentication middleware first
    [
      check('name', 'Area name is required').not().isEmpty(),
      check('workType', 'Work type is required').not().isEmpty(),
      // 'preferredTeamMember' is optional, so no check here
    ]
  ],
  async (req, res) => {
    // Check for validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Authorization: Ensure only authorized roles can create areas (e.g., admin, manager)
    // Assuming req.user is populated by your auth middleware with user details including role
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        return res.status(403).json({ msg: 'Not authorized to create areas' });
    }

    try {
      const { name, workType, preferredTeamMember } = req.body;
      const createdBy = req.user.id; // Get createdBy from the authenticated user

      // Check if area with the same name already exists
      let existingArea = await Area.findOne({ name });
      if (existingArea) {
        return res.status(400).json({ msg: 'An area with this name already exists.' });
      }

      const newArea = new Area({
        name,
        workType,
        preferredTeamMember: preferredTeamMember || '', // Use default if not provided
        createdBy,
      });

      await newArea.save();
      res.status(201).json(newArea);
    } catch (err) {
      console.error('Error saving area:', err);
      // Check for Mongoose unique constraint error
      if (err.code === 11000) {
        return res.status(400).json({ msg: 'An area with this name already exists.' });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete an area
router.delete('/:id', auth, async (req, res) => { // Added auth middleware
  // Authorization: Only admin can delete locations (adjust role as needed)
  if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to delete areas' });
  }

  try {
    const { id } = req.params; // This 'id' refers to the Mongoose _id, not your old uuidv4 'id' field

    // Use findByIdAndDelete if 'id' in params is the Mongoose _id
    const deletedArea = await Area.findByIdAndDelete(id);

    if (!deletedArea) {
      return res.status(404).json({ error: 'Area not found' });
    }
    res.json({ message: 'Area deleted successfully' });
  } catch (err) {
    console.error('Error deleting area:', err);
    // Handle invalid ObjectId format
    if (err.kind === 'ObjectId') {
        return res.status(400).json({ error: 'Invalid Area ID format' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;