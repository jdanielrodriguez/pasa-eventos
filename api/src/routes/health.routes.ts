import { Router } from 'express';
import { healthController } from '../controllers/health.controller';

const router = Router();
router.get('/', healthController);
/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check de las dependencias del sistema
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Estado de las dependencias externas (MySQL, Redis, Mail, MinIO)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mysql:
 *                   type: object
 *                   properties:
 *                     ok:
 *                       type: boolean
 *                     detail:
 *                       type: string
 *                       nullable: true
 *                 redis:
 *                   type: object
 *                   properties:
 *                     ok:
 *                       type: boolean
 *                     detail:
 *                       type: string
 *                       nullable: true
 *                 minio:
 *                   type: object
 *                   properties:
 *                     ok:
 *                       type: boolean
 *                     detail:
 *                       type: string
 *                       nullable: true
 *                 mail:
 *                   type: object
 *                   properties:
 *                     ok:
 *                       type: boolean
 *                     detail:
 *                       type: string
 *                       nullable: true
 */

export default router;
