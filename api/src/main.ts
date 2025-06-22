import app from './app';
import { config } from './config/api';
import { logger } from './config/logger.client';

const host = '0.0.0.0';
const port = config.port;

app.listen(port, host, () => {
  logger.info(`[ ready ] http://${host}:${port}`);
});
