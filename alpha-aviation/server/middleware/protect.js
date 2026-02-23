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
      
      // In mock mode, just attach decoded user
      if (global.useMockData) {
        req.user = decoded;
        return next();
      }
      
      // Get user from database
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists'
        });
      }

      req.user = {
        userId: user._id.toString(),
        role: user.role,
        email: user.email
      };

      console.log('Admin Access Attempt by:', req.user?.email);
      
      next();
    } catch (error) {
      // In mock mode, allow any token
      if (global.useMockData) {
        req.user = { userId: 'mock1' };
        return next();
      }
      
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    next(error);
  }
};
