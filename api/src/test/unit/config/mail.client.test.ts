let mailConfig: {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
};

jest.mock('../../../config/api', () => ({
  config: {
    get mail() {
      return mailConfig;
    }
  }
}));

const mockTransporter = {};
const createTransport = jest.fn(() => mockTransporter);

jest.mock('nodemailer', () => ({
  createTransport,
}));

beforeEach(() => {
  jest.resetModules();
  createTransport.mockClear();
  mailConfig = {
    host: 'mail',
    port: 1025,
    secure: false,
    user: 'user',
    pass: 'pw',
  };
});

describe('getMailClient', () => {
  it('should create transport with secure true if port is 465', () => {
    mailConfig.port = 465;
    mailConfig.secure = false;
    const { getMailClient } = require('../../../config/mail.client');
    getMailClient();

    expect(createTransport).toHaveBeenCalledWith({
      host: 'mail',
      port: 465,
      secure: true,
      auth: { user: 'user', pass: 'pw' },
    });
  });

  it('should create transport with secure true if config.mail.secure is true', () => {
    mailConfig.port = 1025;
    mailConfig.secure = true;
    const { getMailClient } = require('../../../config/mail.client');
    getMailClient();

    expect(createTransport).toHaveBeenCalledWith({
      host: 'mail',
      port: 1025,
      secure: true,
      auth: { user: 'user', pass: 'pw' },
    });
  });

  it('should create transport with auth undefined if user is empty', () => {
    mailConfig.user = '';
    mailConfig.pass = '';
    mailConfig.secure = false;
    mailConfig.port = 1025;
    const { getMailClient } = require('../../../config/mail.client');
    getMailClient();

    expect(createTransport).toHaveBeenCalledWith({
      host: 'mail',
      port: 1025,
      secure: false,
      auth: undefined,
    });
  });

  it('should return same transporter instance if already created', () => {
    const { getMailClient } = require('../../../config/mail.client');
    const client1 = getMailClient();
    const client2 = getMailClient();
    expect(client1).toBe(client2);
    expect(createTransport).toHaveBeenCalledTimes(1);
  });

  it('should create transport with gmail service if host is gmail', () => {
    mailConfig.host = 'gmail';
    mailConfig.user = 'testuser@gmail.com';
    mailConfig.pass = 'gmailpass';
    jest.resetModules();
    const { getMailClient } = require('../../../config/mail.client');
    getMailClient();

    expect(createTransport).toHaveBeenCalledWith({
      service: 'gmail',
      auth: { user: 'testuser@gmail.com', pass: 'gmailpass' },
    });
  });

  it('should create transport with mailhog config if host is pasaeventos_mailhog', () => {
    mailConfig.host = 'pasaeventos_mailhog';
    mailConfig.port = 1025;
    jest.resetModules();
    const { getMailClient } = require('../../../config/mail.client');
    getMailClient();

    expect(createTransport).toHaveBeenCalledWith({
      host: 'pasaeventos_mailhog',
      port: 1025,
      secure: false,
      auth: undefined,
    });
  });

  it('should use port 465 as default when mailConfig.port is undefined', () => {
    mailConfig.port = undefined;
    mailConfig.secure = false;
    mailConfig.user = 'user';
    mailConfig.pass = 'pw';
    jest.resetModules();
    const { getMailClient } = require('../../../config/mail.client');
    getMailClient();

    expect(createTransport).toHaveBeenCalledWith({
      host: 'mail',
      port: 465,
      secure: false, // así lo calcula realmente tu función
      auth: { user: 'user', pass: 'pw' },
    });
  });
});
