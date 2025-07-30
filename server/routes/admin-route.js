const express = require("express");
const { getAdminPaymentRevenue } = require("../controller/admin-controller");
const verifyToken = require("../middleware/verify-token");
const verifyAdmin = require("../middleware/verify-admin");

const adminRouter = express.Router();

// Apply both verifyToken and verifyAdmin middleware to all admin routes
adminRouter.use(verifyToken);
adminRouter.use(verifyAdmin);

// Get admin payment revenue
adminRouter.get("/payment-revenue", getAdminPaymentRevenue);

module.exports = adminRouter; 