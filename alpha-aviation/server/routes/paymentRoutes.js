const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// All payment routes require authentication
router.use(protect);

router.post('/', paymentController.createPayment);
router.get('/', paymentController.getUserPayments);
router.get('/:id', paymentController.getPaymentById);
router.patch('/:id/status', paymentController.updatePaymentStatus);

module.exports = router;
