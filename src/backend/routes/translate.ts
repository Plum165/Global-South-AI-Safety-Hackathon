import { Router, type Request, type Response } from 'express';
import { getProvider } from '../providers/index.ts';
import { logger } from '../services/logger.ts';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { text, model, customApiKey, customModelName } = req.body as {
    text?: string;
    model?: string;
    customApiKey?: string;
    customModelName?: string;
  };

  if (!text?.trim()) {
    res.status(400).json({ error: 'text is required.' });
    return;
  }

  const prompt = `Translate the following text to English. Return only the translation — no preamble, no explanations:\n\n${text}`;

  try {
    const provider = getProvider(model || 'gemini', customApiKey, customModelName);
    const translation = await provider.generateResponse(prompt);
    res.json({ translation: translation.trim() });
  } catch (err) {
    logger.error('Translation failed', err);
    res.status(500).json({ error: 'Translation unavailable.' });
  }
});

export default router;
