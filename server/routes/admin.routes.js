import express from 'express';
import User from '../models/User.js';
import Job from '../models/Job.js';
import  protect from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Get all users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all jobs across all users
router.get('/jobs', protect, adminOnly, async (req, res) => {
  try {
    const jobs = await Job.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalJobs = await Job.countDocuments();
    const appliedJobs = await Job.countDocuments({ status: 'applied' });
    const offerJobs = await Job.countDocuments({ status: 'offer' });
    res.json({ totalUsers, totalJobs, appliedJobs, offerJobs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete user
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;