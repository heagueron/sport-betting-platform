import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';
import { logger } from '../utils/logger';
import { AppError, ValidationError } from '../utils/errors';

// Define a type for our error response structure
interface ErrorResponseBody {
  success: boolean;
  error: string;
  statusCode: number;
  errors?: Record<string, any>;
  stack?: string;
  timestamp: string;
  path: string;
}

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default error response
  const errorResponse: ErrorResponseBody = {
    success: false,
    error: 'Internal Server Error',
    statusCode: 500,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  };

  // Add stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Handle AppError (our custom error class)
  if (err instanceof AppError) {
    errorResponse.error = err.message;
    errorResponse.statusCode = err.statusCode;

    // Add validation errors if available
    if (err instanceof ValidationError && err.errors) {
      errorResponse.errors = err.errors;
    }
  }
  // Handle Zod validation errors
  else if (err instanceof ZodError) {
    errorResponse.error = 'Validation error';
    errorResponse.statusCode = 400;
    errorResponse.errors = err.errors.reduce((acc: Record<string, string>, curr) => {
      // Create a readable path from the error path
      const path = curr.path.join('.');
      acc[path] = curr.message;
      return acc;
    }, {});
  }
  // Handle Prisma errors
  else if (err instanceof PrismaClientKnownRequestError) {
    // Handle specific Prisma error codes
    switch (err.code) {
      case 'P2002': // Unique constraint violation
        errorResponse.error = 'Duplicate value for a unique field';
        errorResponse.statusCode = 409; // Conflict
        errorResponse.errors = {
          field: (err.meta?.target as string[]) || ['unknown'],
          message: 'This value already exists and must be unique'
        };
        break;
      case 'P2025': // Record not found
        errorResponse.error = 'Resource not found';
        errorResponse.statusCode = 404;
        break;
      case 'P2003': // Foreign key constraint failed
        errorResponse.error = 'Related resource not found';
        errorResponse.statusCode = 400;
        break;
      default:
        errorResponse.error = 'Database error';
        errorResponse.statusCode = 500;
    }
  }
  // Handle Prisma validation errors
  else if (err instanceof PrismaClientValidationError) {
    errorResponse.error = 'Database validation error';
    errorResponse.statusCode = 400;
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    errorResponse.error = 'Invalid token';
    errorResponse.statusCode = 401;
  }
  else if (err.name === 'TokenExpiredError') {
    errorResponse.error = 'Token expired';
    errorResponse.statusCode = 401;
  }
  // Handle other common errors
  else if (err.name === 'SyntaxError') {
    errorResponse.error = 'Syntax error in request';
    errorResponse.statusCode = 400;
  }
  else if (err.name === 'TypeError') {
    errorResponse.error = 'Type error occurred';
    errorResponse.statusCode = 500;
  }

  // Log the error
  if (errorResponse.statusCode >= 500) {
    logger.error(`Server error: ${err.message}`, err);
  } else {
    logger.warn(`Client error: ${err.message}`, {
      statusCode: errorResponse.statusCode,
      path: req.originalUrl,
      method: req.method,
      ip: req.ip,
      ...(errorResponse.errors ? { errors: errorResponse.errors } : {})
    });
  }

  // Send the error response
  res.status(errorResponse.statusCode).json(errorResponse);
};
