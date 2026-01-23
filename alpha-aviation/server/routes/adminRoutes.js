const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/protect');
const { adminOnly } = require('../middleware/adminOnly');

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

router.get('/students', adminController.getAllStudents);
router.get('/financial-stats', adminController.getFinancialStats);
router.patch('/students/:id', adminController.updatePaymentStatus);
router.patch('/students/:id/course', adminController.updateStudentCourse);
router.patch('/students/batch-payment', adminController.batchUpdatePaymentStatus);

module.exports = router;
