const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (global.useMockData) {
      req.user = {
        userId: decoded.userId,
        role: decoded.role || (String(decoded.userId || '').includes('admin') ? 'admin' : 'student'),
      };
      return next();
    }

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
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};
