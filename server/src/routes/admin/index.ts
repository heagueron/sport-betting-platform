import express from 'express';
import authRoutes from './auth';
import userRoutes from './user';
import transactionRoutes from './transaction';
import dashboardRoutes from './dashboard';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/transactions', transactionRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
