import express, { Request, Response } from 'express';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { register, login, logout, getMe, updateDetails } from '../controllers/auth';
import { registerSchema, loginSchema, updateDetailsSchema, updatePasswordSchema } from '../schemas/auth.schema';

const router = express.Router();

// Routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/logout', logout);
router.get('/me', protect, getMe);

// Update user details
router.put('/updatedetails', protect, validate(updateDetailsSchema), updateDetails);

router.put('/updatepassword', protect, validate(updatePasswordSchema), (req: Request, res: Response): void => {
  res.status(200).json({ success: true, message: 'Update password route' });
});

export default router;
