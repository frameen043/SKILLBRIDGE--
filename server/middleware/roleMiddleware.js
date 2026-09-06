const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(403).json({
        message: "Forbidden. User information not found.",
      });
    }

    // Check if user's role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden. You do not have permission to access this resource.",
      });
    }

    next();
  };
};

module.exports = authorize;