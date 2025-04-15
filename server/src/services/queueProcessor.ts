import * as betMatchingService from './betMatching';
import * as concurrencyService from './concurrency';
import prisma from '../config/prisma';

/**
 * Intervalo de procesamiento de la cola en milisegundos (1 segundo)
 */
const QUEUE_PROCESSING_INTERVAL_MS = 1000;

/**
 * Número máximo de apuestas a procesar en cada ciclo
 */
const MAX_BETS_PER_CYCLE = 10;

/**
 * Flag para indicar si el procesador está activo
 */
let isProcessorRunning = false;

/**
 * Procesa la cola de apuestas pendientes
 */
export const processQueue = async (): Promise<void> => {
  if (isProcessorRunning) {
    return; // Evitar ejecuciones simultáneas
  }

  try {
    isProcessorRunning = true;

    // Obtener las próximas apuestas en la cola
    const pendingBets = await prisma.bet.findMany({
      where: {
        processingStatus: 'QUEUED'
      },
      orderBy: { processingQueue: 'asc' },
      take: MAX_BETS_PER_CYCLE
    });

    // Procesar cada apuesta
    for (const bet of pendingBets) {
      try {
        // Marcar como en procesamiento
        await prisma.bet.update({
          where: { id: bet.id },
          data: { processingStatus: 'PROCESSING' }
        });

        // Procesar la apuesta
        await betMatchingService.matchBet(bet.id);

        // La apuesta se marca como procesada dentro de matchBet
      } catch (error) {
        console.error(`Error processing bet ${bet.id}:`, error);

        // Marcar como fallida
        await prisma.bet.update({
          where: { id: bet.id },
          data: { processingStatus: 'FAILED' }
        });
      }
    }
  } catch (error) {
    console.error('Error in queue processor:', error);
  } finally {
    isProcessorRunning = false;
  }
};

/**
 * Inicia el procesador de cola en segundo plano
 */
export const startQueueProcessor = (): NodeJS.Timeout => {
  console.log('Starting bet queue processor...');
  
  // Iniciar el procesador de cola en un intervalo
  return setInterval(processQueue, QUEUE_PROCESSING_INTERVAL_MS);
};

/**
 * Detiene el procesador de cola
 * @param intervalId ID del intervalo a detener
 */
export const stopQueueProcessor = (intervalId: NodeJS.Timeout): void => {
  console.log('Stopping bet queue processor...');
  clearInterval(intervalId);
};

/**
 * Reinicia el procesamiento de apuestas fallidas
 * @returns Número de apuestas reiniciadas
 */
export const retryFailedBets = async (): Promise<number> => {
  // Obtener apuestas fallidas
  const failedBets = await prisma.bet.findMany({
    where: {
      processingStatus: 'FAILED'
    }
  });

  // Reiniciar el procesamiento
  for (const bet of failedBets) {
    await prisma.bet.update({
      where: { id: bet.id },
      data: { processingStatus: 'QUEUED' }
    });
  }

  return failedBets.length;
};

/**
 * Obtiene estadísticas de la cola de procesamiento
 * @returns Estadísticas de la cola
 */
export const getQueueStats = async (): Promise<{
  queued: number;
  processing: number;
  processed: number;
  failed: number;
}> => {
  const stats = await prisma.$transaction([
    prisma.bet.count({ where: { processingStatus: 'QUEUED' } }),
    prisma.bet.count({ where: { processingStatus: 'PROCESSING' } }),
    prisma.bet.count({ where: { processingStatus: 'PROCESSED' } }),
    prisma.bet.count({ where: { processingStatus: 'FAILED' } })
  ]);

  return {
    queued: stats[0],
    processing: stats[1],
    processed: stats[2],
    failed: stats[3]
  };
};
