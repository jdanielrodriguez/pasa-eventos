import cors from 'cors';
import helmet from 'helmet';
import { join } from 'path';
import express from 'express';
import { config } from './config/api';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { setupSwagger } from './config/swagger';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { requestIdMiddleware } from './middlewares/requestId.middleware';
import { requestLogger } from './middlewares/requestLogger.middleware';
import routes from './routes/health.routes';
import { AppError } from './types/appError';

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin: (origin: string | undefined, callback) => {
      if (!origin) {
        if (config.cors.origins.includes('*')) return callback(null, true);
        if (config.isDev || config.isTest) return callback(null, true);
      }
      if (config.cors.origins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);
app.use(compression());
app.use(rateLimit({ windowMs: 60 * 1000, max: 60 }));
app.use(express.json());
app.use(requestIdMiddleware);
app.use(requestLogger);

if (!config.isProd) {
  setupSwagger(app);
}

app.use('/api/v1/health', routes);
if (!config.isTest) {
  const ssrDist = join(__dirname, `../../${config.isDev ? '../../frontend/dist/' : ''}frontend`);
  const ssrServer = require(join(ssrDist, 'server', 'server.mjs'));
  const ssrHandler = ssrServer.reqHandler;
  const ssrStatic = express.static(join(ssrDist, 'browser'), {
    maxAge: '1y',
    index: false,
    redirect: false,
  });
  app.use(ssrStatic);
  app.use((req, res, next) => {
    if (res.headersSent) return next();
    if (req.url.startsWith('/api')) {
      return next();
    }
    return ssrHandler(req, res, next);
  });
}
app.use((req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404, true));
});
app.use(errorHandler);

export default app;
