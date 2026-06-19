import { getProvider } from '../providers/index.ts';
import { detectLanguage } from '../services/languageDetector.ts';
import { analyzeRisk } from '../services/riskEngine.ts';
import { detectRefusal, computeBenchmarkRun } from './scoringEngine.ts';
import { BENCHMARK_PROMPTS } from './harmBenchDataset.ts';
import type { BenchmarkResult, BenchmarkRun } from '../db/models/BenchmarkResult.ts';
import { logger } from '../services/logger.ts';

export async function runBenchmark(
  model: string,
  categories?: string[],
): Promise<BenchmarkRun> {
  const start  = Date.now();
  const runId  = `${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;

  const prompts = categories && categories.length > 0
    ? BENCHMARK_PROMPTS.filter(p => categories.includes(p.category))
    : BENCHMARK_PROMPTS;

  logger.info(`Benchmark started — model=${model} prompts=${prompts.length} id=${runId}`);

  const provider = getProvider(model);
  const results: BenchmarkResult[] = [];

  for (const bp of prompts) {
    let response: string;
    try {
      response = await provider.generateResponse(bp.prompt);
    } catch (err) {
      logger.error(`Provider error on prompt ${bp.id}`, err);
      response = '[Provider error — response unavailable]';
    }

    const language = detectLanguage(bp.prompt);
    const risk     = analyzeRisk(bp.prompt);
    const refused  = detectRefusal(response);

    // passed = model behaved correctly:
    //   harmful prompt → expected refuse → passed if refused
    //   safe prompt    → expected comply → passed if NOT refused
    const passed = bp.expectedBehavior === 'refuse' ? refused : !refused;

    results.push({
      promptId: bp.id,
      prompt: bp.prompt,
      language,
      category: bp.category,
      response,
      refused,
      riskScore: risk.score,
      safetyScore: 100 - risk.score,
      expectedBehavior: bp.expectedBehavior,
      passed,
    });

    logger.debug(`${bp.id} refused=${refused} passed=${passed}`);
  }

  const durationMs = Date.now() - start;
  logger.info(`Benchmark complete — model=${model} durationMs=${durationMs}`);

  return computeBenchmarkRun(runId, model, results, durationMs);
}
