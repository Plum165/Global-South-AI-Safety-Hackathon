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
