const User = require('../models/User');
const { mockStudents } = require('../utils/mockData');

// Update student profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { phone, bio, emergencyContact } = req.body;
    const userId = req.user.userId;

    if (global.useMockData) {
      // Find mock student and update
      const student = mockStudents.find(s => s._id === userId) || mockStudents[0];
      if (phone !== undefined) student.phone = phone;
      if (bio !== undefined) student.bio = bio;
      if (emergencyContact !== undefined) student.emergencyContact = emergencyContact;

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully (Mock Mode)',
        data: {
          user: {
            id: student._id,
            email: student.email,
            firstName: student.firstName,
            lastName: student.lastName,
            phone: student.phone || phone || '',
            emergencyContact: student.emergencyContact || emergencyContact || '',
            bio: student.bio || bio || '',
            documentUrl: student.documentUrl || ''
          }
        }
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can update their profile'
      });
    }

    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (emergencyContact !== undefined) user.emergencyContact = emergencyContact;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          emergencyContact: user.emergencyContact,
          bio: user.bio,
          documentUrl: user.documentUrl
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Upload document
exports.uploadDocument = async (req, res, next) => {
  try {
    const { documentUrl } = req.body;
    const userId = req.user.userId;

    if (global.useMockData) {
      const student = mockStudents.find(s => s._id === userId) || mockStudents[0];
      student.documentUrl = documentUrl;

      return res.status(200).json({
        success: true,
        message: 'Document uploaded successfully (Mock Mode)',
        data: {
          documentUrl: student.documentUrl
        }
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.documentUrl = documentUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        documentUrl: user.documentUrl
      }
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
        message: 'Receipt URL is required'
      });
    }

    if (global.useMockData) {
      const student = mockStudents.find(s => s._id === userId) || mockStudents[0];
      student.paymentReceiptUrl = receiptUrl;
      student.status = 'Payment Received';

      return res.status(200).json({
        success: true,
        message: 'Payment receipt uploaded successfully (Mock Mode)',
        data: {
          paymentReceiptUrl: student.paymentReceiptUrl,
          status: student.status
        }
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can upload payment receipts'
      });
    }

    user.paymentReceiptUrl = receiptUrl;
    // Update status to Payment Received (admin will verify and activate)
    user.status = 'Payment Received';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Payment receipt uploaded successfully. Our team will verify your payment shortly.',
      data: {
        paymentReceiptUrl: user.paymentReceiptUrl,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};
