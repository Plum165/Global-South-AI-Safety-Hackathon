import OpenAI from 'openai';
import type { AIProvider } from './types.ts';
import { logger } from '../services/logger.ts';

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private modelName: string;

  constructor(apiKey?: string, modelName?: string) {
    this.client = new OpenAI({ apiKey: apiKey || process.env.OPENAI_API_KEY });
    this.modelName = modelName || 'gpt-4o-mini';
  }

  async generateResponse(prompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.modelName,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
    });
    const content = response.choices[0]?.message?.content;
    if (!content) {
      logger.warn('OpenAI returned empty response');
      return '';
    }
    return content;
  }
}
