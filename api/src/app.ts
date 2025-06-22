import express from 'express';
import { json } from 'body-parser';
import { requestLogger } from './middlewares/requestLogger.middleware';
import { errorHandler } from './middlewares/errorHandler.middleware';
import routes from './routes/health.routes';
import { setupSwagger } from './config/swagger';

const app = express();

app.use(json());
app.use(requestLogger);

setupSwagger(app);

app.use('/health', routes);

app.use(errorHandler);

export default app;
