const User = require('../models/User');
const Payment = require('../models/Payment');
const { buildCourseSelections, getTotalCoursePrice } = require('../utils/courseCatalog');

// ─── Helper: generate unique student ID ─────────────────────────────────
const generateStudentIdNumber = async () => {
  let studentIdNumber = '';
  let exists = true;
  while (exists) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    studentIdNumber = `ASL-${new Date().getFullYear()}-${randomSuffix}`;
    exists = await User.exists({ studentIdNumber });
  }
  return studentIdNumber;
};

// ─── GET /api/agent/profile ──────────────────────────────────────────────
exports.getAgentProfile = async (req, res, next) => {
  try {
    const agent = await User.findById(req.user.userId).select('-password');
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

    res.status(200).json({
      success: true,
      data: {
        id: agent._id,
        email: agent.email,
        firstName: agent.firstName,
        lastName: agent.lastName,
        phone: agent.phone,
        agencyName: agent.agencyName,
        agentCode: agent.agentCode,
        agentStatus: agent.agentStatus,
        createdAt: agent.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/agent/stats ────────────────────────────────────────────────
exports.getAgentStats = async (req, res, next) => {
  try {
    const agentId = req.user.userId;
    const students = await User.find({ enrolledByAgent: agentId, role: 'student' });

    const totalStudents = students.length;
    const paidStudents = students.filter(s => s.paymentStatus === 'Paid').length;
    const pendingStudents = students.filter(s => s.paymentStatus !== 'Paid').length;
    const totalPaid = students
      .filter(s => s.paymentStatus === 'Paid')
      .reduce((sum, s) => sum + (s.amountPaid || 0), 0);
    const totalPending = students
      .filter(s => s.paymentStatus !== 'Paid')
      .reduce((sum, s) => sum + (s.amountDue || s.totalCoursePrice || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        paidStudents,
        pendingStudents,
        totalPaid,
        totalPending,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/agent/students ─────────────────────────────────────────────
exports.getAgentStudents = async (req, res, next) => {
  try {
    const students = await User.find({
      enrolledByAgent: req.user.userId,
      role: 'student',
    })
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

// ─── POST /api/agent/students/register ──────────────────────────────────
exports.registerStudent = async (req, res, next) => {
  try {
    const { email, firstName, lastName, phone, selectedCourses, password } = req.body;
    const agentId = req.user.userId;

    if (!email || !firstName || !lastName || !selectedCourses || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, name, courses, and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A student with this email already exists' });
    }

    const normalizedCourses = Array.isArray(selectedCourses)
      ? [...new Set(selectedCourses.filter(Boolean))].slice(0, 4)
      : [];

    if (normalizedCourses.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one course' });
    }

    const courseSelections = buildCourseSelections(normalizedCourses);
    if (courseSelections.length !== normalizedCourses.length) {
      return res.status(400).json({ success: false, message: 'One or more selected courses are invalid' });
    }

    const totalCoursePrice = getTotalCoursePrice(courseSelections);
    const studentIdNumber = await generateStudentIdNumber();

    // Normalize phone
    const normalizedPhone = typeof phone === 'string' && phone.replace(/\D/g, '')
      ? `+${phone.replace(/\D/g, '')}` : '';

    const student = await User.create({
      email: normalizedEmail,
      password,
      role: 'student',
      firstName,
      lastName,
      phone: normalizedPhone,
      enrolledCourse: normalizedCourses[0] || '',
      selectedCourses: normalizedCourses,
      courseSelections,
      paymentStatus: 'Pending',
      amountDue: totalCoursePrice,
      totalCoursePrice,
      studentIdNumber,
      status: 'active',
      isEmailVerified: true,           // agent vouches for the student
      enrolledByAgent: agentId,        // link to agent
      agentPaymentStatus: 'Pending',
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: {
        student: {
          id: student._id,
          email: student.email,
          firstName: student.firstName,
          lastName: student.lastName,
          studentIdNumber: student.studentIdNumber,
          totalCoursePrice: student.totalCoursePrice,
          selectedCourses: student.selectedCourses,
          paymentStatus: student.paymentStatus,
        },
        credentials: {
          email: normalizedEmail,
          password,            // agent can share with student
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/agent/students/:id/pay/upload ─────────────────────────────
// Agent uploads bank transfer receipt for a student
exports.uploadPaymentForStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { receiptUrl, amount } = req.body;
    const agentId = req.user.userId;

    if (!receiptUrl) {
      return res.status(400).json({ success: false, message: 'Receipt URL is required' });
    }

    const student = await User.findOne({ _id: id, enrolledByAgent: agentId, role: 'student' });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found or not enrolled under your account' });
    }

    if (student.paymentStatus === 'Paid') {
      return res.status(400).json({ success: false, message: 'Student tuition is already fully paid' });
    }

    const paymentAmount = amount === undefined || amount === null || amount === ''
      ? student.amountDue || student.totalCoursePrice
      : Number(amount);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero' });
    }

    const outstandingBalance = student.amountDue || student.totalCoursePrice || 0;
    if (outstandingBalance > 0 && paymentAmount > outstandingBalance) {
      return res.status(400).json({ success: false, message: 'Payment amount cannot exceed the outstanding balance' });
    }

    // Create payment record — agent's email as payer reference
    const agentDoc = await User.findById(agentId).select('email firstName lastName agentCode');
    const reference = `AGT-${agentId}-STU-${id}-${Date.now()}`;

    const payment = await Payment.create({
      student: student._id,
      amount: paymentAmount,
      status: 'pending_review',
      receiptUrl,
      reference,
      adminNotes: `Payment by Agent: ${agentDoc?.firstName || ''} ${agentDoc?.lastName || ''} (${agentDoc?.agentCode || agentId})`,
    });

    // Update student status to Under Review
    student.paymentStatus = 'Under Review';
    student.agentPaymentStatus = 'Pending';
    student.paymentReceiptUrl = receiptUrl;
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Receipt uploaded. Awaiting admin approval.',
      data: {
        paymentId: payment._id,
        reference,
        studentId: student._id,
        amount: paymentAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/agent/students/:id/pay/paystack ────────────────────────────
// Agent pays for a student via Paystack
exports.paystackPayForStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reference } = req.body;
    const agentId = req.user.userId;

    if (!reference) {
      return res.status(400).json({ success: false, message: 'Paystack transaction reference is required' });
    }

    const student = await User.findOne({ _id: id, enrolledByAgent: agentId, role: 'student' });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found or not enrolled under your account' });
    }

    if (student.paymentStatus === 'Paid') {
      return res.status(400).json({ success: false, message: 'Student tuition is already fully paid' });
    }

    // Verify Paystack transaction
    const axios = require('axios');
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } },
    );

    const { status, data } = response.data;
    if (!status || data.status !== 'success') {
      return res.status(400).json({ success: false, message: 'Paystack verification failed. Transaction may not be successful.' });
    }

    const paidAmount = data.amount / 100;
    const agentDoc = await User.findById(agentId).select('email firstName lastName agentCode');
    const paymentReference = `AGT-${agentId}-STU-${id}-${Date.now()}`;

    const payment = await Payment.create({
      student: student._id,
      amount: paidAmount,
      status: 'approved',
      receiptUrl: 'Paystack Online Payment',
      reference: paymentReference,
      adminNotes: `Paystack payment by Agent: ${agentDoc?.firstName || ''} ${agentDoc?.lastName || ''} (${agentDoc?.agentCode || agentId})`,
    });

    // Update student financials
    student.amountPaid = (student.amountPaid || 0) + paidAmount;
    student.amountDue = Math.max(0, (student.totalCoursePrice || student.amountDue || 0) - paidAmount);

    if (student.amountDue <= 0) {
      student.paymentStatus = 'Paid';
      student.agentPaymentStatus = 'Paid';
      if (!student.paymentConfirmedAt) {
        student.paymentConfirmedAt = new Date();
      }
    } else {
      student.agentPaymentStatus = 'Paid';
    }

    await student.save();

    // Initialize course tracks if fully paid
    const { initializeCourseTracks } = require('../utils/courseTrackService');
    if (student.paymentStatus === 'Paid') {
      await initializeCourseTracks(student);
    }

    res.status(200).json({
      success: true,
      message: 'Payment successful via Paystack',
      data: {
        paymentId: payment._id,
        reference: paymentReference,
        amount: paidAmount,
        studentPaymentStatus: student.paymentStatus,
        agentPaymentStatus: student.agentPaymentStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/agent/payments ─────────────────────────────────────────────
exports.getAgentPayments = async (req, res, next) => {
  try {
    const agentId = req.user.userId;

    // Find all students of this agent
    const studentIds = await User.find({ enrolledByAgent: agentId, role: 'student' }).select('_id');
    const ids = studentIds.map(s => s._id);

    const payments = await Payment.find({ student: { $in: ids } })
      .populate('student', 'firstName lastName email studentIdNumber')
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
