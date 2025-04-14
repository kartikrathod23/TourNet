const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const hotelRoutes = require('./routes/hotels');
const activityRoutes = require('./routes/activities');
const tourPackageRoutes = require('./routes/tourPackages');
const travelOptionRoutes = require('./routes/travelOptions');
const bookingRoutes = require('./routes/bookings');
const chatSupportRoutes = require('./routes/chatSupport');
const paymentRoutes = require('./routes/payment');
const errorHandler = require('./middleware/errorHandler');
const axios = require('axios');
const tourPackagesRoutes = require('./routes/tourPackages');
const travelOptionsRoutes = require('./routes/travelOptions');
const hotelsRoutes = require('./routes/hotels');
const hotelAuthRoutes = require('./routes/hotelAuth');
const hotelRoomsRoutes = require('./routes/hotelRooms');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/tour-packages', tourPackageRoutes);
app.use('/api/travel-options', travelOptionRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat-support', chatSupportRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tour-packages', tourPackagesRoutes);
app.use('/api/travel-options', travelOptionsRoutes);
app.use('/api/hotels', hotelsRoutes);
app.use('/api/hotel-auth', hotelAuthRoutes);
app.use('/api/hotel-rooms', hotelRoomsRoutes);

// Error handler middleware
app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log('🚀 Server running on port 5000');
    });
  })
  .catch((err) => console.log(err));
