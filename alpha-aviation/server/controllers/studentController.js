const User = require('../models/User');
const Payment = require('../models/Payment');
const { sendMail } = require('../utils/mailer');
const { mockStudents } = require('../utils/mockData');

// Update student profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { phone, bio, emergencyContact } = req.body;
    const userId = req.user.userId;

    if (global.useMockData) {
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

// Upload identity document
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
        data: { documentUrl: student.documentUrl }
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
      data: { documentUrl: user.documentUrl }
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
      student.paymentStatus = 'Under Review';

      return res.status(200).json({
        success: true,
        message: 'Payment receipt uploaded successfully (Mock Mode)',
        data: {
          paymentReceiptUrl: student.paymentReceiptUrl,
          paymentStatus: student.paymentStatus
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

    // Create a Payment record for audit trail
    await Payment.create({
      student: userId,
      amount: user.amountDue || user.totalCoursePrice || 0,
      status: 'pending_review',
      receiptUrl,
      reference: `INV-${new Date().getFullYear()}-${user.studentIdNumber || user._id.toString().slice(-4)}`,
    });

    // Update user's latest receipt and payment status
    user.paymentReceiptUrl = receiptUrl;
    user.paymentStatus = 'Under Review';
    await user.save();

    // Notify admins about the new payment receipt
    try {
      const admins = await User.find({ role: 'admin' }).select('email');
      const adminEmails = admins.map(a => a.email).filter(Boolean);

      if (adminEmails.length > 0) {
        const clientUrl = process.env.CLIENT_URL || 'https://www.aslaviationschool.co';
        const amount = user.amountDue || user.totalCoursePrice || 0;

        await Promise.all(adminEmails.map(to => sendMail({
          to,
          subject: `New Payment Receipt — ${user.firstName || ''} ${user.lastName || ''}`,
          text: `A new payment receipt has been uploaded by ${user.firstName || 'Student'} ${user.lastName || ''} (${user.email}).\n\nAmount: ₦${amount.toLocaleString('en-NG')}\nReference: INV-${new Date().getFullYear()}-${user.studentIdNumber || user._id.toString().slice(-4)}\n\nReview it in your dashboard: ${clientUrl}/admin/payments`,
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
                    <h2 style="color: #0f172a; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">New Payment Receipt Uploaded</h2>
                    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">A student has uploaded a payment receipt that needs your review.</p>
                    <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; margin: 24px 0;">
                      <table width="100%" cellpadding="8" cellspacing="0">
                        <tr>
                          <td style="color: #64748b; font-size: 14px; font-weight: 600;">Student</td>
                          <td style="color: #0f172a; font-size: 14px; font-weight: 500;">${user.firstName || ''} ${user.lastName || ''}</td>
                        </tr>
                        <tr>
                          <td style="color: #64748b; font-size: 14px; font-weight: 600;">Email</td>
                          <td style="color: #0f172a; font-size: 14px;">${user.email}</td>
                        </tr>
                        <tr>
                          <td style="color: #64748b; font-size: 14px; font-weight: 600;">Amount</td>
                          <td style="color: #0f172a; font-size: 14px; font-weight: 600;">₦${amount.toLocaleString('en-NG')}</td>
                        </tr>
                        <tr>
                          <td style="color: #64748b; font-size: 14px; font-weight: 600;">Reference</td>
                          <td style="color: #0f172a; font-size: 14px; font-family: monospace;">INV-${new Date().getFullYear()}-${user.studentIdNumber || user._id.toString().slice(-4)}</td>
                        </tr>
                      </table>
                    </div>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center">
                          <a href="${clientUrl}/admin/payments" style="background-color: #0061FF; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">Review Payment</a>
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
        })));
      }
    } catch (mailError) {
      console.log('Admin notification email not sent:', mailError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Payment receipt uploaded successfully. Our team will verify your payment shortly.',
      data: {
        paymentReceiptUrl: user.paymentReceiptUrl,
        paymentStatus: user.paymentStatus
      }
    });
  } catch (error) {
    next(error);
  }
};
