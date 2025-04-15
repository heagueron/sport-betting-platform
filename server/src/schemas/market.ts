import { z } from 'zod';
import { MarketStatus } from '@prisma/client';

// Schema for creating a market
export const createMarketSchema = z.object({
  body: z.object({
    eventId: z.string().uuid({ message: 'Invalid event ID format' }),
    name: z.string().min(3, { message: 'Market name must be at least 3 characters long' }),
    status: z.nativeEnum(MarketStatus).optional()
  })
});

// Schema for getting markets by event
export const getMarketsByEventSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid event ID format' })
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional()
  }).optional()
});

// Schema for getting a market by ID
export const getMarketByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid market ID format' })
  })
});

// Schema for updating market status
export const updateMarketStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid market ID format' })
  }),
  body: z.object({
    status: z.nativeEnum(MarketStatus, {
      errorMap: () => ({ message: 'Invalid market status' })
    })
  })
});

// Schema for settling a market
export const settleMarketSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid market ID format' })
  }),
  body: z.object({
    winningSelection: z.string().min(1, { message: 'Winning selection is required' })
  })
});

// Schema for getting order book
export const getOrderBookSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid market ID format' })
  })
});
