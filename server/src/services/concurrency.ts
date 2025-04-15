import { PrismaClient } from '@prisma/client';
import prisma from '../config/prisma';
import { AppError } from '../utils/errors';

/**
 * Tiempo máximo de bloqueo en milisegundos (30 segundos)
 */
const LOCK_TIMEOUT_MS = 30000;

/**
 * Número máximo de reintentos para operaciones concurrentes
 */
const MAX_RETRIES = 3;

/**
 * Tiempo de espera entre reintentos en milisegundos
 */
const RETRY_DELAY_MS = 500;

/**
 * Opciones para transacciones con aislamiento
 */
export const TRANSACTION_OPTIONS = {
  isolationLevel: 'Serializable' as const, // Nivel más alto de aislamiento
  maxWait: 5000, // Tiempo máximo de espera para adquirir un bloqueo (5 segundos)
  timeout: 10000 // Tiempo máximo para la transacción (10 segundos)
};

/**
 * Adquiere un bloqueo pesimista en un mercado
 * @param marketId ID del mercado a bloquear
 * @param tx Cliente Prisma para transacción (opcional)
 * @returns El mercado bloqueado
 * @throws Error si no se puede adquirir el bloqueo
 */
export const acquireMarketLock = async (
  marketId: string,
  tx?: PrismaClient
): Promise<any> => {
  const client = tx || prisma;

  try {
    // Verificar si el mercado ya está bloqueado
    const market = await client.market.findUnique({
      where: { id: marketId }
    });

    if (!market) {
      throw new AppError('Mercado no encontrado', 404);
    }

    // Si el mercado ya está bloqueado, verificar si el bloqueo ha expirado
    if (market.locked && market.lockedAt) {
      const lockTime = new Date(market.lockedAt).getTime();
      const currentTime = new Date().getTime();

      // Si el bloqueo no ha expirado, lanzar error
      if (currentTime - lockTime < LOCK_TIMEOUT_MS) {
        throw new AppError('Mercado temporalmente bloqueado, intente nuevamente', 409);
      }
    }

    // Adquirir el bloqueo
    return client.market.update({
      where: { id: marketId },
      data: {
        locked: true,
        lockedAt: new Date(),
        version: { increment: 1 }
      }
    });
  } catch (error: any) {
    // Si el error es porque el mercado no se encontró en la transacción
    if (error.code === 'P2025') {
      throw new AppError('Mercado temporalmente bloqueado, intente nuevamente', 409);
    }
    throw error;
  }
};

/**
 * Libera un bloqueo pesimista en un mercado
 * @param marketId ID del mercado a desbloquear
 * @param tx Cliente Prisma para transacción (opcional)
 */
export const releaseMarketLock = async (
  marketId: string,
  tx?: PrismaClient
): Promise<void> => {
  const client = tx || prisma;

  try {
    await client.market.update({
      where: { id: marketId },
      data: {
        locked: false,
        lockedAt: null
      }
    });
  } catch (error: any) {
    // Si el error es porque el mercado no se encontró, ignorarlo
    if (error.code === 'P2025') {
      console.log(`Mercado ${marketId} no encontrado al liberar bloqueo, ignorando`);
      return;
    }
    throw error;
  }
};

/**
 * Ejecuta una función con reintentos en caso de conflictos de concurrencia
 * @param fn Función a ejecutar
 * @param maxRetries Número máximo de reintentos
 * @returns Resultado de la función
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Solo reintentar si es un error de concurrencia
      if (error.code === 'P2034' || // Error de Prisma por conflicto de transacción
          error.message?.includes('could not serialize access') ||
          error.message?.includes('deadlock detected') ||
          error.message?.includes('concurrent update') ||
          error.status === 409) { // Nuestro código de error para conflictos

        // Esperar antes de reintentar
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
        continue;
      }

      // Si no es un error de concurrencia, lanzarlo inmediatamente
      throw error;
    }
  }

  // Si llegamos aquí, se agotaron los reintentos
  throw new AppError(
    `Operación fallida después de ${maxRetries} intentos: ${lastError.message}`,
    409
  );
};

/**
 * Ejecuta una operación con bloqueo de mercado
 * @param marketId ID del mercado
 * @param operation Operación a ejecutar
 * @returns Resultado de la operación
 */
