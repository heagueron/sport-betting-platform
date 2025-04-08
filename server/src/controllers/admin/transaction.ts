import { Request, Response, NextFunction } from 'express';
import { TransactionStatus, TransactionType } from '@prisma/client';
import {
  getAllTransactions,
  getTransactionById,
  updateTransactionStatus
} from '../../services/transaction';
import { updateUserBalance } from '../../services/user';
import { logAdminAction } from '../../services/adminLog';

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Private/Admin
export const getTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Parse query parameters
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '10', 10);
    const status = req.query.status as TransactionStatus;
    const type = req.query.type as TransactionType;
    const userId = req.query.userId as string;

    // Get transactions
    const result = await getAllTransactions(page, limit, status, type, userId);

    // Log admin action
    await logAdminAction(
      req.user.id,
      'LIST_TRANSACTIONS',
      `Admin viewed transaction list (page ${page}, limit ${limit})`,
      req.ip
    );

    res.status(200).json({
      success: true,
      data: result.transactions,
      pagination: {
        page: result.page,
        pages: result.pages,
        total: result.total
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction by ID
// @route   GET /api/admin/transactions/:id
// @access  Private/Admin
export const getTransactionByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const transactionId = req.params.id;

    // Get transaction
    const transaction = await getTransactionById(transactionId);

    if (!transaction) {
      res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
      return;
    }

    // Log admin action
    await logAdminAction(
      req.user.id,
      'VIEW_TRANSACTION',
      `Admin viewed transaction details for transaction ${transactionId}`,
      req.ip
    );

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve transaction
// @route   PATCH /api/admin/transactions/:id/approve
// @access  Private/Admin
export const approveTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const transactionId = req.params.id;
    const { notes } = req.body;

    // Get transaction
    const transaction = await getTransactionById(transactionId);

    if (!transaction) {
      res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
      return;
    }

    // Check if transaction is pending
    if (transaction.status !== TransactionStatus.PENDING) {
      res.status(400).json({
        success: false,
        error: 'Only pending transactions can be approved'
      });
      return;
    }

    // Update transaction status
    const updatedTransaction = await updateTransactionStatus(
      transactionId,
      TransactionStatus.APROBADA,
      notes
    );

    // Log admin action
    await logAdminAction(
      req.user.id,
      'APPROVE_TRANSACTION',
      `Admin approved transaction ${transactionId}`,
      req.ip
    );

    res.status(200).json({
      success: true,
      data: updatedTransaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete transaction
// @route   PATCH /api/admin/transactions/:id/complete
// @access  Private/Admin
export const completeTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const transactionId = req.params.id;
    const { notes } = req.body;

    // Get transaction
    const transaction = await getTransactionById(transactionId);

    if (!transaction) {
      res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
      return;
    }

    // Check if transaction is approved
    if (transaction.status !== TransactionStatus.APROBADA) {
      res.status(400).json({
        success: false,
        error: 'Only approved transactions can be completed'
      });
      return;
    }

    // Update transaction status
    const updatedTransaction = await updateTransactionStatus(
      transactionId,
      TransactionStatus.COMPLETADA,
      notes
    );

    // Update user balance for deposits and withdrawals
    if (transaction.type === TransactionType.DEPOSIT) {
      await updateUserBalance(transaction.userId, transaction.amount);
    } else if (transaction.type === TransactionType.WITHDRAWAL) {
      await updateUserBalance(transaction.userId, -transaction.amount);
    }

    // Log admin action
    await logAdminAction(
      req.user.id,
      'COMPLETE_TRANSACTION',
      `Admin completed transaction ${transactionId}`,
      req.ip
    );

    res.status(200).json({
      success: true,
      data: updatedTransaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject transaction
// @route   PATCH /api/admin/transactions/:id/reject
// @access  Private/Admin
export const rejectTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const transactionId = req.params.id;
    const { notes } = req.body;

    // Validate input
    if (!notes) {
      res.status(400).json({
        success: false,
        error: 'Please provide rejection notes'
      });
      return;
    }

    // Get transaction
    const transaction = await getTransactionById(transactionId);

    if (!transaction) {
      res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
      return;
    }

    // Check if transaction is pending or approved
    if (
      transaction.status !== TransactionStatus.PENDING &&
      transaction.status !== TransactionStatus.APROBADA
    ) {
      res.status(400).json({
        success: false,
        error: 'Only pending or approved transactions can be rejected'
      });
      return;
    }

    // Update transaction status
    const updatedTransaction = await updateTransactionStatus(
      transactionId,
      TransactionStatus.FALLIDA,
      notes
    );

    // Log admin action
    await logAdminAction(
      req.user.id,
      'REJECT_TRANSACTION',
      `Admin rejected transaction ${transactionId}`,
      req.ip
    );

    res.status(200).json({
      success: true,
      data: updatedTransaction
    });
  } catch (error) {
    next(error);
  }
};
