export type RiskLevel = 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH';

export function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function levelFromScore(score: number): RiskLevel {
  if (score >= 70) return 'HIGH';
  if (score >= 45) return 'MEDIUM';
  if (score >= 20) return 'LOW';
  return 'SAFE';
}

export function safetyFromRisk(riskScore: number): number {
  return clampScore(100 - riskScore);
}

export function weightedScore(scores: number[], weights: number[]): number {
  if (scores.length === 0 || scores.length !== weights.length) return 0;
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  if (totalWeight === 0) return 0;
  const weighted = scores.reduce((sum, s, i) => sum + s * weights[i], 0);
  return clampScore(weighted / totalWeight);
}
