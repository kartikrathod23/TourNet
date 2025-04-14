const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { protect } = require('../middlewares/authMiddleware');
const mongoose = require('mongoose');

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ 
      fullName, 
      email, 
      password: hashedPassword,
      role: 'user' 
    });

    const token = jwt.sign({ id: newUser._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ 
      token, 
      user: { id: newUser._id, fullName, email, role: 'user' } 
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Agent Signup
router.post('/agent-signup', async (req, res) => {
  try {
    const { fullName, email, password, role, agencyDetails } = req.body;

    // Validate agent details
    if (!agencyDetails || !agencyDetails.name || !agencyDetails.address || !agencyDetails.phone) {
      return res.status(400).json({ error: 'Agency details are required for agent registration' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create agent user with pending approval status
    const newAgent = await User.create({ 
      fullName, 
      email, 
      password: hashedPassword,
      role: 'agent',
      agencyDetails: {
        name: agencyDetails.name,
        address: agencyDetails.address,
        phone: agencyDetails.phone,
        license: agencyDetails.license || '',
        verificationStatus: 'pending' // Agents start with pending verification
      }
    });

    const token = jwt.sign({ id: newAgent._id, role: 'agent' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ 
      token, 
      user: { 
        id: newAgent._id, 
        fullName, 
        email, 
        role: 'agent' 
      } 
    });
  } catch (err) {
    console.error('Agent signup error:', err);
    res.status(500).json({ error: 'Agent signup failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Special admin bypass - allows login without database check
    if (email === 'admin@gmail.com' && password === 'admin') {
      return res.status(200).json({
        success: true,
        token: 'admin-special-token',
        user: {
          _id: 'admin123',
          name: 'Admin User',
          email: 'admin@gmail.com',
          role: 'admin',
          isVerified: true
        }
      });
    }

    // For regular users, continue with normal authentication
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ 
      token, 
      user: { 
        id: user._id, 
        fullName: user.fullName, 
        email,
        role: user.role
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Agent Login
router.post('/agent-login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Find the user and verify they are an agent
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    // Check if user is an agent
    if (user.role !== 'agent' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Not an agent account.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.status(200).json({ 
      token, 
      user: { 
        id: user._id, 
        fullName: user.fullName, 
        email,
        role: user.role
      } 
    });
  } catch (err) {
    console.error('Agent login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Add booking to user document
// @route   POST /api/auth/add-booking
// @access  Private
router.post('/add-booking', protect, async (req, res) => {
  try {
    // Get the user from the database using the ID from the token
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Create a new booking object with a unique ID
    const bookingId = new mongoose.Types.ObjectId();
    const booking = {
      _id: bookingId,
      confirmationNumber: `BK${Date.now().toString().slice(-8)}`,
      bookingType: req.body.bookingType || 'package',
      itemDetails: req.body.itemDetails || {},
      status: req.body.status || 'confirmed',
      totalAmount: req.body.totalAmount || 0,
      currency: req.body.currency || 'INR',
      checkInDate: req.body.checkInDate || new Date(),
      checkOutDate: req.body.checkOutDate || new Date(),
      travelDates: req.body.travelDates || {
        from: req.body.checkInDate || new Date(),
        to: req.body.checkOutDate || new Date()
      },
      guests: req.body.guests || { adults: 1, children: 0 },
      contactInfo: req.body.contactInfo || {
        fullName: user.name,
        email: user.email,
        phone: user.phone || ''
      },
      paymentInfo: req.body.paymentInfo || {
        method: 'wallet',
        amount: req.body.totalAmount || 0,
        status: 'completed',
        paidAt: new Date()
      },
      specialRequests: req.body.specialRequests || '',
      bookingDate: new Date(),
      hotel: req.body.hotel || null
    };
    
    console.log('Adding booking to user:', booking);
    
    // If bookings array doesn't exist, create it
    if (!user.bookings) {
      user.bookings = [];
    }
    
    // Add the booking to the user's bookings array
    user.bookings.push(booking);
    await user.save();
    
    console.log('Booking added to user successfully');
    
    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (err) {
    console.error('Error adding booking to user:', err);
    res.status(500).json({
      success: false,
      error: 'Server error while adding booking'
    });
  }
});

// @desc    Get user bookings
// @route   GET /api/auth/user-bookings
// @access  Private
router.get('/user-bookings', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Return all bookings or empty array if none
    const bookings = user.bookings || [];
    console.log(`Found ${bookings.length} bookings for user ${user.email}`);
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    console.error('Error fetching user bookings:', err);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching bookings'
    });
  }
});

// @desc    Cancel booking
// @route   PUT /api/auth/cancel-booking/:id
// @access  Private
router.put('/cancel-booking/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Find the booking in the user's bookings array
    const bookingIndex = user.bookings.findIndex(
      booking => booking._id.toString() === req.params.id
    );
    
    if (bookingIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    // Update the booking status and add cancellation details
    user.bookings[bookingIndex].status = 'cancelled';
    user.bookings[bookingIndex].cancellation = {
      isCancelled: true,
      cancelledAt: new Date(),
      reason: req.body.reason || 'User requested cancellation',
      refundStatus: 'pending'
    };
    
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user.bookings[bookingIndex]
    });
  } catch (err) {
    console.error('Error cancelling booking:', err);
    res.status(500).json({
      success: false,
      error: 'Server error while cancelling booking'
    });
  }
});

module.exports = router;