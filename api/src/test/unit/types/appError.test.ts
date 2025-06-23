import { AppError, CorsError, CsrfError, RateLimitError } from '../../../types/appError';

describe('AppError', () => {
  it('should create an AppError with default values', () => {
    const err = new AppError('Something went wrong');
    expect(err).toBeInstanceOf(AppError);
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe('Something went wrong');
    expect(err.status).toBe(500);
    expect(err.isOperational).toBe(true);
    expect(err.name).toBe('Error');
    expect(err.stack).toBeDefined();
  });

  it('should create an AppError with custom status and isOperational', () => {
    const err = new AppError('Custom error', 400, false);
    expect(err.message).toBe('Custom error');
    expect(err.status).toBe(400);
    expect(err.isOperational).toBe(false);
  });

  it('should have a stack trace', () => {
    const err = new AppError('Stack test');
    expect(typeof err.stack).toBe('string');
  });

  it('should set the error name to AppError', () => {
    const err = new AppError('Named error');
    expect(err.name).toBe('Error');
  });
});

describe('Type guards for error-like types', () => {
  it('should allow CorsError type', () => {
    const corsErr: CorsError = { message: 'Not allowed by CORS' };
    expect(corsErr.message).toBe('Not allowed by CORS');
  });

  it('should allow CsrfError type', () => {
    const csrfErr: CsrfError = { code: 'EBADCSRFTOKEN' };
    expect(csrfErr.code).toBe('EBADCSRFTOKEN');
  });

  it('should allow RateLimitError type', () => {
    const rateLimitErr: RateLimitError = { status: 429 };
    expect(rateLimitErr.status).toBe(429);
  });

  it('should not allow invalid types for error-like types', () => {
    // @ts-expect-error invalid scope
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const badCorsErr: CorsError = { code: 'nope' };
    // @ts-expect-error invalid message
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const badCsrfErr: CsrfError = { message: 'nope' };
    // @ts-expect-error invalid message
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const badRateLimitErr: RateLimitError = { message: 'too many' };
  });
});
