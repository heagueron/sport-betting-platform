import express from 'express';
import {
  createMarket,
  getAllMarkets,
  getMarketsByEvent,
  getMarketById,
  updateMarketStatus,
  suspendMarket,
  reopenMarket,
  closeMarket,
  cancelMarket,
  settleMarket,
  getOrderBook
} from '../controllers/market';
import { protect, restrictTo } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createMarketSchema,
  getMarketsByEventSchema,
  getMarketByIdSchema,
  updateMarketStatusSchema,
  settleMarketSchema,
  getOrderBookSchema
} from '../schemas/market';

const router = express.Router();

// Public routes
router.get('/', getAllMarkets);
router.get('/:id', validate(getMarketByIdSchema), getMarketById);
router.get('/:id/orderbook', validate(getOrderBookSchema), getOrderBook);

// Protected routes (admin only)
router.post('/', protect, restrictTo(['ADMIN']) as any, validate(createMarketSchema), createMarket);
router.put('/:id/status', protect, restrictTo(['ADMIN']) as any, validate(updateMarketStatusSchema), updateMarketStatus);
router.put('/:id/suspend', protect, restrictTo(['ADMIN']) as any, suspendMarket);
router.put('/:id/reopen', protect, restrictTo(['ADMIN']) as any, reopenMarket);
router.put('/:id/close', protect, restrictTo(['ADMIN']) as any, closeMarket);
router.put('/:id/cancel', protect, restrictTo(['ADMIN']) as any, cancelMarket);
router.put('/:id/settle', protect, restrictTo(['ADMIN']) as any, validate(settleMarketSchema), settleMarket);

export default router;
