const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const User = require('../models/User');
const Hotel = require('../models/Hotel');

/**
 * Middleware to protect routes - requires valid JWT token
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists in cookies
  else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // If no token, return unauthorized
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user type is specified
    if (decoded.type === 'hotel') {
      // Hotel authentication
      req.user = await Hotel.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Hotel not found'
        });
      }
      
      req.user.type = 'hotel';
    } else {
      // Default to user authentication
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
});

/**
 * Middleware to authorize specific roles
 * @param  {...String} roles - Roles allowed to access the route
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // For hotel users
    if (req.user.type === 'hotel') {
      if (roles.includes('hotel')) {
        return next();
      }
    } 
    // For regular users
    else if (roles.includes(req.user.role)) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      error: `User role ${req.user.role || 'hotel'} is not authorized to access this route`
    });
  };
};

module.exports = {
  protect,
  authorize
}; 