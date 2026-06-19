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
