import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.client';
import { config } from '../config/api';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const durationMs = (seconds * 1e3 + nanoseconds / 1e6).toFixed(2);

    const logMessage = config.isProd
      ? `${req.method} ${req.originalUrl} ${res.statusCode} - ${durationMs}ms`
      : `${req.method} ${req.originalUrl} ${res.statusCode} - ${durationMs}ms`;

    const meta: Record<string, unknown> = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: Number(durationMs),
      ip: req.ip,
      ...(config.isProd ? { requestId: req.requestId } : {}),
    };

    logger.info(logMessage, meta);
  });

  next();
}
