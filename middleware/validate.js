const { body, validationResult } = require('express-validator');
const { formatValidationErrors } = require('../utils');

// Middleware to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: formatValidationErrors(errors)
    });
  }
  next();
};

// User registration validation
exports.registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  validate
];

// Login validation
exports.loginValidation = [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').exists().withMessage('Password is required'),
  validate
];

// Product validation
exports.productValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a positive number'),
  body('category').notEmpty().withMessage('Category is required'),
  validate
];

// Category validation
exports.categoryValidation = [
  body('name').notEmpty().withMessage('Category name is required'),
  validate
];

// Cart item validation
exports.cartItemValidation = [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('variant').notEmpty().withMessage('Variant is required'),
  validate
];

// Order validation
exports.orderValidation = [
  body('shippingAddress').notEmpty().withMessage('Shipping address is required'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  validate
];

// Payment validation
exports.paymentValidation = [
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('transactionId').notEmpty().withMessage('Transaction ID is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('method').notEmpty().withMessage('Payment method is required'),
  body('status').notEmpty().withMessage('Payment status is required'),
  validate
];

// Review validation
exports.reviewValidation = [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').notEmpty().withMessage('Comment is required'),
  validate
];

// Export validate function for direct use
exports.validate = validate; 