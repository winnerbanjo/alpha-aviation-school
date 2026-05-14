const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const resourceController = require('../controllers/resourceController');
const { protect } = require('../middleware/protect');

// All student routes require authentication
router.use(protect);

router.get('/notifications', studentController.getNotifications);
router.patch('/notifications/read-all', studentController.markAllNotificationsRead);
router.patch('/notifications/:id/read', studentController.markNotificationRead);
router.get('/resources', resourceController.getStudentResources);
router.patch('/profile', studentController.updateProfile);
router.post('/upload-document', studentController.uploadDocument);
router.post('/upload-payment-receipt', studentController.uploadPaymentReceipt);
router.post('/verify-paystack', studentController.verifyPaystackPayment);

module.exports = router;
