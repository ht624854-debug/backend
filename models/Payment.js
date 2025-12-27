const mongoose = require('mongoose');

// Payment Schema definition
const paymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  method: String,         // 'stripe', 'cash-on-delivery', etc.
  status: String,         // 'success', 'failed', 'pending'
  transactionId: String,  // Unique transaction identifier
  paidAt: Date
}, { timestamps: true });

// Create index for fast lookup of payment by transactionId
paymentSchema.index({ transactionId: 1 }, { unique: true });

// Create index for lookup of payment by orderId
paymentSchema.index({ orderId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
