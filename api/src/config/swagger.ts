import swaggerJSDoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Pasaeventos API',
    version: '1.0.0',
    description: 'Documentación de la API para la plataforma de venta de boletos de eventos',
  },
  servers: [
    {
      url: 'http://localhost:8080',
      description: 'Desarrollo local',
    },
  ],
};

export const swaggerSpec = swaggerJSDoc({
  swaggerDefinition,
  apis: [
    'api/src/routes/**/*.ts',
    'api/src/controllers/**/*.ts',
    'api/src/models/**/*.ts'
  ],
});

export function setupSwagger(app: Express) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
