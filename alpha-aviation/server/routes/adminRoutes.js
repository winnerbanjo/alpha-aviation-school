const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const userController = require("../controllers/userController");
const { protect } = require("../middleware/protect");
const { adminOnly } = require("../middleware/adminOnly");

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

router.get("/test", adminController.getTest);
router.get("/students", adminController.getAllStudents);
router.get("/financial-stats", adminController.getFinancialStats);
router.patch(
  "/students/batch-payment",
  adminController.batchUpdatePaymentStatus,
);
router.patch("/students/:id/status", adminController.updateStudentStatus);
router.patch("/students/:id/course", adminController.updateStudentCourse);
router.patch("/students/:id", adminController.updatePaymentStatus);

// User management routes
router.post("/users", userController.createUser);
router.put("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deleteUser);
router.post("/users/bulk-import", userController.bulkImportUsers);
router.post("/users/bulk-delete", userController.bulkDeleteUsers);
router.post("/users/bulk-status", userController.bulkUpdateUserStatus);
router.post("/users/:id/certificate", userController.uploadCertificate);

module.exports = router;
