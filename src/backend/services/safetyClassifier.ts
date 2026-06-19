import type { RiskAnalysis } from './riskEngine.ts';

export interface SafetyClassification {
  isSafe: boolean;
  level: string;
  primaryCategory: string;
  allCategories: string[];
  riskScore: number;
  safetyScore: number;
}

export function classifySafety(risk: RiskAnalysis): SafetyClassification {
  return {
    isSafe: risk.level === 'SAFE' || risk.level === 'LOW',
    level: risk.level,
    primaryCategory: risk.categories[0] ?? 'safe',
    allCategories: risk.categories,
    riskScore: risk.score,
    safetyScore: 100 - risk.score,
  };
}
