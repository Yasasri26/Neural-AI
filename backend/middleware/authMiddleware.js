// middleware/authMiddleware.js
// This middleware PROTECTS routes - verifies the JWT token on every protected request
// Think of it like a security guard checking ID before entering a room

const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  // Step 1: Get the token from the Authorization header
  // Token format in header: "Bearer eyJhbGciOiJIUzI1NiIsInR5..."
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided. Please login first.'
    });
  }

  // Step 2: Extract just the token part (remove "Bearer " prefix)
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7) // Remove first 7 characters ("Bearer ")
    : authHeader;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Token is missing.'
    });
  }

  // Step 3: Verify the token is valid and not expired
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // If token is valid, decoded will contain the payload we put in during login
    // Example decoded: { id: 1, username: "yasasri", email: "y@email.com", iat: ..., exp: ... }

    req.user = decoded; // Attach user info to request object for use in controllers
    next();             // Call next() to pass control to the actual route handler

  } catch (error) {
    // jwt.verify throws errors if token is invalid or expired
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Access denied.'
    });
  }
};

module.exports = authMiddleware;
