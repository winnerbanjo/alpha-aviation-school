const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive']
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending',
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  paymentMethod: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
paymentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
