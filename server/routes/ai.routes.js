import express from 'express';
import multer from 'multer';
import { 
  getResumeScore, 
  getCoverLetter,
  parseResumeFile 
} from '../controllers/ai.controller.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads (memory storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX are allowed.'), false);
    }
  },
});

// Apply authentication middleware to all routes
router.use(protect);

// Resume scoring routes
router.post('/score', getResumeScore);
router.post('/cover-letter', getCoverLetter);

// File parsing routes
router.post('/parse-resume', upload.single('file'), parseResumeFile);

// Optional: Multiple files upload
router.post('/parse-resumes', upload.array('files', 5), (req, res) => {
  // Handle multiple files if needed
});

export default router;