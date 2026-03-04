const User = require('../models/User');

// Test connection: returns total student count from MongoDB (Admin Only)
exports.getTest = async (req, res, next) => {
  try {
    const totalStudents = global.useMockData
      ? 0
      : await User.countDocuments({ role: 'student' });
    res.status(200).json({
      success: true,
      message: 'Connection active',
      data: { totalStudents }
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
          students: []
        }
      });
    }

    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });

    const list = Array.isArray(students) ? students : [];
    res.status(200).json({
      success: true,
      count: list.length,
      data: {
        students: list
      }
    });
  } catch (error) {
    res.status(503).json({
      success: true,
      count: 0,
      data: {
        students: []
      },
      message: 'Database unavailable. No demo data returned.'
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
          revenuePending: 0
        }
      });
    }

    const students = await User.find({ role: 'student' });
    
    // Calculate total revenue from all paid students (use amountPaid if available, otherwise amountDue)
    const totalRevenue = students
      .filter((s) => s.paymentStatus === 'Paid')
      .reduce((sum, s) => {
        // If amountPaid exists, use it; otherwise use the original amountDue
        const paidAmount = s.amountPaid || (s.amountDue > 0 ? s.amountDue : 0);
        return sum + paidAmount;
      }, 0);
    
    const revenuePending = students
      .filter((s) => s.paymentStatus === 'Pending')
      .reduce((sum, s) => sum + s.amountDue, 0);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        revenuePending
      }
    });
  } catch (error) {
    res.status(503).json({
      success: true,
      data: {
        totalRevenue: 0,
        revenuePending: 0
      },
      message: 'Database unavailable. No demo data returned.'
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
        message: 'Database unavailable. Demo mode is disabled for admin actions.'
      });
    }

    const student = await User.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    if (student.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: 'User is not a student'
      });
    }

    // Toggle payment status
    student.paymentStatus = student.paymentStatus === 'Pending' ? 'Paid' : 'Pending';
    
    // If marking as paid, set amountPaid and amountDue to 0
    if (student.paymentStatus === 'Paid') {
      student.amountPaid = student.amountDue;
      student.amountDue = 0;
    }

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
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
          enrollmentDate: student.enrollmentDate
        }
      }
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
        message: 'Please provide an array of student IDs'
      });
    }

    if (global.useMockData) {
      return res.status(503).json({
        success: false,
        message: 'Database unavailable. Demo mode is disabled for admin actions.'
      });
    }

    const students = await User.find({ 
      _id: { $in: studentIds },
      role: 'student'
    });

    const updates = students.map(async (student) => {
      student.paymentStatus = 'Paid';
      student.amountPaid = student.amountDue;
      student.amountDue = 0;
      return student.save();
    });

    await Promise.all(updates);

    res.status(200).json({
      success: true,
      message: `Payment status updated for ${students.length} students`,
      data: {
        count: students.length
      }
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
        message: 'Database unavailable. Demo mode is disabled for admin actions.'
      });
    }

    const student = await User.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    if (student.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: 'User is not a student'
      });
    }

    student.enrolledCourse = enrolledCourse;
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Student course updated successfully',
      data: {
        student: {
          id: student._id,
          email: student.email,
          enrolledCourse: student.enrolledCourse
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
