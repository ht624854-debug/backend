const mongoose = require('mongoose');
const Product = require('./Product');  // Import the Product model

// Cart Item Schema definition
const cartItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: Number,
  variant: {
    size: String,
    color: String
  },
  price: Number,  // Add price field to store the product price at time of adding to cart
  addedAt: { type: Date, default: Date.now }
});

// Add a pre-save hook to set the price if it's not already set
cartItemSchema.pre('save', async function(next) {
  try {
    // Only set price if it's not already set or if it's a new document
    if (!this.price || this.isNew) {
      const product = await Product.findById(this.product);
      if (product) {
        // Calculate price based on whether the product is on sale
        this.price = product.isOnSale 
          ? (product.price - (product.price * product.discount / 100))
          : product.price;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Create indexes for fast user/cart lookup
cartItemSchema.index({ user: 1 });
cartItemSchema.index({ product: 1 });
cartItemSchema.index({ 'variant.size': 1, 'variant.color': 1 });  // For filtering by size and color

module.exports = mongoose.model('CartItem', cartItemSchema);
