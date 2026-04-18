const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lost_and_found_hub', // The folder name in your Cloudinary account
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }] // Optimize size automatically
  }
});

// Initialize Multer with Cloudinary
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5000000 } // 5MB limit
});

module.exports = upload;
