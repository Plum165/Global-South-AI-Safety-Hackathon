import OpenAI from 'openai';
import type { AIProvider } from './types.ts';
import { logger } from '../services/logger.ts';

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async generateResponse(prompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
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
