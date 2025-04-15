import api from './api';

/**
 * Obtiene estadísticas de la cola de procesamiento
 */
export const getQueueStats = async () => {
  const response = await api.get('/admin/queue/stats');
  return response.data;
};

/**
 * Pausa el procesador de cola
 */
export const pauseProcessor = async () => {
  const response = await api.post('/admin/queue/pause');
  return response.data;
};

/**
 * Reanuda el procesador de cola
 */
export const resumeProcessor = async () => {
  const response = await api.post('/admin/queue/resume');
  return response.data;
};

/**
 * Reinicia el procesamiento de apuestas fallidas
 */
export const retryFailedBets = async () => {
  const response = await api.post('/admin/queue/retry');
  return response.data;
};
