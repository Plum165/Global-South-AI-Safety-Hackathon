import { GoogleGenAI } from '@google/genai';
import type { AIProvider } from './types.ts';
import { logger } from '../services/logger.ts';

export class GeminiProvider implements AIProvider {
  private ai: GoogleGenAI;
  private modelName: string;

  constructor(apiKey?: string, modelName?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY!;
    this.modelName = modelName || 'gemini-2.0-flash';
    this.ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
  }

  async generateResponse(prompt: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: prompt,
    });
    const text = response.text;
    if (!text) {
      logger.warn('Gemini returned empty response');
      return '';
    }
    return text.trim();
  }
}
