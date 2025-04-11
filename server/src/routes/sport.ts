import express from 'express';
import { protect, restrictTo } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createSport,
  getSports,
  getSport,
  getSportEvents,
  updateSport,
  deleteSport,
  activateSport,
  deactivateSport
} from '../controllers/sport';
import {
  createSportSchema,
  getSportsSchema,
  getSportSchema,
  getSportEventsSchema,
  updateSportSchema,
  deleteSportSchema
} from '../schemas/sport.schema';

const router = express.Router();

// Routes
router.post('/',
  protect as any,
  restrictTo(['ADMIN']) as any,
  validate(createSportSchema),
  createSport as any
);

router.get('/',
  validate(getSportsSchema),
  getSports as any
);

router.get('/:id',
  validate(getSportSchema),
  getSport as any
);

router.get('/:id/events',
  validate(getSportEventsSchema),
  getSportEvents as any
);

router.put('/:id',
  protect as any,
  restrictTo(['ADMIN']) as any,
  validate(updateSportSchema),
  updateSport as any
);

router.delete('/:id',
  protect as any,
  restrictTo(['ADMIN']) as any,
  validate(deleteSportSchema),
  deleteSport as any
);

// Activar un deporte
router.put('/:id/activate',
  protect as any,
  restrictTo(['ADMIN']) as any,
  activateSport as any
);

// Desactivar un deporte
router.put('/:id/deactivate',
  protect as any,
  restrictTo(['ADMIN']) as any,
  deactivateSport as any
);

export default router;
