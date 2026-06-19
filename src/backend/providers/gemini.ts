import { GoogleGenAI } from '@google/genai';
import type { AIProvider } from './types.ts';
import { logger } from '../services/logger.ts';

export class GeminiProvider implements AIProvider {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY!;
    this.ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
  }

  async generateResponse(prompt: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.0-flash',
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
