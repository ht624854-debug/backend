const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const config = require('./config/config');
const errorHandler = require('./middleware/error');

// Route files
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');
const reviewRoutes = require('./routes/review');
const categoryRoutes = require('./routes/category');
const paymentRoutes = require('./routes/payment');
const uploadRoutes = require('./routes/upload');

// Initialize Express app
const app = express();

/* =======================
   BASIC MIDDLEWARE
======================= */

// Body parser
app.use(express.json());

// Secure CORS (production-safe)
const allowedOrigins = [
  'https://trendyclothing.cloud',
  'https://www.trendyclothing.cloud'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Dev logging
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/* =======================
   FILE SYSTEM SETUP
======================= */

const publicDir = path.join(__dirname, 'public');
const uploadsDir = path.join(publicDir, 'uploads');

try {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (err) {
  console.error('Directory creation error:', err);
}

/* =======================
   STATIC FILES
======================= */

app.use(express.static(publicDir));

/* =======================
   HEALTH CHECK
======================= */

app.get('/', (req, res) => {
  res.send('Backend is live 🚀');
});

/* =======================
   API ROUTES
======================= */

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);

/* =======================
   ERROR HANDLER
======================= */

app.use(errorHandler);

/* =======================
   DATABASE + SERVER
======================= */

const PORT = config.PORT || process.env.PORT || 10000;

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected');

    const server = app.listen(PORT, () => {
      console.log(
        `Server running in ${config.NODE_ENV} mode on port ${PORT}`
      );
    });

    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Rejection:', err.message);
      server.close(() => process.exit(1));
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
