const createClientMock = jest.fn();
jest.mock('redis', () => ({
  createClient: createClientMock,
}));

let mockRedisConfig: {
  host: string;
  port: number;
  password?: string;
};
jest.mock('../../../config/api', () => ({
  config: {
    get redis() {
      return mockRedisConfig;
    },
  },
}));

describe('getRedisClient (unit)', () => {
  let mockOn: jest.Mock;
  let mockConnect: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    createClientMock.mockClear();
    mockOn = jest.fn();
    mockConnect = jest.fn().mockResolvedValue(undefined);
    createClientMock.mockImplementation(() => ({
      on: mockOn,
      connect: mockConnect,
    }));
    mockRedisConfig = { host: 'localhost', port: 6379 };
  });

  it('should create a client with password when config.redis.password is set', () => {
    mockRedisConfig.password = 'supersecret';
    const { getRedisClient } = require('../../../config/redis.client');
    getRedisClient();
    expect(createClientMock).toHaveBeenCalledWith(expect.objectContaining({
      socket: { host: 'localhost', port: 6379 },
      password: 'supersecret',
    }));
  });

  it('should create a client without password if config.redis.password is not set', () => {
    mockRedisConfig.password = undefined;
    const { getRedisClient } = require('../../../config/redis.client');
    getRedisClient();
    const calledWith = createClientMock.mock.calls[0][0];
    expect(calledWith.password).toBeUndefined();
    expect(calledWith.socket).toEqual({ host: 'localhost', port: 6379 });
  });

  it('should set up error handler and call console.error on redis client error', () => {
    const { getRedisClient } = require('../../../config/redis.client');
    const errorMock = jest.fn();
    const oldConsoleError = console.error;
    console.error = errorMock;
    getRedisClient();
    expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function));
    const handler = mockOn.mock.calls.find(c => c[0] === 'error')?.[1];
    expect(handler).toBeDefined();
    if (handler) handler('boom');
    expect(errorMock).toHaveBeenCalledWith('Redis Client Error:', 'boom');
    console.error = oldConsoleError;
  });
});
