import { Router, type Request, type Response } from 'express';
import { detectLanguage } from '../services/languageDetector.ts';
import { analyzeRisk } from '../services/riskEngine.ts';
import { classifySafety } from '../services/safetyClassifier.ts';
import { analyzeBias } from '../analytics/biasAnalyzer.ts';
import { logger } from '../services/logger.ts';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { prompt } = req.body as { prompt?: string };

  if (!prompt?.trim()) {
    res.status(400).json({ error: 'prompt is required.' });
    return;
  }

  try {
    const language = detectLanguage(prompt);
    const risk = analyzeRisk(prompt);
    const safety = classifySafety(risk);
    const bias = analyzeBias(prompt);

    logger.info(`Analyze — lang=${language} risk=${risk.score} level=${risk.level}`);

    res.json({
      language,
      ...safety,
      bias,
    });
  } catch (err) {
    logger.error('Analysis failed', err);
    res.status(500).json({ error: 'Analysis failed.' });
  }
});

export default router;
