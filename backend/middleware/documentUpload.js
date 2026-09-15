import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = 'uploads/papers';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `paper-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|zip/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  if (extName) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, and ZIP documents are allowed!'), false);
  }
};

export const uploadDocument = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB Limit for academic files
  fileFilter,
});