import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import chatRouter from './routes/chat.ts';
import interactionsRouter from './routes/interactions.ts';
import metricsRouter from './routes/metrics.ts';
import analyzeRouter from './routes/analyze.ts';
import benchmarkRouter from './routes/benchmark.ts';
import { resetInteractions } from './db/repository.ts';
import { logger } from './services/logger.ts';

async function startServer(): Promise<void> {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  }));
  app.use(express.json());

  // ─── Health check ──────────────────────────────────────────────────────────
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ─── API routes ────────────────────────────────────────────────────────────
  app.use('/api/chat', chatRouter);
  app.use('/api/interactions', interactionsRouter);
  app.use('/api/metrics', metricsRouter);
  app.use('/api/analyze', analyzeRouter);
  app.use('/api/benchmark', benchmarkRouter);

  // Legacy reset endpoint — kept for backward compatibility
  app.post('/api/reset', (req, res) => {
    try {
      resetInteractions();
      res.json({ success: true, message: 'Observatory state restored to initial demo corpus.' });
    } catch {
      res.status(500).json({ error: 'Failed to reset database.' });
    }
  });

  // ─── Frontend serving ──────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`AI Safety Observatory running at http://localhost:${PORT}`);
    logger.info(`Providers: Gemini=${!!process.env.GEMINI_API_KEY} | OpenAI=${!!process.env.OPENAI_API_KEY} | Anthropic=${!!process.env.ANTHROPIC_API_KEY}`);
  });
}

startServer().catch(err => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
