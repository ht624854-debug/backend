require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/gulzaar',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  NODE_ENV: process.env.NODE_ENV || 'development',
  BASE_URL: process.env.BASE_URL || 'https://api.trendyclothing.cloud',
CORS_ORIGIN: process.env.CORS_ORIGIN || 'https://trendyclothing.cloud',

  // CORS allowed origin (frontend)BASE_URL: 'https://api.trendyclothing.cloud', // localhost:5000 ko replace karo
CORS_ORIGIN: 'https://trendyclothing.cloud',

  CORS_ORIGIN: process.env.CORS_ORIGIN || 'https://trendyclothing.cloud',
  
  // Base URL for API & image references
  BASE_URL: process.env.BASE_URL || 'https://api.trendyclothing.cloud',
  
  // Firebase config
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID
};
