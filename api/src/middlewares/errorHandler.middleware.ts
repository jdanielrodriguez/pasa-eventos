import { Request, Response, NextFunction } from 'express';
import { config } from '../config/api';
import { logger } from '../config/logger.client';
import { AppError, CorsError, CsrfError, RateLimitError } from '../types/appError';

function serializeError(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
      ...err,
    };
  }
  if (typeof err === 'object' && err !== null) {
    return { ...err };
  }
  return { message: String(err) };
}

export function truncate(obj: unknown, maxLen = 300): string {
  let str: string;
  if (typeof obj === 'string') {
    str = obj;
  } else {
    try {
      str = JSON.stringify(obj);
    } catch {
      str = String(obj);
    }
  }
  return str.length > maxLen ? str.slice(0, maxLen) + '...' : str;
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  const appError = err instanceof AppError ? err : null;

  const isCors = typeof err === 'object' && err !== null && 'message' in err && (err as CorsError).message === 'Not allowed by CORS';
  const isCsrf = typeof err === 'object' && err !== null && 'code' in err && (err as CsrfError).code === 'EBADCSRFTOKEN';
  const isRateLimit = typeof err === 'object' && err !== null && 'status' in err && (err as RateLimitError).status === 429;

  let status = appError?.status || 500;
  let message = appError?.isOperational
    ? appError.message
    : 'Unexpected server error';

  if (isCors || isCsrf) {
    status = 403;
    message = 'Request not allowed by CORS policy.';
  }
  if (isRateLimit) {
    status = 429;
    message = 'Too many requests. Please try again later.';
  }

  if (config.isProd) {
    if (!appError) {
      logger.error('Unhandled error', {
        requestId: req.requestId,
        ...serializeError(err),
      });
    } else {
      logger.warn('Handled error', {
        requestId: req.requestId,
        ...serializeError(appError),
      });
    }
  } else {
    if (!appError) {
      logger.error('Unhandled error', serializeError(err));
    } else {
      logger.warn('Handled error', serializeError(appError));
    }
  }

  const response: Record<string, unknown> = {
    error: appError?.name || (typeof err === 'object' && err && 'name' in err ? (err as { name?: string }).name : 'InternalServerError'),
    message,
  };

  if (config.isProd) {
    response.requestId = req.requestId;
    response.detail = truncate((err as Error).message ?? '', 300);
    if ((err as Error).stack) {
      response.stack = truncate((err as Error).stack ?? '', 300);
    }
  } else {
    response.stack = (err as Error).stack;
    response.detail = serializeError(err);
  }

  res.status(status).json(response);
}
