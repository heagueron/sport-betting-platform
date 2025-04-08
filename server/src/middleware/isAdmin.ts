import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';

/**
 * Middleware to check if the user is an admin
 * @param req Express request
 * @param res Express response
 * @param next Express next function
 */
export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check if user exists and is an admin
  if (!req.user || req.user.role !== Role.ADMIN) {
    res.status(403).json({
      success: false,
      error: 'Access denied. Admin role required.'
    });
    return;
  }

  next();
};
