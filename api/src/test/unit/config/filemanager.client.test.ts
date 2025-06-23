type MockConfig = {
  filemanager: {
    provider: 'minio' | 's3';
    minio: {
      endPoint: string;
      port: number;
      useSSL: boolean;
      accessKey: string;
      secretKey: string;
    };
    s3: {
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
      bucket: string;
    };
  };
  [key: string]: unknown;
};
const mockConfig: MockConfig = {
  filemanager: {
    provider: 'minio',
    minio: {
      endPoint: 'minio-endpoint',
      port: 9000,
      useSSL: false,
      accessKey: 'minio-access-key',
      secretKey: 'minio-secret-key',
    },
    s3: {
      region: 'us-east-1',
      accessKeyId: 'test-access',
      secretAccessKey: 'test-secret',
      bucket: 'test-bucket',
    },
  },
};

jest.mock('../../../config/api', () => ({
  config: mockConfig,
}));

const minioConstructor = jest.fn();
const s3Constructor = jest.fn();

jest.mock('minio', () => ({
  Client: function (opts: Record<string, unknown>) {
    minioConstructor(opts);
    return { __client: 'minio', opts };
  }
}));

jest.mock('@aws-sdk/client-s3', () => ({
  S3: function (opts: Record<string, unknown>) {
    s3Constructor(opts);
    return { __client: 's3', opts };
  }
}));

describe('getFileManagerClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    mockConfig.filemanager.provider = 'minio';
  });

  it('should create and return a Minio client when provider is minio', () => {
    mockConfig.filemanager.provider = 'minio';
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
    expect(s3Constructor).not.toHaveBeenCalled();
  });

  it('should create and return an S3 client when provider is s3', () => {
    mockConfig.filemanager.provider = 's3';
    jest.resetModules();
    const { getFileManagerClient } = require('../../../config/filemanager.client');
    const client = getFileManagerClient();
    expect(client).toHaveProperty('__client', 's3');
    expect(s3Constructor).toHaveBeenCalledWith({
      region: 'us-east-1',
      credentials: {
        accessKeyId: 'test-access',
        secretAccessKey: 'test-secret',
      },
    });
    expect(minioConstructor).not.toHaveBeenCalled();
  });
});
