import { z } from 'zod';
import { BetType } from '@prisma/client';

// Schema for creating a back bet
export const createBackBetSchema = z.object({
  body: z.object({
    eventId: z.string().uuid('Invalid event ID format'),
    marketId: z.string().uuid('Invalid market ID format').optional(),
    amount: z.number().positive('Bet amount must be a positive number'),
    odds: z.number().gt(1, 'Odds must be greater than 1'),
    selection: z.string().min(1, 'Selection is required'),
  }),
});

// Schema for creating a lay bet
export const createLayBetSchema = z.object({
  body: z.object({
    eventId: z.string().uuid('Invalid event ID format'),
    marketId: z.string().uuid('Invalid market ID format'),
    amount: z.number().positive('Bet amount must be a positive number'),
    odds: z.number().gt(1, 'Odds must be greater than 1'),
    selection: z.string().min(1, 'Selection is required'),
  }),
});

// Schema for cancelling a bet
export const cancelBetSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid bet ID format'),
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

// Schema for getting bet matches
export const getBetMatchesSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid bet ID format'),
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
