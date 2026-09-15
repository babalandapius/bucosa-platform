import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 1. Ensure the destination folder exists on disk
const uploadDir = 'uploads/executives';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Configure Disk Storage Engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Path where physical files are written
  },
  filename: (req, file, cb) => {
    // Generate unique name: exec-174123456789-987654321.png
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `exec-${uniqueSuffix}${ext}`);
  },
});

// 3. Security Filter: Enforce allowed image types
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp/;
  const isValidExt = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const isValidMime = allowedExtensions.test(file.mimetype);

  if (isValidExt && isValidMime) {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Security Error: Only JPEG, JPG, PNG, and WEBP images are allowed!'), false);
  }
};

// 4. Export Multer Configuration Instance
export const uploadExecutivePhoto = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Enforce 5MB maximum file size
  fileFilter,
});