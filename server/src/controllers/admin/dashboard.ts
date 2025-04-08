import { Request, Response, NextFunction } from 'express';
import { 
  getDashboardStats, 
  getUserStats, 
  getTransactionStats 
} from '../../services/dashboard';
import { logAdminAction } from '../../services/adminLog';

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
export const getDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get dashboard statistics
    const stats = await getDashboardStats();

    // Log admin action
    await logAdminAction(
      req.user.id,
      'VIEW_DASHBOARD',
      'Admin viewed dashboard statistics',
      req.ip
    );

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/admin/dashboard/users/stats
// @access  Private/Admin
export const getUsersStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get user statistics
    const stats = await getUserStats();

    // Log admin action
    await logAdminAction(
      req.user.id,
      'VIEW_USER_STATS',
      'Admin viewed user statistics',
      req.ip
    );

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction statistics
// @route   GET /api/admin/dashboard/transactions/stats
// @access  Private/Admin
export const getTransactionsStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get transaction statistics
    const stats = await getTransactionStats();

    // Log admin action
    await logAdminAction(
      req.user.id,
      'VIEW_TRANSACTION_STATS',
      'Admin viewed transaction statistics',
      req.ip
    );

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
