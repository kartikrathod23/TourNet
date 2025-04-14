const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { protect } = require('../middlewares/authMiddleware');

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

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

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

module.exports = router;