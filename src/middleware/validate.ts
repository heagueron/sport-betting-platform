import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Middleware to validate request body, query, and params against a Zod schema
 * @param schema Zod schema to validate against
 * @returns Express middleware function
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request against schema
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      // If validation passes, continue to the next middleware/controller
      return next();
    } catch (error) {
      // If validation fails, format the error messages and return a 400 response
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      
      // If it's not a ZodError, pass it to the next error handler
      return next(error);
    }
  };
};
