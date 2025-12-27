const mongoose = require('mongoose');
const Product = require('./Product');

// Order Schema definition
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      title: String,
      quantity: Number,
      price: Number,
      variant: {
        size: String,
        color: String
      }
    }
  ],
  billingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  paymentMethod: { type: String, default: 'cash-on-delivery' },
  paymentStatus: { type: String, default: 'pending' },
  orderStatus: { type: String, default: 'processing' },
  totalAmount: Number
}, { timestamps: true });

// Decrease stock when order is placed
orderSchema.pre('save', async function (next) {
  for (let item of this.items) {
    const product = await Product.findById(item.productId);
    if (product) {
      const variant = product.variants.find(v => v.size === item.variant.size && v.color === item.variant.color);
      if (variant) {
        variant.stock -= item.quantity;  // Decrease stock by quantity
        await product.save();
      }
    }
  }
  next();
});

// Create index for quick access to orders by user and order date
orderSchema.index({ userId: 1, createdAt: -1 });  // Sort orders by creation date

module.exports = mongoose.model('Order', orderSchema);
