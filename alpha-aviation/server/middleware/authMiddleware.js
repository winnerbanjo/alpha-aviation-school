const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      console.log('Authorization Header:', req.headers.authorization);
      token = req.headers.authorization.split(' ')[1];
      console.log('Incoming Token:', token);
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token with aligned secret (process.env.JWT_SECRET is set in server.js)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      console.log('Admin Access Attempt by:', req.user?.email);
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Restrict routes to specific roles
exports.restrictTo = (...roles) => {
  return async (req, res, next) => {
    try {
      // This middleware should be used after protect middleware
      // req.user should already be set
      const user = await User.findById(req.user.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to perform this action'
        });
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};
