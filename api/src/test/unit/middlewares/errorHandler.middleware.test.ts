import request from 'supertest';
import { config } from '../../../config/api';
import { AppError } from '../../../types/appError';
import express, { Request, Response, NextFunction } from 'express';
import { errorHandler, serializeError, truncate } from '../../../middlewares/errorHandler.middleware';

function errorRoute(err: unknown) {
  return (req: Request, res: Response, next: NextFunction) => {
    next(err);
  };
}

describe('errorHandler middleware integration and utils', () => {
  let app: express.Express;

  afterEach(() => {
    config.isProd = false;
    config.isDev = true;
    config.isTest = false;
  });

  describe('integration (dev)', () => {
    beforeEach(() => {
      app = express();
      app.get('/custom-error', errorRoute(new AppError('App error!', 400)));
      app.get('/unhandled', errorRoute(new Error('Unexpected error!')));
      app.get('/cors-error', errorRoute({ message: 'Not allowed by CORS' }));
      app.get('/rate-limit', errorRoute({ status: 429 }));
      app.use('*', (req, res, next) => {
        const notFound = new AppError('Route not found', 404, true);
        notFound.name = 'NotFound';
        next(notFound);
      });
      app.use(errorHandler);
    });

    it('should handle AppError with correct status and message', async () => {
      const res = await request(app).get('/custom-error');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Error');
      expect(res.body.message).toBe('App error!');
      expect(res.body).toHaveProperty('stack');
    });

    it('should handle unhandled errors as 500', async () => {
      const res = await request(app).get('/unhandled');
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Error');
      expect(res.body.message).toBe('Unexpected server error');
      expect(res.body).toHaveProperty('stack');
      expect(res.body).toHaveProperty('detail');
    });

    it('should handle CORS errors with 403', async () => {
      const res = await request(app).get('/cors-error');
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('InternalServerError');
      expect(res.body.message).toBe('Request not allowed by CORS policy.');
    });

    it('should handle rate limit errors with 429', async () => {
      const res = await request(app).get('/rate-limit');
      expect(res.status).toBe(429);
      expect(res.body.message).toBe('Too many requests. Please try again later.');
    });

    it('should handle not found routes with 404', async () => {
      const res = await request(app).get('/some-non-existent-route');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('NotFound');
      expect(res.body.message).toBe('Route not found');
    });
  });

  describe('integration (prod)', () => {
    beforeEach(() => {
      config.isProd = true;
      config.isDev = false;
      config.isTest = false;
    });
    afterEach(() => {
      config.isProd = false;
      config.isDev = true;
      config.isTest = false;
    });

    it('should set detail as empty string if err.message is missing in prod', async () => {
      const prodApp = express();
      prodApp.use((req, res, next) => {
        (req as Request & { requestId: string }).requestId = 'test-req-id';
        next();
      });
      prodApp.get('/no-message', (req, res, next) => next({}));
      prodApp.use(errorHandler);

      const res = await request(prodApp).get('/no-message');
      expect(res.body.detail).toBe('');
      expect(res.body.requestId).toBe('test-req-id');
    });

    it('should set detail as empty string if err.message is missing in prod', async () => {
      config.isProd = true;
      config.isDev = false;
      config.isTest = false;

      const prodApp = express();
      prodApp.use((req, res, next) => {
        (req as Request & { requestId: string }).requestId = 'test-req-id';
        next();
      });
      prodApp.get('/no-message', (req, res, next) => next({}));
      prodApp.use(errorHandler);

      const res = await request(prodApp).get('/no-message');
      expect(res.body.detail).toBe('');
      expect(res.body.requestId).toBe('test-req-id');
    });
  });

  describe('integration (test)', () => {
    beforeEach(() => {
      config.isProd = false;
      config.isDev = false;
      config.isTest = true;
    });
    afterEach(() => {
      config.isProd = false;
      config.isDev = true;
      config.isTest = false;
    });

    it('should set stack as undefined if err.stack is missing and in test mode', async () => {
      const testApp = express();
      testApp.get('/no-stack', (req, res, next) => next({ message: 'fail' }));
      testApp.use(errorHandler);

      const res = await request(testApp).get('/no-stack');
      expect(res.body.stack).toBe('');;
    });

    it('should set stack to empty string when err.stack is empty and in test mode', async () => {
      config.isProd = false;
      config.isDev = false;
      config.isTest = true;

      const testApp = express();
      const err = new Error('no stack');
      err.stack = '';
      testApp.get('/empty-stack', errorRoute(err));
      testApp.use(errorHandler);

      const res = await request(testApp).get('/empty-stack');
      expect(res.body.stack).toBe('');
    });

    it('should use empty string in stack truncate branch (err.stack falsy, isTest)', async () => {
      config.isProd = false;
      config.isDev = false;
      config.isTest = true;

      const testApp = express();
      testApp.get('/empty-stack', (req, res, next) => next({ message: 'fail', stack: '' }));
      testApp.use(errorHandler);

      const res = await request(testApp).get('/empty-stack');
      expect(res.body.stack).toBe('');
    });

    it('should cover branch: err is Error, err.stack exists, config.isTest true', () => {
      config.isProd = false;
      config.isDev = false;
      config.isTest = true;
      class TestError extends Error {
        constructor() {
          super('Stack branch');
          this.stack = 'x'.repeat(400);
        }
      }
      const err = new TestError();
      const req = {} as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const next = jest.fn() as NextFunction;
      errorHandler(err, req, res, next);
      const { stack } = (res.json as jest.Mock).mock.calls[0][0];
      expect(typeof stack).toBe('string');
      expect(stack.length).toBeLessThanOrEqual(303);
      expect(stack.endsWith('...')).toBe(true);
    });

    it('should cover branch: err is Error, err.stack exists, config.isTest false', () => {
      config.isProd = false;
      config.isDev = true;
      config.isTest = false;
      class TestError extends Error {
        constructor() {
          super('Stack normal');
          this.stack = 'normal-stack';
        }
      }
      const err = new TestError();
      const req = {} as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const next = jest.fn() as NextFunction;
      errorHandler(err, req, res, next);
      const { stack } = (res.json as jest.Mock).mock.calls[0][0];
      expect(stack).toBe('normal-stack');
    });

    it('should cover branch: err is Error, NO stack', () => {
      config.isProd = false;
      config.isDev = true;
      config.isTest = false;
      class TestError extends Error {
        constructor() {
          super('No stack');
          this.stack = '';
        }
      }
      const err = new TestError();
      const req = {} as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const next = jest.fn() as NextFunction;
      errorHandler(err, req, res, next);
      const { stack } = (res.json as jest.Mock).mock.calls[0][0];
      expect(stack).toBe('');
    });
  });

  describe('serializeError', () => {
    it('should serialize Error instance', () => {
      const err = new Error('fail');
      expect(serializeError(err)).toMatchObject({ name: 'Error', message: 'fail', stack: expect.any(String) });
    });

    it('should serialize object', () => {
      expect(serializeError({ foo: 'bar' })).toEqual({ foo: 'bar' });
    });

    it('should serialize string', () => {
      expect(serializeError('bad')).toEqual({ message: 'bad' });
    });

    it('should serialize null', () => {
      expect(serializeError(null)).toEqual({ message: 'null' });
    });
  });

  describe('truncate', () => {
    it('should truncate long string', () => {
      const s = 'a'.repeat(400);
      expect(truncate(s, 100)).toBe('a'.repeat(100) + '...');
    });

    it('should stringify object', () => {
      expect(truncate({ foo: 'bar' }, 100)).toContain('"foo":"bar"');
    });

    it('should handle null and undefined', () => {
      expect(truncate(null)).toBe('null');
      expect(truncate(undefined)).toBe('undefined');
    });
  });
});
