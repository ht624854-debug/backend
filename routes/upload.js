const drive = require('../utils/googleDrive');
const stream = require('stream');

// MULTIPLE IMAGES UPLOAD
exports.uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided',
      });
    }

    const uploadedUrls = [];

    for (const file of req.files) {
      const bufferStream = new stream.PassThrough();
      bufferStream.end(file.buffer);

      // Upload to Google Drive
      const response = await drive.files.create({
        requestBody: {
          name: `${Date.now()}-${file.originalname}`,
          parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
        },
        media: {
          mimeType: file.mimetype,
          body: bufferStream,
        },
      });

      const fileId = response.data.id;

      // Make file public
      await drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      // Public URL
      const publicUrl = `https://drive.google.com/uc?id=${fileId}`;

      uploadedUrls.push(publicUrl);
    }

    return res.status(200).json({
      success: true,
      urls: uploadedUrls,
    });
  } catch (error) {
    console.error('Google Drive Upload Error:', error);
    res.status(500).json({
      success: false,
      message: 'Image upload failed',
    });
  }
};
