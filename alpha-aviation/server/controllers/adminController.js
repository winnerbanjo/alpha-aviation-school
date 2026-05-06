const User = require("../models/User");
const { sendMail } = require("../utils/mailer");

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

    // Send payment confirmation email when marking as Paid
    if (student.paymentStatus === "Paid") {
      try {
        const clientUrl =
          process.env.CLIENT_URL || "https://www.aslaviationschool.co";
        await sendMail({
          to: student.email,
          subject: "Payment Confirmed — Alpha Step Links Aviation School",
          text: `Hello ${student.firstName || "Student"},\n\nYour payment has been confirmed. Your account is now active and all course materials are unlocked.\n\nLog in to access your dashboard: ${clientUrl}/login`,
          html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; padding: 40px 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <tr>
                <td align="center" style="background-color: #020617; padding: 40px 20px;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Alpha Step Links</h1>
                  <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Aviation School</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 40px 20px 40px;">
                  <h2 style="color: #0f172a; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Payment Confirmed</h2>
                  <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">Hello ${student.firstName || "Student"},</p>
                  <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">Your payment has been successfully confirmed. All course materials and resources are now unlocked in your student portal.</p>
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center">
                        <a href="${clientUrl}/login" style="background-color: #0061FF; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">Access Your Dashboard</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">Alpha Step Links Aviation School ensures global standards in training.</p>
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Alpha Step Links. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </div>
          `,
        });
      } catch (mailError) {
        console.log("Payment confirmation email not sent:", mailError.message);
      }
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

    const clientUrl =
      process.env.CLIENT_URL || "https://www.aslaviationschool.co";

    const updates = students.map(async (student) => {
      student.paymentStatus = "Paid";
      student.amountPaid = student.amountDue;
      student.amountDue = 0;
      await student.save();

      try {
        await sendMail({
          to: student.email,
          subject: "Payment Confirmed — Alpha Step Links Aviation School",
          text: `Hello ${student.firstName || "Student"},\n\nYour payment has been confirmed. All course materials are now unlocked.\n\nLog in: ${clientUrl}/login`,
          html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; padding: 40px 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <tr>
                <td align="center" style="background-color: #020617; padding: 40px 20px;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Alpha Step Links</h1>
                  <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Aviation School</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 40px 20px 40px;">
                  <h2 style="color: #0f172a; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Payment Confirmed</h2>
                  <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">Hello ${student.firstName || "Student"},</p>
                  <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">Your payment has been confirmed. All course materials and resources are now unlocked.</p>
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center">
                        <a href="${clientUrl}/login" style="background-color: #0061FF; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">Access Your Dashboard</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="color: #64748b; font-size: 13px; margin: 0;">&copy; ${new Date().getFullYear()} Alpha Step Links. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </div>
          `,
        });
      } catch (mailError) {
        console.log(`Batch email failed for ${student.email}:`, mailError.message);
      }
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
