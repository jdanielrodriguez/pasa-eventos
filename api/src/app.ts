import express from 'express';
import { json } from 'body-parser';
import { requestLogger } from './middlewares/requestLogger.middleware';
import { errorHandler } from './middlewares/errorHandler.middleware';
import routes from './routes/health.routes'; // o index.routes si tienes más rutas

const app = express();

app.use(json());
app.use(requestLogger);

app.use('/health', routes);

app.use(errorHandler);

export default app;
