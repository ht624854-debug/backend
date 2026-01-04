const multer = require('multer');
const path = require('path');

// Use MEMORY storage (IMPORTANT for Google Drive)
const storage = multer.memoryStorage();

// Check file type
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|webp/;
  const extname = allowedFileTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Images Only (jpeg, jpg, png, webp)'), false);
  }
};

// Multer config
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

// Single upload (agar future me chahiye)
exports.uploadSingle = upload.single('image');

// Multiple uploads (Dashboard uses this)
exports.uploadMultiple = upload.array('images', 5);

// Error handler (same as before)
exports.handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Max size is 5MB',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next();
};
