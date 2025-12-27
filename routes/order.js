
const express = require('express');
const router = express.Router();

const {
  createOrder,
  getOrders,
  getOrder,
  cancelOrder,
  shipOrder,
  deliverOrder,
  fixPaymentStatuses,
  syncOrderPaymentStatus
} = require('../controllers/order');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All order routes require authentication

router
  .route('/')
  .get(getOrders)
  .post(createOrder);

router
  .route('/:id')
  .get(getOrder)
  .delete(cancelOrder);

// Admin routes for updating order status
router
  .route('/:id/ship')
  .put(authorize('admin'), shipOrder);

router
  .route('/:id/deliver')
  .put(authorize('admin'), deliverOrder);

router
  .route('/:id/sync-payment')
  .put(authorize('admin'), syncOrderPaymentStatus);

// Admin route for fixing payment statuses
router
  .route('/fix-payment-status')
  .post(authorize('admin'), fixPaymentStatuses);

module.exports = router; 