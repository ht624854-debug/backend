const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem
} = require('../controllers/cart');
const { protect } = require('../middleware/auth');

router.use(protect); // All cart routes require authentication

router
  .route('/')
  .get(getCart)
  .post(addToCart);

router
  .route('/:id')
  .put(updateCartItem)
  .delete(removeFromCart);

module.exports = router; 
