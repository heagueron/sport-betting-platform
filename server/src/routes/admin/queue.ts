import express from 'express';
import * as queueController from '../../controllers/queue';
import { protect, restrictTo } from '../../middleware/auth';

const router = express.Router();

// Proteger todas las rutas
router.use(protect);
router.use(restrictTo('ADMIN'));

// Rutas
router.get('/stats', queueController.getQueueStats);
router.post('/retry', queueController.retryFailedBets);
router.get('/bets', queueController.getQueuedBets);

export default router;
