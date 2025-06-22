import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.client';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction // eslint-disable-line
) {
  logger.error('Unhandled error:', err);

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
