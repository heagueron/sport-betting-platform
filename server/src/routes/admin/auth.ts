import express from 'express';
import { protect } from '../../middleware/auth';
import { isAdmin } from '../../middleware/isAdmin';
import { getAdminUser } from '../../controllers/admin/auth';

const router = express.Router();

// Apply middleware to all routes
router.use(protect);
router.use(isAdmin);

// Routes
router.get('/me', getAdminUser);

export default router;
