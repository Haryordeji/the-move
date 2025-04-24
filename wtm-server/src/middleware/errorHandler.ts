import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  
  console.error(`[ERROR] ${err.message}`);
  
  res.status(statusCode).json({
    status: 'error',
    message: statusCode === 500 ? 'An unexpected error occurred' : err.message,
  });
};

// Create custom error with status code
export const createError = (message: string, statusCode: number): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  return error;
};