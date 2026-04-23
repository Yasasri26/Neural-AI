// middleware/errorMiddleware.js
// CUSTOM ERROR MIDDLEWARE - catches all unhandled errors in the application
// In Express, error middleware has 4 parameters: (err, req, res, next)
// It must be registered LAST (after all routes) in server.js

const errorMiddleware = (err, req, res, next) => {
  // Log the full error to console for debugging (only in development)
  console.error('❌ Error caught by middleware:');
  console.error('  Path:', req.path);
  console.error('  Method:', req.method);
  console.error('  Message:', err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error('  Stack:', err.stack);
  }

  // Determine the HTTP status code
  // Use the error's statusCode if set, otherwise default to 500
  const statusCode = err.statusCode || err.status || 500;

  // Handle specific MySQL/database errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry: this record already exists'
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      message: 'Referenced record does not exist'
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  // Generic error response
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Only show stack trace in development mode
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

// 404 Handler - for routes that don't exist
const notFoundMiddleware = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.method} ${req.originalUrl}' not found`
  });
};

module.exports = { errorMiddleware, notFoundMiddleware };
