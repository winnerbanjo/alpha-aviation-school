const User = require("../models/User");
const Payment = require("../models/Payment");
const {
  notifyPaymentConfirmed,
  notifyPaymentRejected,
} = require("../utils/paymentNotifications");
const {
  initializeCourseTracks,
} = require("../utils/courseTrackService");

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

    const filter = { role: "student" };
    if (req.query.excludeAgentStudents === 'true') {
      filter.enrolledByAgent = null;
    }
    const students = await User.find(filter)
      .select("-password")
      .populate("enrolledByAgent", "firstName lastName email agencyName agentCode")
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
      // Stamp payment confirmation time (only on first confirmation)
      if (!student.paymentConfirmedAt) {
        student.paymentConfirmedAt = new Date();
      }
    }

    await student.save();

    if (student.paymentStatus === "Paid") {
      await initializeCourseTracks(student);
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
      if (!student.paymentConfirmedAt) {
        student.paymentConfirmedAt = new Date();
      }
      await student.save();
      await initializeCourseTracks(student);

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
      if (student.enrolledByAgent) {
        student.agentPaymentStatus = "Paid";
      }
      // Stamp payment confirmation time (only on first confirmation)
      if (!student.paymentConfirmedAt) {
        student.paymentConfirmedAt = new Date();
      }
    } else if (student.enrolledByAgent) {
      student.agentPaymentStatus = "Pending";
    }

    await student.save();

    // Initialise 4-week course tracks for each enrolled course
    if (student.paymentStatus === "Paid") {
      await initializeCourseTracks(student);
    }

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
    if (student.enrolledByAgent) {
      student.agentPaymentStatus = "Pending";
    }
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
// ─── AGENT MANAGEMENT ────────────────────────────────────────────────────

// Get all agents (all statuses)
exports.getAllAgents = async (req, res, next) => {
  try {
    const agents = await User.find({ role: 'agent' }).select('-password').sort({ createdAt: -1 });
    // Enrich with student count per agent
    const enriched = await Promise.all(
      agents.map(async (agent) => {
        const studentCount = await User.countDocuments({ enrolledByAgent: agent._id, role: 'student' });
        return { ...agent.toObject(), studentCount };
      })
    );
    res.status(200).json({ success: true, count: enriched.length, data: { agents: enriched } });
  } catch (error) {
    next(error);
  }
};

// Get only pending agents (for Agent Requests tab)
exports.getPendingAgents = async (req, res, next) => {
  try {
    const agents = await User.find({ role: 'agent', agentStatus: 'pending' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: agents.length, data: { agents } });
  } catch (error) {
    next(error);
  }
};

// Approve an agent
exports.approveAgent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const agent = await User.findOne({ _id: id, role: 'agent' });
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

    agent.agentStatus = 'approved';
    await agent.save();

    // Email the agent
    const { sendMail } = require('../utils/mailer');
    const clientUrl = process.env.CLIENT_URL || 'https://www.aslaviationschool.co';
    try {
      await sendMail({
        to: agent.email,
        subject: 'Agent Account Approved — Alpha Step Links Aviation School',
        text: `Hello ${agent.firstName},\n\nGreat news! Your agent account has been approved.\n\nYour Agent Code: ${agent.agentCode}\n\nYou can now log in and start registering students: ${clientUrl}/agent/login\n\nThank you for partnering with us.`,
        html: `<div style="font-family:sans-serif;padding:24px;max-width:560px"><div style="background:#020617;padding:24px;border-radius:10px 10px 0 0;text-align:center"><h1 style="color:#fff;margin:0;font-size:22px">Alpha Step Links</h1><p style="color:#94a3b8;margin:4px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:2px">Aviation School</p></div><div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 10px 10px"><h2 style="color:#0f172a;font-size:20px;margin:0 0 16px">Your Agent Account is Approved! 🎉</h2><p style="color:#475569;line-height:1.6">Hello ${agent.firstName},</p><p style="color:#475569;line-height:1.6">Your application has been reviewed and approved. You can now log in to your agent dashboard and start registering students.</p><div style="background:#f1f5f9;border-radius:8px;padding:16px;margin:20px 0"><p style="margin:0 0 4px;color:#64748b;font-size:12px;text-transform:uppercase;font-weight:700">Your Agent Code</p><p style="margin:0;color:#4f46e5;font-size:22px;font-weight:700;letter-spacing:4px">${agent.agentCode}</p></div><a href="${clientUrl}/agent/login" style="display:inline-block;background:#4f46e5;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">Access Agent Dashboard</a></div></div>`,
      });
    } catch (_) { /* non-blocking */ }

    res.status(200).json({
      success: true,
      message: 'Agent approved successfully',
      data: { agent: { id: agent._id, email: agent.email, agentStatus: agent.agentStatus, agentCode: agent.agentCode } },
    });
  } catch (error) {
    next(error);
  }
};

