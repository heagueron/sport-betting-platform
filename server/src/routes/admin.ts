import express from 'express';
import adminRoutes from './admin/index';

const router = express.Router();

// Mount admin routes
router.use('/', adminRoutes);

export default router;
