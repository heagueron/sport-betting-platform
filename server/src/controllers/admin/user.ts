import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { 
  getAllUsers, 
  getUserWithDetails, 
  updateUser, 
  updateUserRole, 
  updateUserBalance 
} from '../../services/user';
import { logAdminAction } from '../../services/adminLog';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Parse query parameters
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '10', 10);
    const search = req.query.search as string;

    // Get users
    const result = await getAllUsers(page, limit, search);

    // Log admin action
    await logAdminAction(
      req.user.id,
      'LIST_USERS',
      `Admin viewed user list (page ${page}, limit ${limit})`,
      req.ip
    );

    res.status(200).json({
      success: true,
      data: result.users,
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

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;

    // Get user
    const user = await getUserWithDetails(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Log admin action
    await logAdminAction(
      req.user.id,
      'VIEW_USER',
      `Admin viewed user details for user ${userId}`,
      req.ip
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    const { name, email } = req.body;

    // Validate input
    if (!name && !email) {
      res.status(400).json({
        success: false,
        error: 'Please provide at least one field to update'
      });
      return;
    }

    // Update user
    const user = await updateUser(userId, { name, email });

    // Log admin action
    await logAdminAction(
      req.user.id,
      'UPDATE_USER',
      `Admin updated user ${userId} (name: ${name}, email: ${email})`,
      req.ip
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PATCH /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRoleById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    // Validate input
    if (!role || !Object.values(Role).includes(role as Role)) {
      res.status(400).json({
        success: false,
        error: 'Please provide a valid role'
      });
      return;
    }

    // Update user role
    const user = await updateUserRole(userId, role as Role);

    // Log admin action
    await logAdminAction(
      req.user.id,
      'UPDATE_USER_ROLE',
      `Admin updated role for user ${userId} to ${role}`,
      req.ip
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user balance
// @route   PATCH /api/admin/users/:id/balance
// @access  Private/Admin
export const updateUserBalanceById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    const { amount } = req.body;

    // Validate input
    if (amount === undefined || isNaN(amount)) {
      res.status(400).json({
        success: false,
        error: 'Please provide a valid amount'
      });
      return;
    }

    // Update user balance
    const user = await updateUserBalance(userId, parseFloat(amount));

    // Log admin action
    await logAdminAction(
      req.user.id,
      'UPDATE_USER_BALANCE',
      `Admin updated balance for user ${userId} by ${amount}`,
      req.ip
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Insufficient balance') {
      res.status(400).json({
        success: false,
        error: 'Insufficient balance'
      });
      return;
    }
    next(error);
  }
};
