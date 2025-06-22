import { Request, Response } from 'express';
import { healthService } from '../services/health.service';

export async function healthController(req: Request, res: Response) {
  try {
    const status = await healthService();
    res.json(status);
  } catch (error: unknown) {
    res.status(500).json({ error: 'Health check failed', detail: error instanceof Error ? error.message : String(error) });
  }
}
