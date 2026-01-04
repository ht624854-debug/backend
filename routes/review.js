const express = require('express');
const router = express.Router();
const {
  addReview,
  getProductReviews,
  getUserReviews,
  getAllReviews,
  deleteReview
} = require('../controllers/review');
const { protect } = require('../middleware/auth');
const { reviewValidation } = require('../middleware/validate');

router.post('/', protect, reviewValidation, addReview);
router.get('/user/me', protect, getUserReviews);
router.get('/admin', protect, getAllReviews);
router.get('/:productId', getProductReviews);
router.delete('/:id', protect, deleteReview);

module.exports = router; 
