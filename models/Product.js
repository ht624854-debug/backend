const mongoose = require('mongoose');

// Product Schema definition
const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  price: Number,
  discount: { type: Number, default: 0 },
  isOnSale: { type: Boolean, default: false },
  stock: Number,
  images: [String],
  tags: [String],
  variants: [{
    size: String,
    color: String,
    stock: Number
  }],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Virtual for reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'productId'
});

// Full-text search on title, description, and tags
productSchema.index({ title: 'text', description: 'text', tags: 'text' });  // Full-text search for title, description, tags

// Create index for category (for fast filtering by category)
productSchema.index({ category: 1 });  // Index for filtering by category

// Create index for sale items
productSchema.index({ isOnSale: 1 });  // Index for faster querying of sale items

module.exports = mongoose.model('Product', productSchema);
