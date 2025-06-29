export class AppError extends Error {
  status: number;
  isOperational: boolean;
  constructor(message: string, status = 500, isOperational = true) {
    super(message);
    this.status = status;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export type CorsError = { message: string };

export type CsrfError = { code: string };

export type RateLimitError = { status: number };
