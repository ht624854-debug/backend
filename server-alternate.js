const mongoose = require('mongoose');
const config = require('./config/config');
const app = require('./app');

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI, {
  // Connection options if needed
})
  .then(() => {
    console.log('MongoDB Connected');
    // Start server
    const PORT = config.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`Server running in ${config.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`API endpoints available at http://localhost:${PORT}/api/`);
      console.log(`Health check available at http://localhost:${PORT}/health`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
      console.log(`Error: ${err.message}`);
      // Close server & exit process
      server.close(() => process.exit(1));
    });
  })
  .catch((err) => {
    console.log('MongoDB connection error: ', err);
    process.exit(1);
  }); 