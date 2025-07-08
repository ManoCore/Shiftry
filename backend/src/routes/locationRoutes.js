const express = require('express');
const router = express.Router();
const Location = require('../models/Location');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth'); // Assuming you have auth middleware
const User=require("../models/user");

router.post('/', auth, async (req, res) => {
    try {
        const { name, workType, address, contact, isCustom, notes, preferredTeamMember } = req.body;

        // Basic validation (you might want more robust validation here, e.g., using express-validator)
        if (!name || !workType || !address) {
            return res.status(400).json({ msg: 'Please enter all required location fields: name, work type, street, city.' });
        }

        // Check if a location with the same name already exists
        let existingLocation = await Location.findOne({ name });
        if (existingLocation) {
            return res.status(400).json({ msg: 'A location with this name already exists.' });
        }

        // Optional: Validate if preferredTeamMember is a valid user ID if provided
        if (preferredTeamMember) {
            const userExists = await User.findById(preferredTeamMember); // Now User is defined
            if (!userExists) {
                return res.status(400).json({ msg: 'Preferred team member not found.' });
            }
        }

        const newLocation = new Location({
            name,
            workType,
            address,
            contact,
            preferredTeamMember: preferredTeamMember || null, // Ensure it's null if not provided
            isCustom: isCustom !== undefined ? isCustom : true, // Assume true for newly added "areas"
            notes,
            createdBy: req.user.id // Get creator from authenticated user
        });

        const savedLocation = await newLocation.save();

        // Populate preferredTeamMember if you want to return the user object, not just ID
        const populatedLocation = await Location.findById(savedLocation._id).populate('preferredTeamMember', 'name email'); // Adjust fields as needed

        res.status(201).json(populatedLocation); // Send the full saved document back
    } catch (err) {
        console.error(err.message); // This will now show "ReferenceError: User is not defined" if you didn't import
        res.status(500).send('Server Error');
    }
});

/**
 * @route   GET /api/locations
 * @desc    Get all locations (with optional filtering)
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    // You can add query parameters for filtering
    const { workType, isActive, search } = req.query;
    
    const query = {};
    if (workType) query.workType = workType;
    if (isActive) query.isActive = isActive;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { 'contact.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const locations = await Location.find(query)
      .sort({ workType: 1, name: 1 }) // Sort by workType then name
      .lean(); // Convert to plain JS object

    // Special handling to ensure "Time Off" is always first
    const timeOffIndex = locations.findIndex(loc => 
      loc.workType === 'Non-Working' && loc.name === 'Time Off'
    );
    
    let sortedLocations = [...locations];
    if (timeOffIndex > -1) {
      const timeOff = sortedLocations.splice(timeOffIndex, 1)[0];
      sortedLocations.unshift(timeOff);
    }

    res.json(sortedLocations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/locations/:id
 * @desc    Get single location by ID
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ msg: 'Location not found' });
    }
    res.json(location);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Location not found' });
    }
    res.status(500).send('Server Error');
  }
});

/**
 * @route   PUT /api/locations/:id
 * @desc    Update a location
 * @access  Private (Admin/Manager)
 */
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user has permission
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const { name, workType, address, contact, notes, isActive } = req.body;

    let location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ msg: 'Location not found' });
    }

    // Prevent modifying the default Time Off location
    if (location.workType === 'Non-Working' && location.name === 'Time Off') {
      return res.status(400).json({ msg: 'Cannot modify the default Time Off location' });
    }

    // Update fields
    if (name) location.name = name;
    if (workType) location.workType = workType;
    if (address) location.address = address;
    if (contact) location.contact = contact;
    if (notes) location.notes = notes;
    if (isActive !== undefined) location.isActive = isActive;

    location.updatedAt = Date.now();
    await location.save();

    res.json(location);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   DELETE /api/locations/:id
 * @desc    Delete a location
 * @access  Private (Admin)
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    // Only admin can delete locations
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // Validate ObjectId format to prevent Mongoose casting errors
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ msg: 'Invalid location ID' });
    }

    // Find and delete the location in one step
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) {
      return res.status(404).json({ msg: 'Location not found' });
    }

    // Prevent deleting the default Time Off location
    if (location.workType === 'Non-Working' && location.name === 'Time Off') {
      return res.status(400).json({ msg: 'Cannot delete the default Time Off location' });
    }

    res.json({ msg: 'Location removed' });
  } catch (err) {
    console.error('Error deleting location:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});



module.exports = router;