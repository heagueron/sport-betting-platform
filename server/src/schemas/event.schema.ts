import { z } from 'zod';

// Schema for participant data
const participantSchema = z.object({
  name: z.string().min(1, 'Participant name is required'),
  odds: z.number().positive('Odds must be a positive number'),
});

// Schema for creating an event
export const createEventSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Event name must be at least 2 characters long'),
    sportId: z.string().uuid('Invalid sport ID format'),
    startTime: z.string().datetime('Invalid date format. Use ISO format'),
    endTime: z.string().datetime('Invalid date format. Use ISO format').optional(),
    status: z.enum(['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED']).optional(),
    participants: z.array(participantSchema).min(2, 'At least 2 participants are required'),
  }),
});

// Schema for getting events with optional query parameters
export const getEventsSchema = z.object({
  query: z.object({
    status: z.enum(['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED']).optional(),
    sportId: z.string().uuid('Invalid sport ID format').optional(),
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
  }),
});

// Schema for getting a single event
export const getEventSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid event ID format'),
  }),
});

// Schema for updating an event
export const updateEventSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid event ID format'),
  }),
  body: z.object({
    name: z.string().min(2, 'Event name must be at least 2 characters long').optional(),
    sportId: z.string().uuid('Invalid sport ID format').optional(),
    startTime: z.string().datetime('Invalid date format. Use ISO format').optional(),
    endTime: z.string().datetime('Invalid date format. Use ISO format').optional(),
    status: z.enum(['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED']).optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  }),
});

// Schema for updating event status
export const updateEventStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid event ID format'),
  }),
  body: z.object({
    status: z.enum(['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED']),
    result: z.string().optional().refine(
      (result, ctx) => {
        if (ctx.parent.status === 'COMPLETED' && !result) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Result is required when status is COMPLETED',
          });
          return false;
        }
        return true;
      }
    ),
  }),
});

// Schema for deleting an event
export const deleteEventSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid event ID format'),
  }),
});

// Schema for adding a participant to an event
export const addParticipantSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid event ID format'),
  }),
  body: participantSchema,
});

// Schema for updating a participant
export const updateParticipantSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid participant ID format'),
  }),
  body: z.object({
    name: z.string().min(1, 'Participant name is required').optional(),
    odds: z.number().positive('Odds must be a positive number').optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  }),
});

// Schema for removing a participant
export const removeParticipantSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid participant ID format'),
  }),
});
