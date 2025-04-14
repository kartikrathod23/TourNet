const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');

// @desc    Register a new hotel
// @route   POST /api/hotel-auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      description,
      address,
      starRating,
      amenities,
      policies,
      contactPerson,
      licenseNumber
    } = req.body;

    // Check if hotel already exists
    const existingHotel = await Hotel.findOne({ email });
    if (existingHotel) {
      return res.status(400).json({
        success: false,
        error: 'A hotel with this email already exists'
      });
    }

    // Create new hotel
    const hotel = await Hotel.create({
      name,
      email,
      password,
      phone,
      description,
      address,
      starRating,
      amenities: amenities || [],
      policies: policies || {
        checkInTime: '14:00',
        checkOutTime: '12:00',
        cancellationPolicy: 'Standard 24-hour cancellation policy applies'
      },
      contactPerson: contactPerson || {},
      licenseNumber,
      verificationStatus: 'pending'
    });

    // Generate token
    const token = jwt.sign(
      { id: hotel._id, type: 'hotel' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      token,
      data: {
        id: hotel._id,
        name: hotel.name,
        email: hotel.email,
        verificationStatus: hotel.verificationStatus
      }
    });

  } catch (err) {
    console.error('Hotel registration error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error during hotel registration'
    });
  }
});

// @desc    Login hotel
// @route   POST /api/hotel-auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Check for hotel
    const hotel = await Hotel.findOne({ email }).select('+password');
    if (!hotel) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await hotel.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update last login timestamp
    hotel.lastLogin = Date.now();
    await hotel.save({ validateBeforeSave: false });

    // Generate token
    const token = jwt.sign(
      { id: hotel._id, type: 'hotel' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      success: true,
      token,
      data: {
        id: hotel._id,
        name: hotel.name,
        email: hotel.email,
        verificationStatus: hotel.verificationStatus
      }
    });

  } catch (err) {
    console.error('Hotel login error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
});

// @desc    Get current hotel profile
// @route   GET /api/hotel-auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    // Check if the authenticated user is a hotel
    if (req.user.type !== 'hotel') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized as a hotel'
      });
    }

    const hotel = await Hotel.findById(req.user.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found'
      });
    }

    res.status(200).json({
      success: true,
      data: hotel
    });
  } catch (err) {
    console.error('Get hotel profile error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching hotel profile'
    });
  }
});

// @desc    Update hotel profile
// @route   PUT /api/hotel-auth/update-profile
// @access  Private
router.put('/update-profile', protect, async (req, res) => {
  try {
    // Check if the authenticated user is a hotel
    if (req.user.type !== 'hotel') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized as a hotel'
      });
    }

    const {
      name,
      phone,
      description,
      address,
      amenities,
      policies,
      contactPerson
    } = req.body;

    // Find hotel and update
    const hotelToUpdate = await Hotel.findById(req.user.id);

    if (!hotelToUpdate) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found'
      });
    }

    // Update fields if provided
    if (name) hotelToUpdate.name = name;
    if (phone) hotelToUpdate.phone = phone;
    if (description) hotelToUpdate.description = description;
    if (address) hotelToUpdate.address = address;
    if (amenities) hotelToUpdate.amenities = amenities;
    if (policies) hotelToUpdate.policies = policies;
    if (contactPerson) hotelToUpdate.contactPerson = contactPerson;

    await hotelToUpdate.save();

    res.status(200).json({
      success: true,
      data: hotelToUpdate
    });

  } catch (err) {
    console.error('Update hotel profile error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error while updating hotel profile'
    });
  }
});

module.exports = router; 