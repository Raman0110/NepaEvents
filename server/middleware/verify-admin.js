/**
 * Middleware to verify if the user is an admin
 */
const verifyAdmin = (req, res, next) => {
  try {
    // User data is already set by the verifyToken middleware
    if (!req.user || !req.user.user) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }

    // Check if user has admin role
    if (req.user.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    // User is admin, proceed to next middleware
    next();
  } catch (error) {
    console.error("Admin verification error:", error);
    res.status(500).json({ message: "Server error during admin verification" });
  }
};

module.exports = verifyAdmin; 