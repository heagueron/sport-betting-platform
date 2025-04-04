import express, { Request, Response } from 'express';
import { protect } from '../middleware/auth';
import { register, login, logout, getMe } from '../controllers/auth';

const router = express.Router();

// Routes
router.post('/register', register as any);
router.post('/login', login as any);
router.get('/logout', logout);
router.get('/me', protect as any, getMe as any);

// These routes will be implemented later
router.put('/updatedetails', protect as any, (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Update user details route' });
});

router.put('/updatepassword', protect as any, (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Update password route' });
});

export default router;
