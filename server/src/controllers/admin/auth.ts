import { Request, Response, NextFunction } from 'express';
import { getUserById } from '../../services/auth';
import { logAdminAction } from '../../services/adminLog';

// @desc    Get current admin user
// @route   GET /api/admin/auth/me
// @access  Private/Admin
export const getAdminUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // req.user is set in the auth middleware
    const user = await getUserById(req.user.id);

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
      'ADMIN_AUTH',
      'Admin accessed their profile',
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
