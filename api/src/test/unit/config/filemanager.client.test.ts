import path from 'path';
import os from 'os';

interface MinioConfig {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
}

interface GcpConfig {
  serviceAccount: string;
  projectId: string;
  bucket: string;
}

type ProviderType = 'minio' | 's3' | 'none';

interface FilemanagerConfig {
  provider: ProviderType;
  minio: MinioConfig;
  gcp: GcpConfig;
}

interface MockConfig {
  filemanager: FilemanagerConfig;
  [key: string]: unknown;
}

type MinioClientOpts = MinioConfig;
type GcsClientOpts = { keyFilename: string; projectId: string };

let mockConfig: MockConfig;

const minioConstructor = jest.fn();
const gcsConstructor = jest.fn();
const writeFileSyncMock = jest.fn();
const existsSyncMock = jest.fn();

jest.mock('fs', () => ({
  writeFileSync: writeFileSyncMock,
  existsSync: existsSyncMock,
}));

jest.mock('minio', () => ({
  Client: function (opts: MinioClientOpts) {
    minioConstructor(opts);
    return { __client: 'minio', opts };
  }
}));

jest.mock('@google-cloud/storage', () => {
  class Storage {
    public __client: string;
    public opts: GcsClientOpts;
    constructor(opts: GcsClientOpts) {
      gcsConstructor(opts);
      this.__client = 'gcs';
      this.opts = opts;
    }
  }
  return { Storage };
});

function injectConfig(configOverride: MockConfig) {
  mockConfig = configOverride;
  jest.doMock('../../../config/api', () => ({
    config: mockConfig,
  }));
}

describe('getFileManagerClient', () => {
  beforeEach(() => {
    jest.resetModules();
    minioConstructor.mockClear();
    gcsConstructor.mockClear();
    writeFileSyncMock.mockClear();
    existsSyncMock.mockClear();
  });

  it('should create and return a GCS client when provider is s3 and write service account to disk', () => {
    jest.doMock('../../../config/api', () => ({
      config: {
        filemanager: {
          provider: 's3',
          minio: {
            endPoint: 'minio-endpoint',
            port: 9000,
            useSSL: false,
            accessKey: 'minio-access-key',
            secretKey: 'minio-secret-key',
          },
          gcp: {
            serviceAccount: '{"type":"service_account","key":"abc"}',
            projectId: 'test-project',
            bucket: 'test-bucket',
          },
        }
      }
    }));

    (existsSyncMock as jest.Mock).mockReturnValue(false);

    const { getFileManagerClient } = require('../../../config/filemanager.client');
    const fakePath = path.join(os.tmpdir(), 'gcp-service-account.json');
    const client = getFileManagerClient();

    expect(client).toHaveProperty('__client', 'gcs');
    expect(gcsConstructor).toHaveBeenCalledWith({
      keyFilename: fakePath,
      projectId: 'test-project',
    });

    const writeCall = writeFileSyncMock.mock.calls[0];
    expect(writeCall[0]).toBe(fakePath);
    expect(JSON.parse(writeCall[1])).toEqual({ type: "service_account", key: "abc" });
    expect(writeCall[2]).toEqual({ encoding: 'utf8' });

    expect(minioConstructor).not.toHaveBeenCalled();
  });

  it('should create and return a Minio client when provider is minio', () => {
    injectConfig({
      filemanager: {
        provider: 'minio',
        minio: {
          endPoint: 'minio-endpoint',
          port: 9000,
          useSSL: false,
          accessKey: 'minio-access-key',
          secretKey: 'minio-secret-key',
        },
        gcp: {
          serviceAccount: '{"type":"service_account"}',
          projectId: 'test-project',
          bucket: 'test-bucket',
        },
      }
    });

    const { getFileManagerClient } = require('../../../config/filemanager.client');
    const client = getFileManagerClient();
    expect(client).toHaveProperty('__client', 'minio');
    expect(minioConstructor).toHaveBeenCalledWith({
      endPoint: 'minio-endpoint',
      port: 9000,
      useSSL: false,
      accessKey: 'minio-access-key',
      secretKey: 'minio-secret-key',
    });
    expect(gcsConstructor).not.toHaveBeenCalled();
  });

  it('should not write service account file if already exists', () => {
    injectConfig({
      filemanager: {
        provider: 's3',
        minio: {
          endPoint: 'minio-endpoint',
          port: 9000,
          useSSL: false,
          accessKey: 'minio-access-key',
          secretKey: 'minio-secret-key',
        },
        gcp: {
          serviceAccount: '{"type":"service_account"}',
          projectId: 'test-project',
          bucket: 'test-bucket',
        },
      }
    });
    (existsSyncMock as jest.Mock).mockReturnValue(true);
    const { getFileManagerClient } = require('../../../config/filemanager.client');
    getFileManagerClient();
    expect(minioConstructor).not.toHaveBeenCalled();
  });

  it('should throw error if no provider is configured', () => {
    injectConfig({
      filemanager: {
        provider: 'none',
        minio: {
          endPoint: 'minio-endpoint',
          port: 9000,
          useSSL: false,
          accessKey: 'minio-access-key',
          secretKey: 'minio-secret-key',
        },
        gcp: {
          serviceAccount: '{"type":"service_account"}',
          projectId: 'test-project',
          bucket: 'test-bucket',
        },
      }
    });
    const { getFileManagerClient } = require('../../../config/filemanager.client');
    expect(() => getFileManagerClient()).toThrow(/No file manager provider configured/);
  });
});

