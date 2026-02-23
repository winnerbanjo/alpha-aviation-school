// Restrict routes to admin role only
exports.adminOnly = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden'
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
