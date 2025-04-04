import express from 'express';
import { protect, restrictTo } from '../middleware/auth';
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

const router = express.Router();

// Event routes
router.post('/', protect as any, restrictTo(['ADMIN']) as any, createNewEvent as any);
router.get('/', getEvents as any);
router.get('/:id', getEvent as any);
router.put('/:id', protect as any, restrictTo(['ADMIN']) as any, updateEvent as any);
router.put('/:id/status', protect as any, restrictTo(['ADMIN']) as any, updateStatus as any);
router.delete('/:id', protect as any, restrictTo(['ADMIN']) as any, deleteEvent as any);

// Participant routes
router.post('/:id/participants', protect as any, restrictTo(['ADMIN']) as any, addEventParticipant as any);
router.put('/participants/:id', protect as any, restrictTo(['ADMIN']) as any, updateEventParticipant as any);
router.delete('/participants/:id', protect as any, restrictTo(['ADMIN']) as any, removeEventParticipant as any);

export default router;
