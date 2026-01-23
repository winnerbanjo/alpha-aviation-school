const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect } = require('../middleware/protect');

// All student routes require authentication
router.use(protect);

router.patch('/profile', studentController.updateProfile);
router.post('/upload-document', studentController.uploadDocument);

module.exports = router;
