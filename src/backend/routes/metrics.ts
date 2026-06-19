import { Router, type Request, type Response } from 'express';
import { computeMetrics } from '../analytics/metricsEngine.ts';
import { logger } from '../services/logger.ts';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const metrics = computeMetrics();
    res.json(metrics);
  } catch (err) {
    logger.error('Failed to compute metrics', err);
    res.status(500).json({ error: 'Failed to compute metrics.' });
  }
});

export default router;
