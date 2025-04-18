import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Middleware to log HTTP requests
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Get the start time
  const start = Date.now();

  // Log the request details
  console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);
  console.log(`[REQUEST BODY]`, req.body);
  console.log(`[REQUEST PARAMS]`, req.params);
  console.log(`[REQUEST QUERY]`, req.query);

  // Process the request
  next();

  // Log after the response is sent
  res.on('finish', () => {
    // Calculate response time
    const responseTime = Date.now() - start;

    // Log the request
    logger.http(req, res, responseTime);

    // Log the response status
    console.log(`[RESPONSE] ${req.method} ${req.originalUrl} - ${res.statusCode} (${responseTime}ms)`);
  });
};
