const jwt = require('jsonwebtoken');

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
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Restrict routes to specific roles
exports.restrictTo = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to perform this action'
        });
      }
      
      return next();
    } catch (error) {
      return next(error);
    }
  };
};
