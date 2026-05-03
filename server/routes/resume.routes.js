import express from 'express';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Resume routes will be added when we build the upload feature

export default router;