import express from 'express';
import { protect, restrictTo } from '../middleware/auth';
import {
  createSport,
  getSports,
  getSport,
  getSportEvents,
  updateSport,
  deleteSport
} from '../controllers/sport';

const router = express.Router();

// Routes
router.post('/', protect as any, restrictTo(['ADMIN']) as any, createSport as any);

router.get('/', getSports as any);

router.get('/:id', getSport as any);

router.get('/:id/events', getSportEvents as any);

router.put('/:id', protect as any, restrictTo(['ADMIN']) as any, updateSport as any);

router.delete('/:id', protect as any, restrictTo(['ADMIN']) as any, deleteSport as any);

export default router;
