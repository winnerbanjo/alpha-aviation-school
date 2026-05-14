const User = require("../models/User");
const Payment = require("../models/Payment");
const {
  notifyPaymentConfirmed,
  notifyPaymentRejected,
} = require("../utils/paymentNotifications");

const getStudentValue = (student) => {
  if ((student.amountPaid || 0) > 0) return student.amountPaid || 0;
  if ((student.amountDue || 0) > 0) return student.amountDue || 0;
  if ((student.totalCoursePrice || 0) > 0) return student.totalCoursePrice || 0;
  if (Array.isArray(student.courseSelections)) {
    return student.courseSelections.reduce(
      (sum, course) => sum + (course.price || 0),
      0,
    );
  }
  return 0;
};

// Test connection: returns total student count from MongoDB (Admin Only)
exports.getTest = async (req, res, next) => {
  try {
    const totalStudents = global.useMockData
      ? 0
      : await User.countDocuments({ role: "student" });
    res.status(200).json({
      success: true,
      message: "Connection active",
      data: { totalStudents },
    });
  } catch (error) {
    next(error);
  }
};

// Get all students (Admin Only)
exports.getAllStudents = async (req, res, next) => {
  try {
    if (global.useMockData) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: {
          students: [],
        },
      });
    }

    const students = await User.find({ role: "student" })
      .select("-password")
      .sort({ createdAt: -1 });

    const list = Array.isArray(students) ? students : [];
    res.status(200).json({
      success: true,
      count: list.length,
      data: {
        students: list,
      },
    });
  } catch (error) {
    res.status(503).json({
      success: true,
      count: 0,
      data: {
        students: [],
      },
      message: "Database unavailable. No demo data returned.",
    });
  }
};

// Get financial stats
exports.getFinancialStats = async (req, res, next) => {
  try {
    if (global.useMockData) {
      return res.status(200).json({
        success: true,
        data: {
          totalRevenue: 0,
          revenuePending: 0,
        },
      });
    }

    const students = await User.find({ role: "student" });

    const totalRevenue = students
      .filter((s) => s.paymentStatus === "Paid")
      .reduce((sum, s) => sum + getStudentValue(s), 0);

    const revenuePending = students
      .filter((s) => s.paymentStatus === "Pending")
      .reduce((sum, s) => sum + getStudentValue(s), 0);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        revenuePending,
      },
    });
  } catch (error) {
    res.status(503).json({
      success: true,
      data: {
        totalRevenue: 0,
        revenuePending: 0,
      },
      message: "Database unavailable. No demo data returned.",
    });
  }
};

