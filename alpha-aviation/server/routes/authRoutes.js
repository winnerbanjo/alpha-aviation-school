const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/authController");
const { protect } = require("../middleware/protect");

// Stricter rate limit for login to prevent brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per IP
  message: {
    success: false,
    message: "Too many login attempts, please try again in 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for register
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message: {
    success: false,
    message: "Too many accounts created, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes with rate limiting
router.post("/register", registerLimiter, authController.register);
router.post("/login", loginLimiter, authController.login);
router.post("/contact", authController.sendContactMessage);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Protected routes
router.get("/profile", protect, authController.getProfile);

module.exports = router;
