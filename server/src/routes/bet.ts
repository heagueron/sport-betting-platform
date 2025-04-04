import express from 'express';
import { protect, restrictTo } from '../middleware/auth';
import {
  createBet,
  getBets,
  getUserBetsController as getUserBets,
  getBet,
  settleBet,
  settleEventBets,
  getBalance,
  updateBalance
} from '../controllers/bet';

const router = express.Router();

// Bet routes
router.post('/', protect as any, createBet as any);
router.get('/', protect as any, restrictTo(['ADMIN']) as any, getBets as any);
router.get('/user', protect as any, getUserBets as any);
router.get('/balance', protect as any, getBalance as any);
router.put('/balance', protect as any, updateBalance as any);
router.get('/:id', protect as any, getBet as any);
router.put('/:id/settle', protect as any, restrictTo(['ADMIN']) as any, settleBet as any);
router.put('/event/:id/settle', protect as any, restrictTo(['ADMIN']) as any, settleEventBets as any);

export default router;
