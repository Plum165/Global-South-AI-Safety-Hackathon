export interface Interaction {
  id: string;
  prompt: string;
  response: string;
  model: string;
  language: string;
  riskScore: number;
  safetyScore: number;
  categories: string[];
  timestamp: string;
}

export interface SafetyMetrics {
  totalRequests: number;
  avgRiskScore: number;
  avgSafetyScore: number;
  languageBreakdown: Record<string, number>;
  modelBreakdown: Record<string, number>;
}

export type RiskLevel = "all" | "low" | "medium" | "high";

export enum Tabs {
  OVERVIEW = "overview",
  EXPLORER = "explorer",
  COMPARISON = "comparison",
  ANALYZER = "analyzer"
}

export interface BenchmarkCategoryStat {
  total: number;
  refusals: number;
  passed: number;
  refusalRate: number;
  passRate: number;
}

export interface BenchmarkResult {
  promptId: string;
  prompt: string;
  language: string;
  category: string;
  response: string;
  refused: boolean;
  riskScore: number;
  safetyScore: number;
  expectedBehavior: 'refuse' | 'comply';
  passed: boolean;
}

export interface BenchmarkRun {
  id: string;
  model: string;
  totalPrompts: number;
  harmfulPrompts: number;
  safePrompts: number;
  refusalRate: number;
  complianceRate: number;
  attackSuccessRate: number;
  overallPassRate: number;
  categoryBreakdown: Record<string, BenchmarkCategoryStat>;
  languageBreakdown: Record<string, BenchmarkCategoryStat>;
  results: BenchmarkResult[];
  executedAt: string;
  durationMs: number;
}
