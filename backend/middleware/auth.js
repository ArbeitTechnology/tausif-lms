const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin"); // Make sure to import your Admin model

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, "435345sdfsfd");

    // Check if admin still exists and is active
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(403).json({ message: "Admin account not found" });
    }

    if (admin.status !== "active") {
      return res.status(403).json({ message: "Admin account is not active" });
    }

    req.admin = admin; // Attach the full admin document to the request
    req.id = decoded.id;
    req.role = decoded.role;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token has expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token" });
    }
    console.error("Authentication error:", err);
    res
      .status(500)
      .json({ message: "Internal server error during authentication" });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Requires admin privileges.",
    });
  }
  next();
};

const authorizeSubAdmin = (req, res, next) => {
  if (!["admin", "subadmin"].includes(req.role)) {
    return res.status(403).json({
      message: "Access denied. Requires at least subadmin privileges.",
    });
  }
  next();
};

const checkAccountStatus = (requiredStatus) => {
  return (req, res, next) => {
    if (req.admin.status !== requiredStatus) {
      return res.status(403).json({
        message: `Access denied. Account must be ${requiredStatus}.`,
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeAdmin,
  authorizeSubAdmin,
  checkAccountStatus,
};
