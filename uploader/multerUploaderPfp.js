const express = require('express');
const multer  = require('multer');
const path = require('path');

const app = express();
const port = 3000;

// Multer setup to specify where to store uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images/user_profile_pics'); // Store images in this directory
  },
  filename: function (req, file, cb) {
    // Generate unique filename by appending current timestamp to original filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
  
});

function   fileFilter(req, file, cb) {
  // Check if file is an image
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
} 

// Create multer instance with specified storage settings
const upload = multer({ storage: storage , fileFilter : fileFilter });

module.exports = upload;