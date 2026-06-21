import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider } from './types.ts';
import { logger } from '../services/logger.ts';

export class AnthropicProvider implements AIProvider {
  private client: Anthropic;
  private modelName: string;

  constructor(apiKey?: string, modelName?: string) {
    this.client = new Anthropic({ apiKey: apiKey || process.env.ANTHROPIC_API_KEY });
    this.modelName = modelName || 'claude-haiku-4-5-20251001';
  }

  async generateResponse(prompt: string): Promise<string> {
    const message = await this.client.messages.create({
      model: this.modelName,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });
    const block = message.content[0];
    if (!block || block.type !== 'text') {
      logger.warn('Anthropic returned no text block');
      return '';
    }
    return block.text;
  }
}
