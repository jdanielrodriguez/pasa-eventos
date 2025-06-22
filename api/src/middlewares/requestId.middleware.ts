import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  req.requestId = req.headers['x-request-id'] as string || randomUUID();
  res.setHeader('X-Request-Id', req.requestId);

  next();
}
