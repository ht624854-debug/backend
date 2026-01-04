const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Add review for a product
// @route   POST /api/reviews
// @access  Private
exports.addReview = async (req, res, next) => {
  try {
    console.log('Adding review:', req.body);
    const { productId, rating, comment } = req.body;

    if (!productId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and rating are required'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Optional: Check if user has purchased the product
    // Note: We're making this optional for now to allow easier testing
    /*
    const hasPurchased = await Order.findOne({
      userId: req.user.id,
      'items.productId': productId,
      orderStatus: 'delivered'
    });

    if (!hasPurchased) {
      return res.status(400).json({
        success: false,
        message: 'You can only review products you have purchased'
      });
    }
    */

    // Check if user has already reviewed the product
    const existingReview = await Review.findOne({
      userId: req.user.id,
      productId: productId
    });

    if (existingReview) {
      // Update existing review instead of creating a new one
      existingReview.rating = rating;
      existingReview.comment = comment || existingReview.comment;
      await existingReview.save();
      
      return res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        data: existingReview
      });
    }

    // Create review
    const review = await Review.create({
      userId: req.user.id,
      productId,
      rating,
      comment
    });
    
    console.log('Review created:', review);

    // Update product average rating
    const productReviews = await Review.find({ productId });
    if (productReviews.length > 0) {
      const totalRating = productReviews.reduce((sum, item) => sum + item.rating, 0);
      const avgRating = totalRating / productReviews.length;
      
      // Update product with average rating
      product.rating = avgRating.toFixed(1);
      product.numReviews = productReviews.length;
      await product.save();
      
      console.log(`Updated product ${productId} rating to ${avgRating.toFixed(1)}`);
    }

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (err) {
    console.error('Error adding review:', err);
    next(err);
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
exports.getProductReviews = async (req, res, next) => {
  try {
    console.log('Getting reviews for product:', req.params.productId);
    
    const reviews = await Review.find({ productId: req.params.productId })
      .populate('userId', 'name email')
      .sort('-createdAt');
    
    console.log(`Found ${reviews.length} reviews`);

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    console.error('Error getting product reviews:', err);
    next(err);
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/user/me
// @access  Private
exports.getUserReviews = async (req, res, next) => {
  try {
    console.log('Getting reviews for user:', req.user.id);
    
    const reviews = await Review.find({ userId: req.user.id })
      .populate('productId', 'title images price')
      .sort('-createdAt');
    
    console.log(`Found ${reviews.length} user reviews`);

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    console.error('Error getting user reviews:', err);
    next(err);
  }
};

// @desc    Get all reviews (for admin)
// @route   GET /api/reviews/admin
// @access  Private
exports.getAllReviews = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    }
    
    console.log('Admin getting all reviews');
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    
    const reviews = await Review.find({})
      .populate('userId', 'name email')
      .populate('productId', 'title images')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);
    
    const total = await Review.countDocuments();
    
    console.log(`Found ${reviews.length} reviews (page ${page} of ${Math.ceil(total / limit)})`);

    res.json({
      success: true,
      count: reviews.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: reviews
    });
  } catch (err) {
    console.error('Error getting all reviews:', err);
    next(err);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Only allow the user who created the review or an admin to delete it
    if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }
    
    await review.deleteOne();
    
    // Update product average rating
    const productId = review.productId;
    const productReviews = await Review.find({ productId });
    const product = await Product.findById(productId);
    
    if (product && productReviews.length > 0) {
      const totalRating = productReviews.reduce((sum, item) => sum + item.rating, 0);
      const avgRating = totalRating / productReviews.length;
      
      product.rating = avgRating.toFixed(1);
      product.numReviews = productReviews.length;
      await product.save();
      
      console.log(`Updated product ${productId} rating after review deletion`);
    } else if (product) {
      // No reviews left
      product.rating = 0;
      product.numReviews = 0;
      await product.save();
      
      console.log(`Reset product ${productId} rating (no reviews)`);
    }
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting review:', err);
    next(err);
  }
}; 
