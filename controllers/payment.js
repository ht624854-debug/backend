const Payment = require('../models/Payment');
const Order = require('../models/Order');

// @desc    Record payment
// @route   POST /api/payments
// @access  Private
exports.recordPayment = async (req, res, next) => {
  try {
    const { orderId, transactionId, amount, method, status } = req.body;

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Ensure user owns the order
    if (order.userId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ transactionId });
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment with this transaction ID already exists'
      });
    }

    // Check if payment for this order already exists
    const orderPayment = await Payment.findOne({ order: orderId });
    if (orderPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment for this order already exists'
      });
    }

    // Create payment
    const payment = await Payment.create({
      order: orderId,
      user: req.user.id,
      transactionId,
      amount,
      method,
      status
    });

    // Update order status if payment successful
    if (status === 'completed') {
      order.paymentStatus = 'completed';
      if (order.orderStatus === 'processing') {
        // Only update to processing if order is not already in a later stage
        order.orderStatus = 'processing';
      }
      await order.save();
      
      console.log('Order payment status updated to completed:', orderId);
    }

    res.status(201).json({
      success: true,
      data: payment
    });
  } catch (err) {
    console.error('Error recording payment:', err);
    next(err);
  }
};

// @desc    Get payment by order ID
// @route   GET /api/payments/:orderId
// @access  Private
exports.getPaymentByOrder = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Ensure user owns the order
    if (order.userId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    // Get payment
    const payment = await Payment.findOne({ order: orderId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all user payments
// @route   GET /api/payments
// @access  Private
exports.getUserPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate('order')
      .sort('-createdAt');

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (err) {
    next(err);
  }
}; 
