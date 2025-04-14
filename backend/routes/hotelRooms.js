const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');
const { protect } = require('../middleware/auth');

// Middleware to check if the user is a hotel
const checkHotelRole = (req, res, next) => {
  if (req.user.type !== 'hotel') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized as a hotel'
    });
  }
  next();
};

// @desc    Get all rooms for a hotel
// @route   GET /api/hotel-rooms
// @access  Private (Hotel only)
router.get('/', protect, checkHotelRole, async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.user.id);
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found'
      });
    }
    
    res.status(200).json({
      success: true,
      count: hotel.rooms.length,
      data: hotel.rooms
    });
  } catch (err) {
    console.error('Get rooms error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching rooms'
    });
  }
});

// @desc    Add a new room
// @route   POST /api/hotel-rooms
// @access  Private (Hotel only)
router.post('/', protect, checkHotelRole, async (req, res) => {
  try {
    const {
      roomNumber,
      roomType,
      price,
      capacity,
      amenities,
      description,
      images,
      mainImage
    } = req.body;
    
    const hotel = await Hotel.findById(req.user.id);
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found'
      });
    }
    
    // Check if room number already exists
    const roomExists = hotel.rooms.some(room => room.roomNumber === roomNumber);
    if (roomExists) {
      return res.status(400).json({
        success: false,
        error: 'Room number already exists'
      });
    }
    
    // Create new room
    const newRoom = {
      roomNumber,
      roomType,
      price,
      capacity,
      amenities: amenities || [],
      description: description || '',
      images: images || [],
      mainImage: mainImage || '',
      isAvailable: true,
      isActive: true
    };
    
    // Add room to hotel
    hotel.rooms.push(newRoom);
    await hotel.save();
    
    res.status(201).json({
      success: true,
      data: newRoom
    });
  } catch (err) {
    console.error('Add room error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error while adding room'
    });
  }
});

// @desc    Update room details
// @route   PUT /api/hotel-rooms/:roomId
// @access  Private (Hotel only)
router.put('/:roomId', protect, checkHotelRole, async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const {
      roomNumber,
      roomType,
      price,
      capacity,
      amenities,
      description,
      images,
      mainImage,
      isAvailable,
      isActive
    } = req.body;
    
    const hotel = await Hotel.findById(req.user.id);
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found'
      });
    }
    
    // Find the room
    const roomIndex = hotel.rooms.findIndex(room => room._id.toString() === roomId);
    
    if (roomIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }
    
    // Check if room number is being changed and if new number already exists
    if (roomNumber && roomNumber !== hotel.rooms[roomIndex].roomNumber) {
      const roomNumberExists = hotel.rooms.some(
        (room, index) => index !== roomIndex && room.roomNumber === roomNumber
      );
      
      if (roomNumberExists) {
        return res.status(400).json({
          success: false,
          error: 'Room number already exists'
        });
      }
    }
    
    // Update room
    if (roomNumber) hotel.rooms[roomIndex].roomNumber = roomNumber;
    if (roomType) hotel.rooms[roomIndex].roomType = roomType;
    if (price) hotel.rooms[roomIndex].price = price;
    if (capacity) hotel.rooms[roomIndex].capacity = capacity;
    if (amenities) hotel.rooms[roomIndex].amenities = amenities;
    if (description) hotel.rooms[roomIndex].description = description;
    if (images) hotel.rooms[roomIndex].images = images;
    if (mainImage) hotel.rooms[roomIndex].mainImage = mainImage;
    if (isAvailable !== undefined) hotel.rooms[roomIndex].isAvailable = isAvailable;
    if (isActive !== undefined) hotel.rooms[roomIndex].isActive = isActive;
    
    await hotel.save();
    
    res.status(200).json({
      success: true,
      data: hotel.rooms[roomIndex]
    });
  } catch (err) {
    console.error('Update room error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error while updating room'
    });
  }
});

// @desc    Delete a room
// @route   DELETE /api/hotel-rooms/:roomId
// @access  Private (Hotel only)
router.delete('/:roomId', protect, checkHotelRole, async (req, res) => {
  try {
    const roomId = req.params.roomId;
    
    const hotel = await Hotel.findById(req.user.id);
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found'
      });
    }
    
    // Find the room
    const roomIndex = hotel.rooms.findIndex(room => room._id.toString() === roomId);
    
    if (roomIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }
    
    // Remove room
    hotel.rooms.splice(roomIndex, 1);
    await hotel.save();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Delete room error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting room'
    });
  }
});

// @desc    Update room availability for specific dates
// @route   PUT /api/hotel-rooms/:roomId/availability
// @access  Private (Hotel only)
router.put('/:roomId/availability', protect, checkHotelRole, async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const { availability } = req.body;
    
    if (!availability || !Array.isArray(availability)) {
      return res.status(400).json({
        success: false,
        error: 'Availability data is required and must be an array'
      });
    }
    
    const hotel = await Hotel.findById(req.user.id);
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found'
      });
    }
    
    // Find the room
    const roomIndex = hotel.rooms.findIndex(room => room._id.toString() === roomId);
    
    if (roomIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }
    
    // Update availability
    hotel.rooms[roomIndex].availability = availability;
    await hotel.save();
    
    res.status(200).json({
      success: true,
      data: hotel.rooms[roomIndex]
    });
  } catch (err) {
    console.error('Update room availability error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error while updating room availability'
    });
  }
});

// @desc    Get room availability for date range
// @route   GET /api/hotel-rooms/:roomId/availability
// @access  Public
router.get('/:roomId/availability', async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const { hotelId, startDate, endDate } = req.query;
    
    if (!hotelId) {
      return res.status(400).json({
        success: false,
        error: 'Hotel ID is required'
      });
    }
    
    const hotel = await Hotel.findById(hotelId);
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found'
      });
    }
    
    // Find the room
    const room = hotel.rooms.find(room => room._id.toString() === roomId);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }
    
    // If room is not active or not available, return not available
    if (!room.isActive || !room.isAvailable) {
      return res.status(200).json({
        success: true,
        isAvailable: false,
        message: 'Room is not available for booking'
      });
    }
    
    // Filter availability by date range if provided
    let availabilityData = room.availability || [];
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      availabilityData = availabilityData.filter(item => {
        const date = new Date(item.date);
        return date >= start && date <= end;
      });
      
      // Check if all dates in range are available
      const isAvailable = availabilityData.every(item => item.isAvailable);
      
      return res.status(200).json({
        success: true,
        isAvailable,
        data: availabilityData
      });
    }
    
    // If no date range provided, return all availability data
    res.status(200).json({
      success: true,
      isAvailable: room.isAvailable,
      data: availabilityData
    });
  } catch (err) {
    console.error('Get room availability error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching room availability'
    });
  }
});

module.exports = router; 