import express from 'express';
import { protect, restrictTo } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createNewEvent,
  getEvents,
  getEvent,
  updateEvent,
  updateStatus,
  deleteEvent,
  addEventParticipant,
  updateEventParticipant,
  removeEventParticipant
} from '../controllers/event';
import { getMarketsByEvent } from '../controllers/market';
import {
  createEventSchema,
  getEventsSchema,
  getEventSchema,
  updateEventSchema,
  updateEventStatusSchema,
  deleteEventSchema,
  addParticipantSchema,
  updateParticipantSchema,
  removeParticipantSchema
} from '../schemas/event.schema';
import { getMarketsByEventSchema } from '../schemas/market';

const router = express.Router();

// Event routes
router.post('/',
  protect as any,
  restrictTo(['ADMIN']) as any,
  validate(createEventSchema),
  createNewEvent as any
);

router.get('/',
  validate(getEventsSchema),
  getEvents as any
);

router.get('/:id',
  validate(getEventSchema),
  getEvent as any
);

router.put('/:id',
  protect as any,
  restrictTo(['ADMIN']) as any,
  validate(updateEventSchema),
  updateEvent as any
);

router.put('/:id/status',
  protect as any,
  restrictTo(['ADMIN']) as any,
  validate(updateEventStatusSchema),
  updateStatus as any
);

router.delete('/:id',
  protect as any,
  restrictTo(['ADMIN']) as any,
  validate(deleteEventSchema),
  deleteEvent as any
);

// Market routes
router.get('/:id/markets',
  validate(getMarketsByEventSchema),
  getMarketsByEvent as any
);

// Participant routes
router.post('/:id/participants',
  protect as any,
  restrictTo(['ADMIN']) as any,
  validate(addParticipantSchema),
  addEventParticipant as any
);

router.put('/participants/:id',
  protect as any,
  restrictTo(['ADMIN']) as any,
  validate(updateParticipantSchema),
  updateEventParticipant as any
);

router.delete('/participants/:id',
  protect as any,
  restrictTo(['ADMIN']) as any,
  validate(removeParticipantSchema),
  removeEventParticipant as any
);

export default router;
