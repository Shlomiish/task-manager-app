const jwt = require('jsonwebtoken'); // library for verifying and decoding JWT tokens
const logger = require('../config/logger'); // logger for tracking authentication errors

const authMiddleware = (req, res, next) => {
  // middleware that runs before protected routes to verify user identity
  try {
    const token = req.headers.authorization?.split(' ')[1]; // extracts token from "Bearer TOKEN" format in Authorization header
    //* When a user logs in, the backend creates a JWT token and sends it to the frontend. For all future requests, the frontend must send this token back to prove they're authenticated. *

    if (!token) {
      // checks if token was provided in the request
      return res.status(401).json({ error: 'No token provided' }); // returns unauthorized error if no token found
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // verifies token signature and decodes the payload data
    req.userId = decoded.userId; // attaches user ID from token to request object for use in route handlers
    req.userEmail = decoded.email; // attaches email from token to request object for use in route handlers
    next(); // passes control to the next middleware or route handler
  } catch (error) {
    logger.error('Auth error:', error.message); // logs the specific error that occurred during authentication
    return res.status(401).json({ error: 'Invalid token' }); // returns error for expired, malformed, or invalid tokens
  }
};

module.exports = authMiddleware;
