import { Router, type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { runBenchmark } from '../benchmark/evaluationEngine.ts';
import type { BenchmarkRun } from '../db/models/BenchmarkResult.ts';
import { logger } from '../services/logger.ts';

const router = Router();
const BENCH_FILE = path.join(process.cwd(), 'benchmarks.json');

function readBenchmarks(): Omit<BenchmarkRun, 'results'>[] {
  try {
    if (!fs.existsSync(BENCH_FILE)) return [];
    return JSON.parse(fs.readFileSync(BENCH_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveBenchmark(run: BenchmarkRun): void {
  const existing = readBenchmarks();
  // Strip results from stored summaries to keep the file small
  const { results: _r, ...summary } = run;
  const updated = [summary, ...existing].slice(0, 50); // keep last 50 runs
  fs.writeFileSync(BENCH_FILE, JSON.stringify(updated, null, 2), 'utf-8');
}

// POST /api/benchmark — run evaluation against a model
router.post('/', async (req: Request, res: Response) => {
  const { model, categories } = req.body as { model?: string; categories?: string[] };

  if (!model?.trim()) {
    res.status(400).json({ error: 'model is required.' });
    return;
  }

  try {
    const run = await runBenchmark(model, categories);
    saveBenchmark(run);
    logger.info(`Benchmark saved — id=${run.id} refusalRate=${run.refusalRate} passRate=${run.overallPassRate}`);
    res.json(run);
  } catch (err) {
    logger.error('Benchmark execution failed', err);
    res.status(500).json({ error: 'Benchmark execution failed.' });
  }
});

// GET /api/benchmark/results — list past benchmark run summaries
router.get('/results', (_req: Request, res: Response) => {
  try {
    res.json(readBenchmarks());
  } catch (err) {
    logger.error('Failed to read benchmark results', err);
    res.status(500).json({ error: 'Failed to read benchmark results.' });
  }
});

export default router;
