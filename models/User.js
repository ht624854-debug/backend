const mongoose = require('mongoose');

// User Schema definition
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },  // Unique email
  password: String,  // Password will be hashed (for simplicity, assume plaintext for now)
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  }
}, { timestamps: true });

//  Create index for email (fast lookups for login)
userSchema.index({ email: 1 });
module.exports = mongoose.model('User', userSchema);
