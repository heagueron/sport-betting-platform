import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        balance: true,
        createdAt: true,
        updatedAt: true,
        // Excluimos el password por seguridad
        password: false,
      },
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.params.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        balance: true,
        createdAt: true,
        updatedAt: true,
        // Excluimos el password por seguridad
        password: false,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
export const updateRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { role } = req.body;

    if (!role || (role !== 'USER' && role !== 'ADMIN')) {
      return res.status(400).json({
        success: false,
        error: 'Por favor proporcione un rol válido (USER o ADMIN)',
      });
    }

    const user = await prisma.user.update({
      where: {
        id: req.params.id,
      },
      data: {
        role,
      },
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user balance
// @route   PUT /api/users/:id/balance
// @access  Private/Admin
export const updateBalance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { balance } = req.body;

    if (balance === undefined || isNaN(Number(balance))) {
      return res.status(400).json({
        success: false,
        error: 'Por favor proporcione un balance válido',
      });
    }

    const user = await prisma.user.update({
      where: {
        id: req.params.id,
      },
      data: {
        balance: Number(balance),
      },
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
