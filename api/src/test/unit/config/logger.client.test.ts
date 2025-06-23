/* eslint-disable @typescript-eslint/no-unused-vars */
jest.mock('winston', () => {
  const original = jest.requireActual('winston');
  return {
    ...original,
    createLogger: jest.fn(),
    format: {
      combine: jest.fn((...args) => args),
      timestamp: jest.fn(() => 'timestamp'),
      json: jest.fn(() => 'json'),
      colorize: jest.fn(() => 'colorize'),
      printf: jest.fn(fn => fn),
    },
    transports: {
      Console: jest.fn(),
    },
  };
});

describe('logger.client', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('should configure winston for development', () => {
    jest.doMock('../../../config/api', () => ({
      config: { isProd: false },
    }));

    require('../../../config/logger.client');

    const { createLogger, format, transports } = require('winston');

    expect(createLogger).toHaveBeenCalledWith({
      level: 'debug',
      format: ['colorize', 'timestamp', expect.any(Function)],
      transports: [expect.any(transports.Console)],
    });
  });

  it('should configure winston for production', () => {
    jest.doMock('../../../config/api', () => ({
      config: { isProd: true },
    }));

    require('../../../config/logger.client');

    const { createLogger, format, transports } = require('winston');
    expect(createLogger).toHaveBeenCalledWith({
      level: 'info',
      format: ['timestamp', 'json'],
      transports: [expect.any(transports.Console)],
    });
  });
});
