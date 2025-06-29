import request from 'supertest';
import app from '../../app'; // importa tu instancia de express

describe('Health Integration', () => {
  it('should return health status for all services', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('mysql');
    expect(response.body).toHaveProperty('redis');
    expect(response.body).toHaveProperty('mail');
    expect(response.body).toHaveProperty('filemanager');

    expect(response.body.mysql.ok).toBe(true);
    expect(response.body.redis.ok).toBe(true);
    expect(response.body.mail.ok).toBe(true);
    expect(response.body.filemanager.ok).toBe(true);
  });
});
