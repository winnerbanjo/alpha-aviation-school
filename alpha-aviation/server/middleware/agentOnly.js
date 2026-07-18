// Restrict routes to approved agents only
exports.agentOnly = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'agent') {
      return res.status(403).json({
        success: false,
        message: 'Agent access only',
      });
    }

    // agentStatus is verified inside protect.js already, but double-check here
    if (req.user.agentStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your agent account is pending approval',
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