// Update payment status (Admin Only) - Toggle between Pending/Paid
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (global.useMockData) {
      return res.status(503).json({
        success: false,
        message:
          "Database unavailable. Demo mode is disabled for admin actions.",
      });
    }

    const student = await User.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (student.role !== "student") {
      return res.status(400).json({
        success: false,
        message: "User is not a student",
      });
    }

    // Toggle payment status
    student.paymentStatus =
      student.paymentStatus === "Pending" ? "Paid" : "Pending";

    // If marking as paid, set amountPaid and amountDue to 0
    if (student.paymentStatus === "Paid") {
      student.amountPaid = student.amountDue;
      student.amountDue = 0;
    }

    await student.save();

    if (student.paymentStatus === "Paid") {
      await notifyPaymentConfirmed({
        student,
        payment: { amount: student.amountPaid },
        source: "Admin Manual Update",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: {
        student: {
          id: student._id,
          email: student.email,
          firstName: student.firstName,
          lastName: student.lastName,
          enrolledCourse: student.enrolledCourse,
          paymentStatus: student.paymentStatus,
          amountDue: student.amountDue,
          amountPaid: student.amountPaid,
          enrollmentDate: student.enrollmentDate,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Batch update payment status
exports.batchUpdatePaymentStatus = async (req, res, next) => {
  try {
    const { studentIds } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of student IDs",
      });
    }

    if (global.useMockData) {
      return res.status(503).json({
        success: false,
        message:
          "Database unavailable. Demo mode is disabled for admin actions.",
      });
    }

    const students = await User.find({
      _id: { $in: studentIds },
      role: "student",
    });

    const updates = students.map(async (student) => {
      student.paymentStatus = "Paid";
      student.amountPaid = student.amountDue;
      student.amountDue = 0;
      await student.save();

      await notifyPaymentConfirmed({
        student,
        payment: { amount: student.amountPaid },
        source: "Admin Batch Update",
      });
    });

    await Promise.all(updates);

    res.status(200).json({
      success: true,
      message: `Payment status updated for ${students.length} students`,
      data: {
        count: students.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update student course
exports.updateStudentCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { enrolledCourse } = req.body;

    if (global.useMockData) {
      return res.status(503).json({
        success: false,
        message:
          "Database unavailable. Demo mode is disabled for admin actions.",
      });
    }

    const student = await User.findById(id);

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    if (student.role !== "student") {
      return res
        .status(400)
        .json({ success: false, message: "User is not a student" });
    }

    student.enrolledCourse = enrolledCourse;
    await student.save();

    res.status(200).json({
      success: true,
      message: "Student course updated successfully",
      data: {
        student: {
          id: student._id,
          email: student.email,
          enrolledCourse: student.enrolledCourse,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const STUDENT_STATUSES = ["active", "banned", "graduated", "suspended"];

exports.updateStudentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!STUDENT_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${STUDENT_STATUSES.join(", ")}`,
      });
    }

    if (global.useMockData) {
      return res.status(503).json({
        success: false,
        message:
          "Database unavailable. Demo mode is disabled for admin actions.",
      });
    }

    const student = await User.findById(id);

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    if (student.role !== "student") {
      return res
        .status(400)
        .json({ success: false, message: "User is not a student" });
    }

    student.status = status;
    await student.save();

    res.status(200).json({
      success: true,
      message: "Student status updated successfully",
      data: {
        student: {
          id: student._id,
          email: student.email,
          status: student.status,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all pending payment receipts for review
exports.getPendingPayments = async (req, res, next) => {
  try {
    if (global.useMockData) {
      return res.status(503).json({
        success: false,
        message: "Database unavailable. Demo mode is disabled for admin actions.",
      });
    }

    const payments = await Payment.find({ status: "pending_review" })
      .populate("student", "firstName lastName email studentIdNumber amountDue totalCoursePrice paymentReceiptUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: { payments },
    });
  } catch (error) {
    next(error);
  }
};

// Approve a payment
exports.approvePayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (global.useMockData) {
      return res.status(503).json({
        success: false,
        message: "Database unavailable. Demo mode is disabled for admin actions.",
      });
    }

    const payment = await Payment.findById(id).populate("student");
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    if (payment.status !== "pending_review") {
      return res.status(400).json({
        success: false,
        message: `Payment is already ${payment.status}`,
      });
    }

    const student = payment.student;
    if (!student || student.role !== "student") {
      return res.status(400).json({
        success: false,
        message: "Associated user is not a student",
      });
    }

    // Mark payment as approved
    payment.status = "approved";
    payment.reviewedBy = req.user.userId;
    payment.reviewedAt = new Date();
    await payment.save();

    // Update student financials
    student.amountPaid = (student.amountPaid || 0) + payment.amount;
    student.amountDue = Math.max(0, (student.totalCoursePrice || student.amountDue || 0) - payment.amount);

    if (student.amountDue <= 0) {
      student.paymentStatus = "Paid";
    }

    await student.save();

    await notifyPaymentConfirmed({
      student,
      payment,
      source: "Admin Receipt Approval",
    });

    res.status(200).json({
      success: true,
      message: "Payment approved successfully",
      data: {
        payment: {
          id: payment._id,
          amount: payment.amount,
          status: payment.status,
        },
        student: {
          id: student._id,
          email: student.email,
          paymentStatus: student.paymentStatus,
          amountDue: student.amountDue,
          amountPaid: student.amountPaid,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Reject a payment
exports.rejectPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "A rejection reason is required",
      });
    }

    if (global.useMockData) {
      return res.status(503).json({
        success: false,
        message: "Database unavailable. Demo mode is disabled for admin actions.",
      });
    }

    const payment = await Payment.findById(id).populate("student");
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    if (payment.status !== "pending_review") {
      return res.status(400).json({
        success: false,
        message: `Payment is already ${payment.status}`,
      });
    }

    const student = payment.student;
    if (!student || student.role !== "student") {
      return res.status(400).json({
        success: false,
        message: "Associated user is not a student",
      });
    }

    // Mark payment as rejected
    payment.status = "rejected";
    payment.adminNotes = reason.trim();
    payment.reviewedBy = req.user.userId;
    payment.reviewedAt = new Date();
    await payment.save();

    // Revert student payment status so they can upload again
    student.paymentStatus = "Pending";
    await student.save();

    await notifyPaymentRejected({
      student,
      payment,
      reason: reason.trim(),
    });

    res.status(200).json({
      success: true,
      message: "Payment rejected",
      data: {
        payment: {
          id: payment._id,
          status: payment.status,
          adminNotes: payment.adminNotes,
        },
        student: {
          id: student._id,
          paymentStatus: student.paymentStatus,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