// Reject an agent
exports.rejectAgent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'A rejection reason is required' });
    }

    const agent = await User.findOne({ _id: id, role: 'agent' });
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

    agent.agentStatus = 'rejected';
    agent.agentNotes = reason.trim();
    await agent.save();

    const { sendMail } = require('../utils/mailer');
    try {
      await sendMail({
        to: agent.email,
        subject: 'Agent Application Update — Alpha Step Links Aviation School',
        text: `Hello ${agent.firstName},\n\nWe have reviewed your agent application and unfortunately we are unable to approve it at this time.\n\nReason: ${reason.trim()}\n\nIf you believe this is an error, please contact our support team.`,
        html: `<div style="font-family:sans-serif;padding:24px;max-width:560px"><div style="background:#020617;padding:24px;border-radius:10px 10px 0 0;text-align:center"><h1 style="color:#fff;margin:0;font-size:22px">Alpha Step Links</h1><p style="color:#94a3b8;margin:4px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:2px">Aviation School</p></div><div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 10px 10px"><h2 style="color:#0f172a;font-size:20px;margin:0 0 16px">Application Update</h2><p style="color:#475569;line-height:1.6">Hello ${agent.firstName},</p><p style="color:#475569;line-height:1.6">We have reviewed your agent application and are unable to approve it at this time.</p><div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:20px 0"><p style="margin:0 0 4px;color:#dc2626;font-size:12px;text-transform:uppercase;font-weight:700">Reason</p><p style="margin:0;color:#7f1d1d;font-size:14px">${reason.trim()}</p></div><p style="color:#64748b;font-size:13px">If you believe this is an error, please contact our support team.</p></div></div>`,
      });
    } catch (_) { /* non-blocking */ }

    res.status(200).json({
      success: true,
      message: 'Agent rejected',
      data: { agent: { id: agent._id, email: agent.email, agentStatus: agent.agentStatus } },
    });
  } catch (error) {
    next(error);
  }
};

// Suspend an agent
exports.suspendAgent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const agent = await User.findOne({ _id: id, role: 'agent' });
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

    agent.agentStatus = 'suspended';
    await agent.save();

    res.status(200).json({
      success: true,
      message: 'Agent suspended',
      data: { agent: { id: agent._id, email: agent.email, agentStatus: agent.agentStatus } },
    });
  } catch (error) {
    next(error);
  }
};

// Reactivate a suspended/rejected agent
exports.reactivateAgent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const agent = await User.findOne({ _id: id, role: 'agent' });
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

    agent.agentStatus = 'approved';
    await agent.save();

    res.status(200).json({
      success: true,
      message: 'Agent reactivated',
      data: { agent: { id: agent._id, email: agent.email, agentStatus: agent.agentStatus } },
    });
  } catch (error) {
    next(error);
  }
};

// Get students enrolled under a specific agent (admin view)
exports.getAgentStudentsAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const students = await User.find({ enrolledByAgent: id, role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: { students },
    });
  } catch (error) {
    next(error);
  }
};
