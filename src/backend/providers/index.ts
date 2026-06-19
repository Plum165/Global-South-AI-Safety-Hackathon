import type { AIProvider } from './types.ts';
export type { AIProvider } from './types.ts';

import { GeminiProvider } from './gemini.ts';
import { OpenAIProvider } from './openai.ts';
import { AnthropicProvider } from './anthropic.ts';
import { LocalProvider } from './local.ts';
import { logger } from '../services/logger.ts';

export function getProvider(model: string): AIProvider {
  const normalized = model.toLowerCase().trim();

  switch (normalized) {
    case 'gemini': {
      const key = process.env.GEMINI_API_KEY;
      if (key && key !== 'MY_GEMINI_API_KEY') return new GeminiProvider();
      logger.warn('GEMINI_API_KEY not configured — falling back to local simulation');
      return new LocalProvider('gemini');
    }

    case 'openai': {
      const key = process.env.OPENAI_API_KEY;
      if (key) return new OpenAIProvider();
      logger.warn('OPENAI_API_KEY not configured — falling back to local simulation');
      return new LocalProvider('openai');
    }

    case 'anthropic':
    case 'claude': {
      const key = process.env.ANTHROPIC_API_KEY;
      if (key) return new AnthropicProvider();
      logger.warn('ANTHROPIC_API_KEY not configured — falling back to local simulation');
      return new LocalProvider('anthropic');
    }

    case 'open-source':
    case 'local':
    default:
      return new LocalProvider(normalized);
  }
}
