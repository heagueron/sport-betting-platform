import { z } from 'zod';

// Schema for creating a sport
export const createSportSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Sport name must be at least 2 characters long'),
    active: z.boolean().optional(),
  }),
});

// Schema for getting sports with optional query parameters
export const getSportsSchema = z.object({
  query: z.object({
    active: z.enum(['true', 'false']).optional(),
  }),
});

// Schema for getting a single sport
export const getSportSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid sport ID format'),
  }),
});

// Schema for getting sport events
export const getSportEventsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid sport ID format'),
  }),
  query: z.object({
    status: z.enum(['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED']).optional(),
  }),
});

// Schema for updating a sport
export const updateSportSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid sport ID format'),
  }),
  body: z.object({
    name: z.string().min(2, 'Sport name must be at least 2 characters long').optional(),
    active: z.boolean().optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  }),
});

// Schema for deleting a sport
export const deleteSportSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid sport ID format'),
  }),
});
