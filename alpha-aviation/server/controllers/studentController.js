const User = require("../models/User");
const Payment = require("../models/Payment");
const Notification = require("../models/Notification");
const {
  notifyPaymentConfirmed,
  notifyReceiptUploaded,
} = require("../utils/paymentNotifications");
const { mockStudents } = require("../utils/mockData");
const axios = require("axios");

const normalizePhone = (phone) =>
  typeof phone === "string" && phone.replace(/\D/g, "")
    ? `+${phone.replace(/\D/g, "")}`
    : "";

const isValidPhone = (phone) => {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
};

exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = notifications.filter((notification) => !notification.readAt).length;

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: { notifications, unreadCount },
    });
  } catch (error) {
    next(error);
  }
};

exports.markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { $set: { readAt: new Date() } },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
};

exports.markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user.userId, readAt: null },
      { $set: { readAt: new Date() } },
    );

    res.status(200).json({
      success: true,
      message: "Notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};

// Verify Paystack payment
exports.verifyPaystackPayment = async (req, res, next) => {
  try {
    const { reference } = req.body;
    const userId = req.user.userId;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Transaction reference is required",
      });
    }

    // Call Paystack API to verify
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const { status, data } = response.data;

    if (status && data.status === "success") {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const existingPayment = await Payment.findOne({
        reference,
        status: "approved",
      });

      if (existingPayment) {
        return res.status(200).json({
          success: true,
          message: "Payment already verified",
          data: {
            paymentStatus: user.paymentStatus,
            amountPaid: user.amountPaid,
            amountDue: user.amountDue,
          },
        });
      }

      user.paymentStatus = "Paid";
      const paidAmount = data.amount / 100;
      user.amountPaid = (user.amountPaid || 0) + paidAmount;
      user.amountDue = Math.max(0, (user.amountDue || 0) - paidAmount);

      await user.save();

      // Create payment record
      const payment = await Payment.create({
        student: userId,
        amount: paidAmount,
        status: "approved",
        receiptUrl: "Paystack Online Payment",
        reference: reference,
        adminNotes: "Verified via Paystack transaction",
      });

      await notifyPaymentConfirmed({
        student: user,
        payment,
        source: "Paystack",
      });

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        data: {
          paymentStatus: user.paymentStatus,
          amountPaid: user.amountPaid,
          amountDue: user.amountDue,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }
  } catch (error) {
    console.error(
      "Paystack Verification Error:",
      error.response?.data || error.message,
    );
    res.status(500).json({
      success: false,
      message: "Error verifying payment with Paystack",
    });
  }
};

// Update student profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { phone, bio, emergencyContact, firstName, lastName } = req.body;
    const userId = req.user.userId;
    const normalizedPhone = phone !== undefined ? normalizePhone(phone) : undefined;

    if (normalizedPhone !== undefined && normalizedPhone && !isValidPhone(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number",
      });
    }

    if (global.useMockData) {
      const student =
        mockStudents.find((s) => s._id === userId) || mockStudents[0];
      if (firstName !== undefined) student.firstName = firstName;
      if (lastName !== undefined) student.lastName = lastName;
      if (normalizedPhone !== undefined) student.phone = normalizedPhone;
      if (bio !== undefined) student.bio = bio;
      if (emergencyContact !== undefined)
        student.emergencyContact = emergencyContact;

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully (Mock Mode)",
        data: {
          user: {
            id: student._id,
            email: student.email,
            firstName: student.firstName,
            lastName: student.lastName,
            phone: student.phone || normalizedPhone || "",
            emergencyContact:
              student.emergencyContact || emergencyContact || "",
            bio: student.bio || bio || "",
            documentUrl: student.documentUrl || "",
          },
        },
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can update their profile",
      });
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (normalizedPhone !== undefined) user.phone = normalizedPhone;
    if (bio !== undefined) user.bio = bio;
    if (emergencyContact !== undefined)
      user.emergencyContact = emergencyContact;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          emergencyContact: user.emergencyContact,
          bio: user.bio,
          documentUrl: user.documentUrl,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Add or update student phone number
exports.updatePhone = async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const userId = req.user.userId;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number",
      });
    }

    if (global.useMockData) {
      const student =
        mockStudents.find((s) => s._id === userId) || mockStudents[0];
      student.phone = phone;

      return res.status(200).json({
        success: true,
        message: "Phone number updated successfully (Mock Mode)",
        data: {
          user: {
            id: student._id,
            email: student.email,
            firstName: student.firstName,
            lastName: student.lastName,
            phone: student.phone,
          },
        },
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can update their phone number",
      });
    }

    user.phone = phone;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Phone number updated successfully",
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Upload identity document
exports.uploadDocument = async (req, res, next) => {
  try {
    const { documentUrl } = req.body;
    const userId = req.user.userId;

    if (global.useMockData) {
      const student =
        mockStudents.find((s) => s._id === userId) || mockStudents[0];
      student.documentUrl = documentUrl;

      return res.status(200).json({
        success: true,
        message: "Document uploaded successfully (Mock Mode)",
        data: { documentUrl: student.documentUrl },
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.documentUrl = documentUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Document uploaded successfully",
      data: { documentUrl: user.documentUrl },
    });
  } catch (error) {
    next(error);
  }
};

// Upload payment receipt
exports.uploadPaymentReceipt = async (req, res, next) => {
  try {
    const { receiptUrl } = req.body;
    const userId = req.user.userId;

    if (!receiptUrl) {
      return res.status(400).json({
        success: false,
        message: "Receipt URL is required",
      });
    }

    if (global.useMockData) {
      const student =
        mockStudents.find((s) => s._id === userId) || mockStudents[0];
      student.paymentReceiptUrl = receiptUrl;
      student.paymentStatus = "Under Review";

      return res.status(200).json({
        success: true,
        message: "Payment receipt uploaded successfully (Mock Mode)",
        data: {
          paymentReceiptUrl: student.paymentReceiptUrl,
          paymentStatus: student.paymentStatus,
        },
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can upload payment receipts",
      });
    }

    // Create a Payment record for audit trail
    const payment = await Payment.create({
      student: userId,
      amount: user.amountDue || user.totalCoursePrice || 0,
      status: "pending_review",
      receiptUrl,
      reference: `INV-${new Date().getFullYear()}-${user.studentIdNumber || user._id.toString().slice(-4)}`,
    });

    // Update user's latest receipt and payment status
    user.paymentReceiptUrl = receiptUrl;
    user.paymentStatus = "Under Review";
    await user.save();

    await notifyReceiptUploaded({ student: user, payment });

    res.status(200).json({
      success: true,
      message:
        "Payment receipt uploaded successfully. Our team will verify your payment shortly.",
      data: {
        paymentReceiptUrl: user.paymentReceiptUrl,
        paymentStatus: user.paymentStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};
