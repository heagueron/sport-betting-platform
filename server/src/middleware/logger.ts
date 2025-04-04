import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Middleware to log HTTP requests
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Get the start time
  const start = Date.now();
  
  // Process the request
  next();
  
  // Log after the response is sent
  res.on('finish', () => {
    // Calculate response time
    const responseTime = Date.now() - start;
    
    // Log the request
    logger.http(req, res, responseTime);
  });
};
