import express from 'express';
import { protect, restrictTo } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createBetController,
  createBackBetController,
  createLayBetController,
  cancelBet,
  getBets,
  getUserBetsController as getUserBets,
  getBet,
  getBetMatchesController,
  getBalance,
  updateBalance
} from '../controllers/bet';
import {
  createBackBetSchema,
  createLayBetSchema,
  cancelBetSchema,
  getBetsSchema,
  getUserBetsSchema,
  getBetSchema,
  getBetMatchesSchema,
  updateBalanceSchema
} from '../schemas/bet.schema';

const router = express.Router();

// Generic bet route (for backward compatibility with tests)
router.post('/',
  protect as any,
  validate(createBackBetSchema),
  createBetController as any
);

// Back bet routes
router.post('/back',
  protect as any,
  validate(createBackBetSchema),
  createBackBetController as any
);

// Lay bet routes
router.post('/lay',
  protect as any,
  validate(createLayBetSchema),
  createLayBetController as any
);

// Cancel bet route
router.put('/:id/cancel',
  protect as any,
  validate(cancelBetSchema),
  cancelBet as any
);

// Get all bets (admin only)
router.get('/',
  protect as any,
  restrictTo(['ADMIN']) as any,
  validate(getBetsSchema),
  getBets as any
);

// Get user bets
router.get('/user',
  protect as any,
  validate(getUserBetsSchema),
  getUserBets as any
);

// Get user balance
router.get('/balance',
  protect as any,
  getBalance as any
);

// Update user balance
router.put('/balance',
  protect as any,
  validate(updateBalanceSchema),
  updateBalance as any
);

// Get single bet
router.get('/:id',
  protect as any,
  validate(getBetSchema),
  getBet as any
);

// Get bet matches
router.get('/:id/matches',
  protect as any,
  validate(getBetMatchesSchema),
  getBetMatchesController as any
);

export default router;
