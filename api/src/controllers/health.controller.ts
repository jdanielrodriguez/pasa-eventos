import { Request, Response } from 'express';
import { healthService } from '../services/health.service';

export async function healthController(req: Request, res: Response) {
  try {
    const status = await healthService();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: 'Health check failed', detail: error.message });
  }
}
