import { z } from 'zod';

// Schema for creating a bet
export const createBetSchema = z.object({
  body: z.object({
    eventId: z.string().uuid('Invalid event ID format'),
    amount: z.number().positive('Bet amount must be a positive number'),
    odds: z.number().gt(1, 'Odds must be greater than 1'),
    selection: z.string().min(1, 'Selection is required'),
  }),
});

// Schema for getting bets with pagination
export const getBetsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
  }),
});

// Schema for getting user bets with pagination
export const getUserBetsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
  }),
});

// Schema for getting a single bet
export const getBetSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid bet ID format'),
  }),
});

// Schema for settling a bet
export const settleBetSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid bet ID format'),
  }),
  body: z.object({
    status: z.enum(['WON', 'LOST', 'CANCELLED']),
  }),
});

// Schema for settling event bets
export const settleEventBetsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid event ID format'),
  }),
  body: z.object({
    winningSelection: z.string().min(1, 'Winning selection is required'),
  }),
});

// Schema for updating user balance
export const updateBalanceSchema = z.object({
  body: z.object({
    amount: z.number().refine(val => val !== 0, {
      message: 'Amount cannot be zero',
    }),
  }),
});
