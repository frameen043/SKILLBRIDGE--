const checkProviderApproval = (req, res, next) => {
  // Check if the user is authenticated
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized. User authentication is required.",
    });
  }

  // Non-providers can continue
  if (req.user.role !== "provider") {
    return next();
  }

  // Check provider approval status
  if (req.user.status === "approved") {
    return next();
  }

  if (req.user.status === "pending") {
    return res.status(403).json({
      message: "Your provider account is waiting for admin approval.",
    });
  }

  if (req.user.status === "rejected") {
    return res.status(403).json({
      message: "Your provider account has been rejected.",
    });
  }

  if (req.user.status === "deactivated") {
    return res.status(403).json({
      message: "Your provider account has been deactivated.",
    });
  }

  // Handle any unexpected status
  return res.status(403).json({
    message: "Your provider account is not approved.",
  });
};

module.exports = checkProviderApproval;