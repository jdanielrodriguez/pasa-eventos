import * as health from '../../../services/health.service';

jest.mock('../../../config/mysql.client', () => ({
  getMysqlClient: jest.fn(),
}));
jest.mock('../../../config/redis.client', () => ({
  getRedisClient: jest.fn(),
}));
jest.mock('../../../config/mail.client', () => ({
  getMailClient: jest.fn(),
}));
jest.mock('../../../config/filemanager.client', () => ({
  getFileManagerClient: jest.fn(),
}));

import { getMysqlClient } from '../../../config/mysql.client';
import { getRedisClient } from '../../../config/redis.client';
import { getMailClient } from '../../../config/mail.client';
import { getFileManagerClient } from '../../../config/filemanager.client';

describe('healthService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('mysqlPing', () => {
    it('should return ok: true on success', async () => {
      (getMysqlClient as jest.Mock).mockResolvedValue({
        query: jest.fn().mockResolvedValue([{}]),
      });
      const result = await health.mysqlPing();
      expect(result).toEqual({ ok: true });
    });

    it('should return ok: false on failure', async () => {
      (getMysqlClient as jest.Mock).mockResolvedValue({
        query: jest.fn().mockRejectedValue(new Error('Mysql fail')),
      });
      const result = await health.mysqlPing();
      expect(result.ok).toBe(false);
      expect(result.detail).toContain('Mysql fail');
    });

    it('should handle non-Error exception objects', async () => {
      (getMysqlClient as jest.Mock).mockResolvedValue({
        query: jest.fn().mockRejectedValue('Not an error instance'),
      });
      const result = await health.mysqlPing();
      expect(result.ok).toBe(false);
      expect(result.detail).toContain('Not an error instance');
    });
  });

  describe('redisPing', () => {
    it('should return ok: true on success', async () => {
      (getRedisClient as jest.Mock).mockReturnValue({
        ping: jest.fn().mockResolvedValue('PONG'),
      });
      const result = await health.redisPing();
      expect(result).toEqual({ ok: true });
    });

    it('should return ok: false on failure', async () => {
      (getRedisClient as jest.Mock).mockReturnValue({
        ping: jest.fn().mockRejectedValue(new Error('Redis fail')),
      });
      const result = await health.redisPing();
      expect(result.ok).toBe(false);
      expect(result.detail).toContain('Redis fail');
    });

    it('should handle non-Error exception objects', async () => {
      (getRedisClient as jest.Mock).mockReturnValue({
        ping: jest.fn().mockRejectedValue({ some: 'random object' }),
      });
      const result = await health.redisPing();
      expect(result.ok).toBe(false);
      expect(result.detail).toContain('[object Object]');
    });
  });

  describe('minioPing', () => {
    it('should return ok: true on success', async () => {
      (getFileManagerClient as jest.Mock).mockReturnValue({
        listBuckets: jest.fn().mockResolvedValue([]),
      });
      const result = await health.minioPing();
      expect(result).toEqual({ ok: true });
    });

    it('should return ok: false on failure', async () => {
      (getFileManagerClient as jest.Mock).mockReturnValue({
        listBuckets: jest.fn().mockRejectedValue(new Error('Minio fail')),
      });
      const result = await health.minioPing();
      expect(result.ok).toBe(false);
      expect(result.detail).toContain('Minio fail');
    });

    it('should handle non-Error exception objects', async () => {
      (getFileManagerClient as jest.Mock).mockReturnValue({
        listBuckets: jest.fn().mockRejectedValue(12345),
      });
      const result = await health.minioPing();
      expect(result.ok).toBe(false);
      expect(result.detail).toContain('12345');
    });
  });

  describe('mailPing', () => {
    it('should return ok: true on success', async () => {
      (getMailClient as jest.Mock).mockReturnValue({
        verify: jest.fn().mockResolvedValue(true),
      });
      const result = await health.mailPing();
      expect(result).toEqual({ ok: true });
    });

    it('should return ok: false on failure', async () => {
      (getMailClient as jest.Mock).mockReturnValue({
        verify: jest.fn().mockRejectedValue(new Error('Mail fail')),
      });
      const result = await health.mailPing();
      expect(result.ok).toBe(false);
      expect(result.detail).toContain('Mail fail');
    });

    it('should handle non-Error exception objects', async () => {
      (getMailClient as jest.Mock).mockReturnValue({
        verify: jest.fn().mockRejectedValue(false),
      });
      const result = await health.mailPing();
      expect(result.ok).toBe(false);
      expect(result.detail).toBe('false');
    });
  });

  describe('healthService', () => {
    it('should aggregate all services status', async () => {
      (getMysqlClient as jest.Mock).mockResolvedValue({
        query: jest.fn().mockResolvedValue([{}]),
      });
      (getRedisClient as jest.Mock).mockReturnValue({
        ping: jest.fn().mockResolvedValue('PONG'),
      });
      (getFileManagerClient as jest.Mock).mockReturnValue({
        listBuckets: jest.fn().mockResolvedValue([]),
      });
      (getMailClient as jest.Mock).mockReturnValue({
        verify: jest.fn().mockResolvedValue(true),
      });

      const result = await health.healthService();
      expect(result.mysql.ok).toBe(true);
      expect(result.redis.ok).toBe(true);
      expect(result.minio.ok).toBe(true);
      expect(result.mail.ok).toBe(true);
    });

    it('should aggregate error details for failing services', async () => {
      (getMysqlClient as jest.Mock).mockResolvedValue({
        query: jest.fn().mockRejectedValue(new Error('Mysql fail')),
      });
      (getRedisClient as jest.Mock).mockReturnValue({
        ping: jest.fn().mockRejectedValue(new Error('Redis fail')),
      });
      (getFileManagerClient as jest.Mock).mockReturnValue({
        listBuckets: jest.fn().mockRejectedValue(new Error('Minio fail')),
      });
      (getMailClient as jest.Mock).mockReturnValue({
        verify: jest.fn().mockRejectedValue(new Error('Mail fail')),
      });

      const result = await health.healthService();
      expect(result.mysql.ok).toBe(false);
      expect(result.redis.ok).toBe(false);
      expect(result.minio.ok).toBe(false);
      expect(result.mail.ok).toBe(false);

      expect(result.mysql.detail).toContain('Mysql fail');
      expect(result.redis.detail).toContain('Redis fail');
      expect(result.minio.detail).toContain('Minio fail');
      expect(result.mail.detail).toContain('Mail fail');
    });
  });
});
