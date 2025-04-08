import express from 'express';
import { protect } from '../../middleware/auth';
import { isAdmin } from '../../middleware/isAdmin';
import { validate } from '../../middleware/validate';
import {
  getTransactions,
  getTransactionByIdController,
  approveTransaction,
  completeTransaction,
  rejectTransaction
} from '../../controllers/admin/transaction';
import {
  approveTransactionSchema,
  completeTransactionSchema,
  rejectTransactionSchema,
  transactionQuerySchema
} from '../../schemas/admin.schema';

const router = express.Router();

// Apply middleware to all routes
router.use(protect);
router.use(isAdmin);

// Routes
router.get('/', validate(transactionQuerySchema), getTransactions);
router.get('/:id', getTransactionByIdController);
router.patch('/:id/approve', validate(approveTransactionSchema), approveTransaction);
router.patch('/:id/complete', validate(completeTransactionSchema), completeTransaction);
router.patch('/:id/reject', validate(rejectTransactionSchema), rejectTransaction);

export default router;
