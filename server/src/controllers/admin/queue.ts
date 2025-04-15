import { Request, Response, NextFunction } from 'express';
import * as queueProcessor from '../../services/queueProcessor';
import { AppError } from '../../utils/appError';

/**
 * Obtiene estadísticas de la cola de procesamiento
 */
export const getQueueStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await queueProcessor.getQueueStats();
    const status = queueProcessor.getProcessorStatus();
    
    res.status(200).json({
      success: true,
      data: {
        ...stats,
        ...status
      }
    });
  } catch (error) {
    next(new AppError('Error al obtener estadísticas de la cola', 500));
  }
};

/**
 * Pausa el procesador de cola
 */
export const pauseProcessor = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    queueProcessor.pauseQueueProcessor();
    
    res.status(200).json({
      success: true,
      message: 'Procesador de cola pausado',
      data: {
        paused: true
      }
    });
  } catch (error) {
    next(new AppError('Error al pausar el procesador de cola', 500));
  }
};

/**
 * Reanuda el procesador de cola
 */
export const resumeProcessor = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    queueProcessor.resumeQueueProcessor();
    
    res.status(200).json({
      success: true,
      message: 'Procesador de cola reanudado',
      data: {
        paused: false
      }
    });
  } catch (error) {
    next(new AppError('Error al reanudar el procesador de cola', 500));
  }
};

/**
 * Reinicia el procesamiento de apuestas fallidas
 */
export const retryFailedBets = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const count = await queueProcessor.retryFailedBets();
    
    res.status(200).json({
      success: true,
      message: `${count} apuestas reiniciadas`,
      data: {
        count
      }
    });
  } catch (error) {
    next(new AppError('Error al reiniciar apuestas fallidas', 500));
  }
};
