const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');

const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'campusconnect',
        resource_type: options.resourceType || 'auto',
        ...options,
      },
      (error, result) => {
        if (error) reject(error); 
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
