import request from 'supertest';
import app from '../../app'; // importa tu instancia de express

describe('Health Integration', () => {
  it('should return health status for all services', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('mysql');
    expect(response.body).toHaveProperty('redis');
    expect(response.body).toHaveProperty('mail');
    expect(response.body).toHaveProperty('minio');

    expect(response.body.mysql.ok).toBe(true);
    expect(response.body.redis.ok).toBe(true);
    expect(response.body.mail.ok).toBe(true);
    expect(response.body.minio.ok).toBe(true);
  });
});
