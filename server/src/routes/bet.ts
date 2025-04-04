import express from 'express';
import { protect, restrictTo } from '../middleware/auth';
import { validate } from '../middleware/validate';
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
import {
  createBetSchema,
  getBetsSchema,
  getUserBetsSchema,
  getBetSchema,
  settleBetSchema,
  settleEventBetsSchema,
  updateBalanceSchema
} from '../schemas/bet.schema';

const router = express.Router();

// Bet routes
router.post('/',
  protect as any,
  validate(createBetSchema),
  createBet as any
);

router.get('/',
  protect as any,
  restrictTo(['ADMIN']) as any,
  validate(getBetsSchema),
  getBets as any
);

router.get('/user',
  protect as any,
  validate(getUserBetsSchema),
  getUserBets as any
);

router.get('/balance',
  protect as any,
  getBalance as any
);

router.put('/balance',
  protect as any,
  validate(updateBalanceSchema),
  updateBalance as any
);

router.get('/:id',
  protect as any,
  validate(getBetSchema),
  getBet as any
);

router.put('/:id/settle',
  protect as any,
  restrictTo(['ADMIN']) as any,
  validate(settleBetSchema),
  settleBet as any
);

router.put('/event/:id/settle',
  protect as any,
  restrictTo(['ADMIN']) as any,
  validate(settleEventBetsSchema),
  settleEventBets as any
);

export default router;