export const withMarketLock = async <T>(
  marketId: string,
  operation: (tx: PrismaClient) => Promise<T>
): Promise<T> => {
  return withRetry(async () => {
    return prisma.$transaction(async (tx) => {
      try {
        // Adquirir bloqueo
        await acquireMarketLock(marketId, tx);

        // Ejecutar operación
        const result = await operation(tx);

        // Liberar bloqueo
        await releaseMarketLock(marketId, tx);

        return result;
      } catch (error) {
        // Asegurarse de liberar el bloqueo en caso de error
        try {
          await releaseMarketLock(marketId, tx);
        } catch (unlockError) {
          console.error('Error al liberar bloqueo:', unlockError);
        }

        throw error;
      }
    }, TRANSACTION_OPTIONS);
  });
};

/**
 * Añade una apuesta a la cola de procesamiento
 * @param betId ID de la apuesta
 * @returns Posición en la cola
 */
export const addBetToProcessingQueue = async (betId: string): Promise<number> => {
  // Obtener la última posición en la cola
  const lastBet = await prisma.bet.findFirst({
    orderBy: { processingQueue: 'desc' },
    select: { processingQueue: true }
  });

  const queuePosition = (lastBet?.processingQueue || 0) + 1;

  // Actualizar la apuesta con su posición en la cola
  await prisma.bet.update({
    where: { id: betId },
    data: {
      processingQueue: queuePosition,
      processingStatus: 'QUEUED'
    }
  });

  return queuePosition;
};

/**
 * Procesa la siguiente apuesta en la cola
 * @returns true si se procesó una apuesta, false si la cola está vacía
 */
export const processNextBetInQueue = async (): Promise<boolean> => {
  // Obtener la siguiente apuesta en la cola
  const nextBet = await prisma.bet.findFirst({
    where: {
      processingStatus: 'QUEUED'
    },
    orderBy: { processingQueue: 'asc' }
  });

  if (!nextBet) {
    return false; // Cola vacía
  }

  try {
    // Marcar como en procesamiento
    await prisma.bet.update({
      where: { id: nextBet.id },
      data: { processingStatus: 'PROCESSING' }
    });

    // Aquí iría la lógica para procesar la apuesta
    // Por ejemplo, llamar a betMatchingService.matchBet(nextBet.id)

    // Marcar como procesada
    await prisma.bet.update({
      where: { id: nextBet.id },
      data: { processingStatus: 'PROCESSED' }
    });

    return true;
  } catch (error) {
    // Marcar como fallida
    await prisma.bet.update({
      where: { id: nextBet.id },
      data: { processingStatus: 'FAILED' }
    });

    throw error;
  }
};

/**
 * Actualiza un usuario con bloqueo optimista
 * @param userId ID del usuario
 * @param updateData Datos a actualizar
 * @param currentVersion Versión actual del usuario
 * @returns Usuario actualizado
 */
export const updateUserWithOptimisticLock = async (
  userId: string,
  updateData: any,
  currentVersion: number
): Promise<any> => {
  return withRetry(async () => {
    try {
      return await prisma.user.update({
        where: {
          id: userId,
          version: currentVersion
        },
        data: {
          ...updateData,
          version: { increment: 1 }
        }
      });
    } catch (error: any) {
      // Si el error es porque la versión no coincide
      if (error.code === 'P2025') {
        throw new AppError('Conflicto de concurrencia: el usuario ha sido modificado', 409);
      }
      throw error;
    }
  });
};

/**
 * Actualiza una apuesta con bloqueo optimista
 * @param betId ID de la apuesta
 * @param updateData Datos a actualizar
 * @param currentVersion Versión actual de la apuesta
 * @returns Apuesta actualizada
 */
export const updateBetWithOptimisticLock = async (
  betId: string,
  updateData: any,
  currentVersion: number
): Promise<any> => {
  return withRetry(async () => {
    try {
      return await prisma.bet.update({
        where: {
          id: betId,
          version: currentVersion
        },
        data: {
          ...updateData,
          version: { increment: 1 }
        }
      });
    } catch (error: any) {
      // Si el error es porque la versión no coincide
      if (error.code === 'P2025') {
        throw new AppError('Conflicto de concurrencia: la apuesta ha sido modificada', 409);
      }
      throw error;
    }
  });
};
