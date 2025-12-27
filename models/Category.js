const mongoose = require('mongoose');

// Category Schema definition
const categorySchema = new mongoose.Schema({
  name: String,
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
}, { timestamps: true });

// Create index for category name (for fast filtering by name)
categorySchema.index({ name: 1 });  // Index for faster searching by name

// Create index for parent (to quickly fetch subcategories)
categorySchema.index({ parent: 1 });

module.exports = mongoose.model('Category', categorySchema);
