import express from 'express';
import { protect } from '../middleware/auth';

const router = express.Router();

// Routes
router.get('/', protect, (req, res) => {
  res.status(200).json({ success: true, message: 'Get all users route' });
});

router.get('/:id', protect, (req, res) => {
  res.status(200).json({ success: true, message: 'Get single user route' });
});

router.put('/:id/balance', protect, (req, res) => {
  res.status(200).json({ success: true, message: 'Update user balance route' });
});

export default router;
