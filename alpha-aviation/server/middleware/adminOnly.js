const User = require('../models/User');
const { mockAdmin } = require('../utils/mockData');

// Restrict routes to admin role only
exports.adminOnly = async (req, res, next) => {
  try {
    // In mock mode, check if user is admin
    if (global.useMockData) {
      const userId = req.user?.userId || '';
      if (userId.includes('admin') || userId === 'mock-admin') {
        return next();
      }
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }

    // This middleware should be used after protect middleware
    // req.user should already be set
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'admin') {
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
