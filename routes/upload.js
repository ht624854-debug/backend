const express = require('express');
const router = express.Router();
const { uploadFile, uploadMultipleFiles } = require('../controllers/upload');
const { uploadSingle, uploadMultiple, handleUploadError } = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');

// Upload a single file
router.post(
  '/',
  protect,
  authorize('admin'),
  uploadSingle,
  handleUploadError,
  uploadFile
);

// Upload multiple files
router.post(
  '/multiple',
  protect,
  authorize('admin'),
  uploadMultiple,
  handleUploadError,
  uploadMultipleFiles
);

module.exports = router; 