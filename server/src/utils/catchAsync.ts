import { Request, Response, NextFunction } from 'express';

/**
 * Wrapper function to catch async errors
 * @param fn Async function to wrap
 * @returns Express middleware function
 */
export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
