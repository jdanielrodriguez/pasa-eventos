import { requestLogger } from '../../../middlewares/requestLogger.middleware';
import { logger } from '../../../config/logger.client';
import { config } from '../../../config/api';
import { Request, Response, NextFunction } from 'express';

// Mock del logger
jest.mock('../../../config/logger.client', () => ({
  logger: {
    info: jest.fn(),
  },
}));

describe('requestLogger middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  const FAKE_DURATION = 0.0;

  // Mockear process.hrtime
  let hrtimeSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock process.hrtime para devolver duración fija
    hrtimeSpy = jest.spyOn(process, 'hrtime').mockImplementation(() => [0, FAKE_DURATION * 1e6]);

    req = {
      method: 'GET',
      originalUrl: '/test-url',
      ip: '127.0.0.1',
      requestId: 'test-request-id',
    } as Partial<Request>;

    res = {
      statusCode: 200,
      on: ((event: string, handler: () => void) => {
        if (event === 'finish') {
          handler();
        }
        return res as Response;
      }) as Response['on'],
    };

    next = jest.fn();
  });

  afterEach(() => {
    hrtimeSpy.mockRestore();
    (config as { isProd: boolean }).isProd = false;
  });

  it('should log info with correct meta in development', () => {
    (config as { isProd: boolean }).isProd = false;

    requestLogger(req as Request, res as Response, next);

    expect(logger.info).toHaveBeenCalledWith(
      'GET /test-url 200 - 0.00ms',
      expect.objectContaining({
        method: 'GET',
        url: '/test-url',
        status: 200,
        ip: '127.0.0.1',
      }),
    );
    expect(logger.info).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ requestId: 'test-request-id' }),
    );
    expect(next).toHaveBeenCalled();
  });

  it('should log info with requestId in production', () => {
    (config as { isProd: boolean }).isProd = true;

    requestLogger(req as Request, res as Response, next);

    expect(logger.info).toHaveBeenCalledWith(
      'GET /test-url 200 - 0.00ms',
      expect.objectContaining({
        requestId: 'test-request-id',
        method: 'GET',
        url: '/test-url',
        status: 200,
        ip: '127.0.0.1',
      }),
    );
    expect(next).toHaveBeenCalled();
  });

  it('should handle missing requestId gracefully in prod', () => {
    (config as { isProd: boolean }).isProd = true;
    const reqWithoutId: Partial<Request> = {
      ...req,
      requestId: undefined,
    };

    requestLogger(reqWithoutId as Request, res as Response, next);

    expect(logger.info).toHaveBeenCalledWith(
      'GET /test-url 200 - 0.00ms',
      expect.objectContaining({
        method: 'GET',
        url: '/test-url',
        status: 200,
        ip: '127.0.0.1',
        requestId: undefined,
      }),
    );
  });

  it('should handle different status codes and durations', () => {
    (config as { isProd: boolean }).isProd = false;
    req.method = 'POST';
    req.originalUrl = '/other';
    res.statusCode = 404;

    requestLogger(req as Request, res as Response, next);

    expect(logger.info).toHaveBeenCalledWith(
      'POST /other 404 - 0.00ms',
      expect.objectContaining({
        status: 404,
        method: 'POST',
        url: '/other',
        ip: '127.0.0.1',
      }),
    );
  });
});
