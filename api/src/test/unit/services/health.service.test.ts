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
  isMinio: jest.fn().mockReturnValue(true),
  isS3: jest.fn().mockReturnValue(false),
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

  describe('fileManagerPing', () => {
    it('should return ok: true on success', async () => {
      (getFileManagerClient as jest.Mock).mockReturnValue({
        listBuckets: jest.fn().mockResolvedValue([]),
      });
      const result = await health.fileManagerPing();
      expect(result).toEqual({ ok: true });
    });

    it('should return ok: false on failure', async () => {
      (getFileManagerClient as jest.Mock).mockReturnValue({
        listBuckets: jest.fn().mockRejectedValue(new Error('Minio fail')),
      });
      const result = await health.fileManagerPing();
      expect(result.ok).toBe(false);
      expect(result.detail).toContain('Minio fail');
    });

    it('should handle non-Error exception objects', async () => {
      (getFileManagerClient as jest.Mock).mockReturnValue({
        listBuckets: jest.fn().mockRejectedValue(12345),
      });
      const result = await health.fileManagerPing();
      expect(result.ok).toBe(false);
      expect(result.detail).toContain('12345');
    });

    it('should handle non-Error exception objects when isS3', async () => {
      const filemanager = require('../../../config/filemanager.client');
      filemanager.isMinio = jest.fn().mockReturnValue(false);
      filemanager.isS3 = jest.fn().mockReturnValue(true);

      (getFileManagerClient as jest.Mock).mockReturnValue({
        getBuckets: jest.fn().mockRejectedValue(12345),
      });
      const result = await health.fileManagerPing();
      expect(result.ok).toBe(false);
      expect(result.detail).toBe('12345');
    });
  });

  describe('fileManagerPing S3', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      const filemanager = require('../../../config/filemanager.client');
      filemanager.isMinio = jest.fn().mockReturnValue(false);
      filemanager.isS3 = jest.fn().mockReturnValue(true);
    });

    it('should return ok: true when isS3 and getBuckets resolves', async () => {
      (getFileManagerClient as jest.Mock).mockReturnValue({
        getBuckets: jest.fn().mockResolvedValue(['bucket1']),
      });
      const result = await health.fileManagerPing();
      expect(result).toEqual({ ok: true });
    });

    it('should return ok: false when isS3 and getBuckets rejects', async () => {
      (getFileManagerClient as jest.Mock).mockReturnValue({
        getBuckets: jest.fn().mockRejectedValue(new Error('S3 fail')),
      });
      const result = await health.fileManagerPing();
      expect(result.ok).toBe(false);
      expect(result.detail).toContain('S3 fail');
    });

    it('should return ok: false when neither isMinio nor isS3', async () => {
      const filemanager = require('../../../config/filemanager.client');
      filemanager.isMinio = jest.fn().mockReturnValue(false);
      filemanager.isS3 = jest.fn().mockReturnValue(false);

      (getFileManagerClient as jest.Mock).mockReturnValue({});
      const result = await health.fileManagerPing();
      expect(result).toEqual({ ok: false, detail: 'No valid filemanager provider configured' });
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
    beforeEach(() => {
      const filemanager = require('../../../config/filemanager.client');
      filemanager.isMinio = jest.fn().mockReturnValue(true);
      filemanager.isS3 = jest.fn().mockReturnValue(false);
    });
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
      expect(result.filemanager.ok).toBe(true);
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
        listBuckets: jest.fn().mockRejectedValue(new Error('FileManager fail')),
      });
      (getMailClient as jest.Mock).mockReturnValue({
        verify: jest.fn().mockRejectedValue(new Error('Mail fail')),
      });

      const result = await health.healthService();
      expect(result.mysql.ok).toBe(false);
      expect(result.redis.ok).toBe(false);
      expect(result.filemanager.ok).toBe(false);
      expect(result.mail.ok).toBe(false);

      expect(result.mysql.detail).toContain('Mysql fail');
      expect(result.redis.detail).toContain('Redis fail');
      expect(result.filemanager.detail).toContain('FileManager fail');
      expect(result.mail.detail).toContain('Mail fail');
    });
  });
});
