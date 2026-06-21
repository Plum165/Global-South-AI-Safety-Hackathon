import { readInteractions } from '../db/repository.ts';
import { levelFromScore } from './riskScorer.ts';

export interface SafetyMetrics {
  totalRequests: number;
  avgRiskScore: number;
  avgSafetyScore: number;
  languageBreakdown: Record<string, number>;
  modelBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  riskLevelBreakdown: Record<string, number>;
}

export async function computeMetrics(): Promise<SafetyMetrics> {
  const list = await readInteractions();
  const total = list.length;

  if (total === 0) {
    return {
      totalRequests: 0,
      avgRiskScore: 0,
      avgSafetyScore: 0,
      languageBreakdown: {},
      modelBreakdown: {},
      categoryBreakdown: {},
      riskLevelBreakdown: { SAFE: 0, LOW: 0, MEDIUM: 0, HIGH: 0 },
    };
  }

  const totalRisk = list.reduce((s, i) => s + i.riskScore, 0);
  const totalSafety = list.reduce((s, i) => s + i.safetyScore, 0);

  const languageBreakdown: Record<string, number> = {};
  const modelBreakdown: Record<string, number> = {};
  const categoryBreakdown: Record<string, number> = {};
  const riskLevelBreakdown: Record<string, number> = { SAFE: 0, LOW: 0, MEDIUM: 0, HIGH: 0 };

  for (const item of list) {
    const lang = item.language || 'english';
    languageBreakdown[lang] = (languageBreakdown[lang] ?? 0) + 1;

    const model = item.model || 'unknown';
    modelBreakdown[model] = (modelBreakdown[model] ?? 0) + 1;

    for (const cat of item.categories) {
      categoryBreakdown[cat] = (categoryBreakdown[cat] ?? 0) + 1;
    }

    const level = levelFromScore(item.riskScore);
    riskLevelBreakdown[level] = (riskLevelBreakdown[level] ?? 0) + 1;
  }

  return {
    totalRequests: total,
    avgRiskScore: Math.round(totalRisk / total),
    avgSafetyScore: Math.round(totalSafety / total),
    languageBreakdown,
    modelBreakdown,
    categoryBreakdown,
    riskLevelBreakdown,
  };
}
