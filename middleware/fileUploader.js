const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadPath = 'uploads/activities/';

const upload = multer({
  storage: multer.memoryStorage(), // store files in memory as Buffer
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG and PNG files are allowed'), false);
    }
  },
});

module.exports = upload;
