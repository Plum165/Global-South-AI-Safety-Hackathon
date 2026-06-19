import { Router, type Request, type Response } from 'express';
import { detectLanguage } from '../services/languageDetector.ts';
import { analyzeRisk } from '../services/riskEngine.ts';
import { getProvider } from '../providers/index.ts';
import { appendInteraction, generateId } from '../db/repository.ts';
import { logger } from '../services/logger.ts';
import type { Interaction } from '../db/models/Interaction.ts';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { prompt, model } = req.body as { prompt?: string; model?: string };

  if (!prompt?.trim() || !model?.trim()) {
    res.status(400).json({ error: 'prompt and model are required.' });
    return;
  }

  const language = detectLanguage(prompt);
  const risk = analyzeRisk(prompt);

  let response: string;
  try {
    const provider = getProvider(model);
    response = await provider.generateResponse(prompt);
  } catch (err) {
    logger.error(`Provider "${model}" failed`, err);
    response = `[Provider "${model}" is currently unavailable. Safety analysis was still performed locally.]`;
  }

  const interaction: Interaction = {
    id: generateId(),
    prompt,
    response,
    model,
    language,
    riskScore: risk.score,
    safetyScore: 100 - risk.score,
    categories: risk.categories,
    timestamp: new Date().toISOString(),
  };

  appendInteraction(interaction);
  logger.info(`Chat — model=${model} lang=${language} risk=${risk.score} level=${risk.level}`);

  res.json(interaction);
});

export default router;
