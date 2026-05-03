import express from 'express';
import { getJobs, createJob, updateJob, deleteJob, getStats } from '../controllers/job.controller.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // all job routes are protected


router.get('/stats', getStats);
router.get('/', getJobs);
router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);
//router.get('/stats', getStats);

export default router;