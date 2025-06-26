import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';

jest.mock('../../../services/health.service', () => ({
  healthService: jest.fn(),
}));

import { healthService } from '../../../services/health.service';
import { healthController } from '../../../controllers/health.controller';

describe('healthController integration', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.get('/api/v1/health', healthController);
  });

  it('should return status 200 with correct health data', async () => {
    (healthService as jest.Mock).mockResolvedValue({
      mysql: { ok: true },
      redis: { ok: true },
      filemanager: { ok: true },
      mail: { ok: true },
    });

    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      mysql: { ok: true },
      redis: { ok: true },
      filemanager: { ok: true },
      mail: { ok: true },
    });
    expect(healthService).toHaveBeenCalled();
  });

  it('should handle failing dependencies', async () => {
    (healthService as jest.Mock).mockResolvedValue({
      mysql: { ok: false, detail: 'MySQL down' },
      redis: { ok: true },
      filemanager: { ok: false, detail: 'FileManager error' },
      mail: { ok: true },
    });

    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      mysql: { ok: false, detail: 'MySQL down' },
      redis: { ok: true },
      filemanager: { ok: false, detail: 'FileManager error' },
      mail: { ok: true },
    });
    expect(healthService).toHaveBeenCalled();
  });

  it('should handle thrown errors with 500 and error message', async () => {
    (healthService as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

    const errorApp = express();
    errorApp.get('/api/v1/health', healthController);
    errorApp.use((
      err: Error,
      req: Request,
      res: Response,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _next: NextFunction
    ) => {
      res.status(500).json({ error: err.message });
    });

    const res = await request(errorApp).get('/api/v1/health');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: 'Health check failed',
      detail: 'Unexpected error',
    });
  });

  it('should handle non-Error thrown values with 500', async () => {
    (healthService as jest.Mock).mockRejectedValue('fail-value');

    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: 'Health check failed',
      detail: 'fail-value',
    });
  });
});
