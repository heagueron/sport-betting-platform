import express from 'express';
import { protect } from '../middleware/auth';
import { getUsers, getUser, updateBalance } from '../controllers/user';

const router = express.Router();

// Routes
router.get('/', protect, (req, res, next) => {
  getUsers(req, res, next);
});

router.get('/:id', protect, (req, res, next) => {
  getUser(req, res, next);
});

router.put('/:id/balance', protect, (req, res, next) => {
  updateBalance(req, res, next);
});

export default router;
