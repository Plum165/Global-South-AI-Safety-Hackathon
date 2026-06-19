import { Router, type Request, type Response } from 'express';
import { readInteractions, resetInteractions } from '../db/repository.ts';
import { logger } from '../services/logger.ts';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const list = readInteractions();
    res.json(list);
  } catch (err) {
    logger.error('Failed to read interactions', err);
    res.status(500).json({ error: 'Failed to read interactions.' });
  }
});

router.post('/reset', (req: Request, res: Response) => {
  try {
    resetInteractions();
    logger.info('Observatory state reset to initial demo corpus');
    res.json({ success: true, message: 'Observatory state restored to initial demo corpus.' });
  } catch (err) {
    logger.error('Failed to reset interactions', err);
    res.status(500).json({ error: 'Failed to reset database.' });
  }
});

export default router;
