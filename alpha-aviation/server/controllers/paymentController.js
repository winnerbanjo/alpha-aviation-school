const Payment = require('../models/Payment');

// Create a new payment record
exports.createPayment = async (req, res, next) => {
  try {
    const { amount, description, paymentMethod } = req.body;
    const userId = req.user.userId;

    const payment = await Payment.create({
      user: userId,
      amount,
      description,
      paymentMethod,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Payment record created successfully',
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
};

// Get all payments for the authenticated user
exports.getUserPayments = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const payments = await Payment.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('user', 'email firstName lastName');

    res.status(200).json({
      success: true,
      count: payments.length,
      data: { payments }
    });
  } catch (error) {
    next(error);
  }
};

// Get a single payment by ID
exports.getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const payment = await Payment.findOne({ 
      _id: id, 
      user: userId 
    }).populate('user', 'email firstName lastName');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    const payment = await Payment.findOne({ 
      _id: id, 
      user: userId 
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    payment.status = status;
    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
};
