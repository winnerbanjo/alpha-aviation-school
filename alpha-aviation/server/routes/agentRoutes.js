const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const { protect } = require('../middleware/protect');
const { agentOnly } = require('../middleware/agentOnly');

// All agent routes require authentication + approved agent status
router.use(protect);
router.use(agentOnly);

// Profile & stats
router.get('/profile', agentController.getAgentProfile);
router.get('/stats', agentController.getAgentStats);

// Student management
router.get('/students', agentController.getAgentStudents);
router.post('/students/register', agentController.registerStudent);

// Payments for students
router.post('/students/:id/pay/upload', agentController.uploadPaymentForStudent);
router.post('/students/:id/pay/paystack', agentController.paystackPayForStudent);

// Payment history
router.get('/payments', agentController.getAgentPayments);

module.exports = router;
