// Handle 404 errors
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Custom error handler
const errorHandler = (err, req, res, next) => {
  // If status code is 200 but there's an error, set it to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode);
  
  // Prepare error response
  res.json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    errors: err.errors || null
  });
};

// Mongoose validation error handler
const handleValidationError = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const errors = {};
    
    // Extract validation errors
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });
    
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }
  
  // If not a validation error, pass to the next error handler
  next(err);
};

// Mongoose cast error handler (invalid ID format)
const handleCastError = (err, req, res, next) => {
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }
  
  next(err);
};

// Duplicate key error handler
const handleDuplicateKeyError = (err, req, res, next) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    
    return res.status(409).json({
      success: false,
      message: `Duplicate value entered for ${field}`,
      errors: { [field]: `${field} already exists` }
    });
  }
  
  next(err);
};

module.exports = {
  notFound,
  errorHandler,
  handleValidationError,
  handleCastError,
  handleDuplicateKeyError
}; 