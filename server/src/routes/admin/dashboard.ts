import express from 'express';
import { protect } from '../../middleware/auth';
import { isAdmin } from '../../middleware/isAdmin';
import { 
  getDashboard, 
  getUsersStats, 
  getTransactionsStats 
} from '../../controllers/admin/dashboard';

const router = express.Router();

// Apply middleware to all routes
router.use(protect);
router.use(isAdmin);

// Routes
router.get('/stats', getDashboard);
router.get('/users/stats', getUsersStats);
router.get('/transactions/stats', getTransactionsStats);

export default router;
