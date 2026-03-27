const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/protect');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/contact', authController.sendContactMessage);

// Protected routes
router.get('/profile', protect, authController.getProfile);

module.exports = router;
