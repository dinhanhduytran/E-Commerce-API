const adminAuth = async (req, res, next) => {
  // req.user
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      message: "Access denied, admin only",
    });
  }
  next();
};

export default adminAuth;
