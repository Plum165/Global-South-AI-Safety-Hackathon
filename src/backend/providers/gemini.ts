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
    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
      });
      const text = response.text;
      if (!text) {
        // Empty text = content blocked by Gemini safety filters
        return 'I cannot help with this request. It has been blocked by safety filters.';
      }
      return text.trim();
    } catch (err: any) {
      const msg: string = err?.message ?? String(err);
      logger.warn(`Gemini error: ${msg}`);
      // Safety block = no text / blocked response → treat as refusal
      // Network/auth errors → re-throw so caller knows provider is down
      if (
        msg.includes('SAFETY') ||
        msg.includes('blocked') ||
        msg.includes('PROHIBITED') ||
        msg.includes('finish_reason') ||
        msg.includes('RECITATION')
      ) {
        return 'I cannot help with this request. It has been blocked by safety filters.';
      }
      throw err;
    }
  }
}
