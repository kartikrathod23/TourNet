const express = require('express');
const router = express.Router();
const axios = require('axios');

// Simple in-memory storage for bookings (in a real app, this would be a database)
let bookings = [];

// Get all bookings
router.get('/', async (req, res) => {
  try {
    res.status(200).json(bookings);
  } catch (error) {
    console.error('[Bookings] Error getting bookings:', error.message);
    res.status(500).json({ error: 'Failed to retrieve bookings' });
  }
});

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const bookingData = req.body;
    
    if (!bookingData || !bookingData.firstName || !bookingData.email) {
      return res.status(400).json({ error: 'Invalid booking data' });
    }
    
    // Generate a unique booking ID
    const bookingId = 'BK' + Math.floor(Math.random() * 10000000);
    
    // Add the booking with timestamp and ID
    const newBooking = {
      ...bookingData,
      bookingId,
      bookingDate: new Date().toISOString(),
      status: 'confirmed'
    };
    
    // Save to our "database" (in-memory array)
    bookings.push(newBooking);
    
    // In a real application, you might:
    // 1. Validate payment info
    // 2. Connect to real payment gateways (Stripe, PayPal, etc.)
    // 3. Save to a real database
    // 4. Send confirmation emails
    
    res.status(201).json({
      success: true,
      confirmationNumber: bookingId,
      booking: newBooking
    });
    
  } catch (error) {
    console.error('[Bookings] Error creating booking:', error.message);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const booking = bookings.find(b => b.bookingId === id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.status(200).json(booking);
  } catch (error) {
    console.error('[Bookings] Error getting booking:', error.message);
    res.status(500).json({ error: 'Failed to retrieve booking' });
  }
});

// Cancel a booking
router.put('/:id/cancel', async (req, res) => {
  try {
    const id = req.params.id;
    const bookingIndex = bookings.findIndex(b => b.bookingId === id);
    
    if (bookingIndex === -1) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Update the booking status
    bookings[bookingIndex].status = 'cancelled';
    bookings[bookingIndex].cancelledAt = new Date().toISOString();
    
    res.status(200).json({
      success: true,
      booking: bookings[bookingIndex]
    });
  } catch (error) {
    console.error('[Bookings] Error cancelling booking:', error.message);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

module.exports = router; 