describe('ensureServiceAccountFile', () => {
  const fakePath = path.join(os.tmpdir(), 'gcp-service-account.json');
  let originalConsoleLog: typeof console.log;

  beforeEach(() => {
    jest.resetModules();
    writeFileSyncMock.mockClear();
    existsSyncMock.mockClear();
    originalConsoleLog = console.log;
    console.log = jest.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
  });

  it('should replace \\n in private_key if present', () => {
    injectConfig({
      filemanager: {
        provider: 's3',
        minio: { endPoint: '', port: 0, useSSL: false, accessKey: '', secretKey: '' },
        gcp: {
          serviceAccount: JSON.stringify({ private_key: 'line1\\nline2', other: 'val' }),
          projectId: 'pid',
          bucket: 'bucket',
        },
      },
    });
    existsSyncMock.mockReturnValue(false);
    jest.doMock('fs', () => ({
      existsSync: existsSyncMock,
      writeFileSync: writeFileSyncMock,
      readFileSync: jest.fn(),
    }));

    const { getFileManagerClient } = require('../../../config/filemanager.client');
    getFileManagerClient();

    const contentWritten = writeFileSyncMock.mock.calls[0][1];
    expect(JSON.parse(contentWritten).private_key).toBe('line1\nline2');
  });

  it('should write service account file as string if JSON.parse fails and file does not exist', () => {
    injectConfig({
      filemanager: {
        provider: 's3',
        minio: { endPoint: '', port: 0, useSSL: false, accessKey: '', secretKey: '' },
        gcp: {
          serviceAccount: '{INVALID_JSON\\nfoo}',
          projectId: 'pid',
          bucket: 'bucket',
        },
      },
    });
    existsSyncMock.mockReturnValue(false);
    jest.doMock('fs', () => ({
      existsSync: existsSyncMock,
      writeFileSync: writeFileSyncMock,
      readFileSync: jest.fn(),
    }));

    const { getFileManagerClient } = require('../../../config/filemanager.client');
    getFileManagerClient();

    expect(writeFileSyncMock).toHaveBeenCalledWith(
      fakePath,
      '{INVALID_JSON\nfoo}',
      { encoding: 'utf8' }
    );
    expect(console.log).toHaveBeenCalled();
  });

  it('should only call console.log if JSON.parse fails and file already exists', () => {
    injectConfig({
      filemanager: {
        provider: 's3',
        minio: { endPoint: '', port: 0, useSSL: false, accessKey: '', secretKey: '' },
        gcp: {
          serviceAccount: '{BAD_JSON\\nbar}',
          projectId: 'pid',
          bucket: 'bucket',
        },
      },
    });
    existsSyncMock.mockReturnValue(true);
    jest.doMock('fs', () => ({
      existsSync: existsSyncMock,
      writeFileSync: writeFileSyncMock,
      readFileSync: jest.fn(),
    }));

    const { getFileManagerClient } = require('../../../config/filemanager.client');
    getFileManagerClient();

    expect(writeFileSyncMock).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalled();
  });

  it('should return true for Storage instances and false otherwise', () => {
    const { isS3 } = require('../../../config/filemanager.client');
    const { Storage } = require('@google-cloud/storage');
    const storageClient = new Storage({ keyFilename: 'a', projectId: 'b' });
    expect(isS3(storageClient)).toBe(true);
    expect(isS3({})).toBe(false);
    expect(isS3(null)).toBe(false);
    expect(isS3(undefined)).toBe(false);
    expect(isS3('not-storage')).toBe(false);
  });
});

