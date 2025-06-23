/* eslint-disable @typescript-eslint/no-unused-vars */
import request from 'supertest';
import { config } from '../../config/api';
import { AppError } from '../../types/appError';
import express, { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../middlewares/errorHandler.middleware';
import { requestIdMiddleware } from '../../middlewares/requestId.middleware';

describe('errorHandler middleware integration', () => {
  const app = express();
  app.use(express.json());
  app.use(requestIdMiddleware);
  app.get('/app-error', (req: Request, res: Response, next: NextFunction) => {
    next(new AppError('App error!', 400, true));
  });

  app.get('/unhandled', (req: Request, res: Response, next: NextFunction) => {
    throw new Error('Unexpected error!');
  });

  app.get('/cors', (req: Request, res: Response, next: NextFunction) => {
    next({ message: 'Not allowed by CORS' });
  });

  app.get('/ratelimit', (req: Request, res: Response, next: NextFunction) => {
    next({ status: 429 });
  });

  app.post('/large', (req: Request, res: Response, next: NextFunction) => {
    const hugePayload = 'x'.repeat(10000);
    next(new AppError(hugePayload, 500));
  });

  app.get('/custom-stack', (req: Request, res: Response, next: NextFunction) => {
    const err = new Error('Custom Stack');
    err.stack = 'STACK_TRACE_TEST';
    next(err);
  });

  app.get('/complex', (req: Request, res: Response, next: NextFunction) => {
    next({ foo: 'bar', code: 422, info: { nested: true } });
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    const error = new AppError('Route not found', 404);
    error.name = 'NotFound';
    next(error);
  });

  app.use(errorHandler);

  describe('In development mode', () => {
    beforeAll(() => {
      config.isProd = false;
      config.isDev = true;
      config.isTest = false;
    });

    it('should handle AppError operational errors', async () => {
      const res = await request(app).get('/app-error');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Error');
      expect(res.body.message).toBe('App error!');
      expect(res.body.stack).toBeDefined();
      expect(typeof res.body.stack).toBe('string');
      expect(res.body.detail).toMatchObject({ message: 'App error!' });
    });

    it('should handle unhandled errors as 500', async () => {
      const res = await request(app).get('/unhandled');
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Error');
      expect(res.body.message).toBe('Unexpected server error');
      expect(res.body.stack).toBeDefined();
      expect(typeof res.body.stack).toBe('string');
      expect(res.body.detail).toMatchObject({ message: 'Unexpected error!' });
    });

    it('should truncate stack in test mode', async () => {
      config.isDev = false;
      config.isTest = true;
      const res = await request(app).get('/custom-stack');
      expect(res.body.stack.length).toBeLessThanOrEqual(303);
      if (res.body.stack.length === 303) {
        expect(res.body.stack.endsWith('...')).toBe(true);
      }
    });

    it('should handle CORS error', async () => {
      const res = await request(app).get('/cors');
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/CORS/i);
      expect(res.body.error).toBeDefined();
    });

    it('should handle rate limit error', async () => {
      const res = await request(app).get('/ratelimit');
      expect(res.status).toBe(429);
      expect(res.body.message).toMatch(/Too many requests/i);
      expect(res.body.error).toBeDefined();
    });

    it('should handle large error payload', async () => {
      const res = await request(app).post('/large');
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Error');
      expect(res.body.detail.message.length).toBeGreaterThan(300);
      expect(res.body.message).not.toContain('...');
    });

    it('should handle custom stack errors', async () => {
      const res = await request(app).get('/custom-stack');
      expect(res.status).toBe(500);
      expect(res.body.stack).toBe('STACK_TRACE_TEST');
    });

    it('should serialize complex error objects', async () => {
      const res = await request(app).get('/complex');
      expect(res.status).toBe(500);
      expect(res.body.detail).toMatchObject({ foo: 'bar', code: 422, info: { nested: true } });
    });

    it('should handle not found routes with 404', async () => {
      const res = await request(app).get('/does-not-exist');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('NotFound');
      expect(res.body.message).toBe('Route not found');
    });
  });

  describe('In production mode', () => {
    beforeAll(() => {
      config.isProd = true;
      config.isDev = false;
      config.isTest = false;
    });

    it('should truncate large error payload', async () => {
      const res = await request(app).post('/large');
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Error');
      expect(res.body.detail.length).toBeLessThanOrEqual(303);
      expect(res.body.detail.endsWith('...')).toBe(true);
    });

    it('should hide stack and show requestId in prod', async () => {
      const res = await request(app)
        .get('/app-error')
        .set('X-Request-Id', 'test-id-123');
      expect(res.status).toBe(400);
      expect(res.body).not.toHaveProperty('stack');
      expect(res.body).toHaveProperty('requestId', 'test-id-123');
    });

    it('should generate requestId if not provided in prod', async () => {
      const res = await request(app).get('/app-error');
      expect(res.status).toBe(400);
      expect(res.body).not.toHaveProperty('stack');
      expect(res.body).toHaveProperty('requestId');
      expect(typeof res.body.requestId).toBe('string');
      expect(res.body.requestId.length).toBeGreaterThan(0);
    });

    it('should hide internals for unhandled error', async () => {
      const res = await request(app).get('/unhandled');
      expect(res.status).toBe(500);
      expect(res.body).not.toHaveProperty('stack');
      expect(typeof res.body.detail).toBe('string');
    });
  });
});
