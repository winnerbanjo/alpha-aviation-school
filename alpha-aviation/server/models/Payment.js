const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required'],
    index: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive'],
  },
  status: {
    type: String,
    enum: ['pending_review', 'approved', 'rejected'],
    default: 'pending_review',
    required: true,
  },
  receiptUrl: {
    type: String,
    required: [true, 'Receipt proof is required'],
    trim: true,
  },
  reference: {
    type: String,
    trim: true,
  },
  adminNotes: {
    type: String,
    trim: true,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Index for faster queries
paymentSchema.index({ student: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
