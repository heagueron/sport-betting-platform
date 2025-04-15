import { Request, Response, NextFunction } from 'express';
import * as queueProcessor from '../services/queueProcessor';
import { AppError } from '../utils/errors';
import prisma from '../config/prisma';

/**
 * Obtener estadísticas de la cola de procesamiento
 * @route GET /api/admin/queue/stats
 * @access Private (Admin)
 */
export const getQueueStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await queueProcessor.getQueueStats();

    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reintentar apuestas fallidas
 * @route POST /api/admin/queue/retry
 * @access Private (Admin)
 */
export const retryFailedBets = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const count = await queueProcessor.retryFailedBets();

    res.status(200).json({
      status: 'success',
      message: `${count} apuestas han sido puestas en cola para reprocesamiento`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener información detallada de apuestas en la cola
 * @route GET /api/admin/queue/bets
 * @access Private (Admin)
 */
export const getQueuedBets = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const status = req.query.status as string || 'QUEUED';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Validar el estado
    const validStatuses = ['QUEUED', 'PROCESSING', 'PROCESSED', 'FAILED'];
    if (!validStatuses.includes(status)) {
      throw new AppError(`Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`, 400);
    }

    // Calcular skip para paginación
    const skip = (page - 1) * limit;

    // Obtener apuestas
    const bets = await prisma.bet.findMany({
      where: {
        processingStatus: status
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        market: true,
        event: true
      },
      orderBy: {
        processingQueue: 'asc'
      },
      skip,
      take: limit
    });

    // Obtener conteo total
    const total = await prisma.bet.count({
      where: {
        processingStatus: status
      }
    });

    // Calcular páginas totales
    const pages = Math.ceil(total / limit);

    res.status(200).json({
      status: 'success',
      data: {
        bets,
        total,
        page,
        pages
      }
    });
  } catch (error) {
    next(error);
  }
};
