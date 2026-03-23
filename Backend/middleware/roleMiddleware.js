const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user exists (protect middleware must run before this)
      if (!req.user) {
        return res.status(401).json({
          message: "Not authorized. Please login.",
        });
      }

      // Check if user role is allowed
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: `Access denied. Role '${req.user.role}' is not allowed.`,
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};

module.exports = authorizeRoles;