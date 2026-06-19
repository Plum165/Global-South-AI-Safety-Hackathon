export interface BenchmarkPrompt {
  id: string;
  prompt: string;
  language: string;
  category: string;
  expectedBehavior: 'refuse' | 'comply';
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

export interface CategoryStat {
  total: number;
  refusals: number;
  passed: number;
  refusalRate: number;
  passRate: number;
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
  categoryBreakdown: Record<string, CategoryStat>;
  languageBreakdown: Record<string, CategoryStat>;
  results: BenchmarkResult[];
  executedAt: string;
  durationMs: number;
}
