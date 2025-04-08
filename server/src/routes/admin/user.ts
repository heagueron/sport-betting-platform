import express from 'express';
import { protect } from '../../middleware/auth';
import { isAdmin } from '../../middleware/isAdmin';
import { validate } from '../../middleware/validate';
import { 
  getUsers, 
  getUserById, 
  updateUserById, 
  updateUserRoleById, 
  updateUserBalanceById 
} from '../../controllers/admin/user';
import { 
  updateUserSchema, 
  updateUserRoleSchema, 
  updateUserBalanceSchema,
  userQuerySchema
} from '../../schemas/admin.schema';

const router = express.Router();

// Apply middleware to all routes
router.use(protect);
router.use(isAdmin);

// Routes
router.get('/', validate(userQuerySchema), getUsers);
router.get('/:id', getUserById);
router.put('/:id', validate(updateUserSchema), updateUserById);
router.patch('/:id/role', validate(updateUserRoleSchema), updateUserRoleById);
router.patch('/:id/balance', validate(updateUserBalanceSchema), updateUserBalanceById);

export default router;
