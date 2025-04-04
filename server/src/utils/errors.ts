/**
 * Custom error classes for the application
 */

/**
 * Base class for all application errors
 */
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error for when a resource is not found
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * Error for when a request is unauthorized
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401);
  }
}

/**
 * Error for when a user doesn't have permission to access a resource
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden access') {
    super(message, 403);
  }
}

/**
 * Error for when a request is invalid
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request') {
    super(message, 400);
  }
}

/**
 * Error for when a resource already exists
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409);
  }
}

/**
 * Error for when there's a validation error
 */
export class ValidationError extends AppError {
  errors: Record<string, string>;

  constructor(message: string = 'Validation error', errors: Record<string, string> = {}) {
    super(message, 400);
    this.errors = errors;
  }
}

/**
 * Error for when there's a database error
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database error') {
    super(message, 500);
  }
}

/**
 * Error for when there's a service error
 */
export class ServiceError extends AppError {
  constructor(message: string = 'Service error') {
    super(message, 500);
  }
}
