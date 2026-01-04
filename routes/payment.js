const express = require('express');
const router = express.Router();
const {
  recordPayment,
  getPaymentByOrder,
  getUserPayments
} = require('../controllers/payment');
const { protect } = require('../middleware/auth');

router.use(protect); // All payment routes require authentication

router.route('/')
  .get(getUserPayments)
  .post(recordPayment);

router.route('/:orderId')
  .get(getPaymentByOrder);

module.exports = router; 
