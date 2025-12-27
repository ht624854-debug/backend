/**
 * This script creates indexes for the MongoDB collections to improve query performance
 * Run this script after initial database setup
 */

const mongoose = require('mongoose');
const config = require('../config/config');

// Import models
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const CartItem = require('../models/CartItem');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Review = require('../models/Review');

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI, {
  // Connection options if needed
})
  .then(async () => {
    console.log('MongoDB Connected');
    
    try {
      // Drop existing indexes (optional, remove this if you want to keep existing indexes)
      console.log('Dropping existing indexes...');
      await Product.collection.dropIndexes();
      await Category.collection.dropIndexes();
      await User.collection.dropIndexes();
      await CartItem.collection.dropIndexes();
      await Order.collection.dropIndexes();
      await Payment.collection.dropIndexes();
      await Review.collection.dropIndexes();
      console.log('Existing indexes dropped');
      
      // Create indexes for Product collection
      await Product.collection.createIndex({ title: 'text', description: 'text', tags: 'text' });
      await Product.collection.createIndex({ category: 1 });
      await Product.collection.createIndex({ isOnSale: 1 });
      await Product.collection.createIndex({ price: 1 });
      console.log('Product indexes created');

      // Create indexes for Category collection
      await Category.collection.createIndex({ name: 1 }, { unique: true });
      await Category.collection.createIndex({ parent: 1 });
      console.log('Category indexes created');

      // Create indexes for User collection
      await User.collection.createIndex({ email: 1 }, { unique: true });
      await User.collection.createIndex({ role: 1 });
      console.log('User indexes created');

      // Create indexes for CartItem collection
      await CartItem.collection.createIndex({ user: 1 });
      await CartItem.collection.createIndex({ product: 1 });
      await CartItem.collection.createIndex({ 'variant.size': 1, 'variant.color': 1 });
      console.log('CartItem indexes created');

      // Create indexes for Order collection
      await Order.collection.createIndex({ user: 1 });
      await Order.collection.createIndex({ status: 1 });
      await Order.collection.createIndex({ createdAt: -1 });
      console.log('Order indexes created');

      // Create indexes for Payment collection
      await Payment.collection.createIndex({ order: 1 });
      await Payment.collection.createIndex({ user: 1 });
      await Payment.collection.createIndex({ transactionId: 1 }, { unique: true });
      console.log('Payment indexes created');

      // Create indexes for Review collection
      await Review.collection.createIndex({ product: 1 });
      await Review.collection.createIndex({ user: 1 });
      await Review.collection.createIndex({ rating: 1 });
      console.log('Review indexes created');

      console.log('All indexes created successfully');
      process.exit(0);
    } catch (err) {
      console.error('Error creating indexes:', err);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }); 