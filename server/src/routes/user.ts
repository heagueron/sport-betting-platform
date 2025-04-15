import express from 'express';
import { protect } from '../middleware/auth';
import { getUsers, getUser, updateRole, updateBalance } from '../controllers/user';
import prisma from '../config/prisma';

const router = express.Router();

// Routes
router.get('/', protect, (req, res, next) => {
  getUsers(req, res, next);
});

router.get('/:id', protect, (req, res, next) => {
  getUser(req, res, next);
});

router.put('/:id/role', protect, (req, res, next) => {
  updateRole(req, res, next);
});

router.put('/:id/balance', protect, (req, res, next) => {
  updateBalance(req, res, next);
});

// Ruta para actualizar un usuario
router.put('/:id', protect, async (req, res, next) => {
  try {
    // Evitar actualizar la contraseña a través de esta ruta
    if (req.body.password) {
      delete req.body.password;
    }

    const user = await prisma.user.update({
      where: {
        id: req.params.id,
      },
      data: req.body,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        balance: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// Ruta para activar un usuario
router.put('/:id/activate', protect, async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: {
        id: req.params.id,
      },
      data: {
        balance: 100, // Asignar un balance inicial al activar
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        balance: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// Ruta para desactivar un usuario
router.put('/:id/deactivate', protect, async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: {
        id: req.params.id,
      },
      data: {
        balance: 0, // Establecer balance a 0 para desactivar
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        balance: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
