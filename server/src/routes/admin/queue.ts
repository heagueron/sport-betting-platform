import express from 'express';
import * as queueController from '../../controllers/admin/queue';
import { protect, restrictTo } from '../../middleware/auth';

const router = express.Router();

// Proteger todas las rutas
router.use(protect);
router.use(restrictTo(['ADMIN']) as any);

// Rutas
router.get('/stats', queueController.getQueueStats);
router.post('/retry', queueController.retryFailedBets);
router.post('/pause', queueController.pauseProcessor);
router.post('/resume', queueController.resumeProcessor);

export default router;
