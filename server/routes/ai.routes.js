import express from 'express';
import { getResumeScore, getCoverLetter } from '../controllers/ai.controller.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/score', getResumeScore);
router.post('/cover-letter', getCoverLetter);

export default router;