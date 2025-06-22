import app from './app';
import { config } from './config/api';
import { logger } from './config/logger.client';

const host = '0.0.0.0';
const port = config.port;

app.listen(port, host, () => {
  logger.info(`[ ready ] http://${host}:${port}`);
});

process.on('uncaughtException', (err: unknown) => {
  logger.error('Uncaught Exception', typeof err === 'object' ? err : { error: err });
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Rejection', typeof reason === 'object' ? reason : { error: reason });
});
