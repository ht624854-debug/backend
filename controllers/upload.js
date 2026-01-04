const path = require('path');
const config = require('../config/config');

// @desc    Upload a file to local storage
// @route   POST /api/upload
// @access  Private/Admin
exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    console.log(`Processing upload for file: ${req.file.originalname} (${req.file.size} bytes, ${req.file.mimetype})`);

    // Generate URL for the uploaded file
    const baseUrl = config.BASE_URL || `http://localhost:${config.PORT}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    
    console.log(`File uploaded successfully: ${req.file.path}`);
    console.log(`File URL: ${fileUrl}`);

    res.status(200).json({
      success: true,
      url: fileUrl
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({
      success: false,
      message: `File upload failed: ${err.message}`
    });
  }
};

// @desc    Upload multiple files to local storage
// @route   POST /api/upload/multiple
// @access  Private/Admin
exports.uploadMultipleFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one file'
      });
    }

    console.log(`Processing multiple uploads: ${req.files.length} files`);
    req.files.forEach((file, index) => {
      console.log(`File ${index+1}: ${file.originalname} (${file.size} bytes, ${file.mimetype})`);
    });

    // Generate URLs for the uploaded files
    const baseUrl = config.BASE_URL || `http://localhost:${config.PORT}`;
    const urls = req.files.map(file => `${baseUrl}/uploads/${file.filename}`);
    
    console.log(`All uploads completed successfully. URLs:`, urls);

    res.status(200).json({
      success: true,
      urls
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({
      success: false,
      message: `File upload failed: ${err.message}`
    });
  }
}; 
