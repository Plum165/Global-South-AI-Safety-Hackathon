import Redis from 'ioredis';
import { logger } from '../services/logger.ts';

let client: Redis | null = null;

export function getRedis(): Redis | null {
  if (client) return client;

  const url = process.env.REDIS_URL;
  if (!url) return null;

  try {
    client = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1 });

    client.on('error', (err) => {
      logger.warn('Redis connection error — falling back to JSON storage', err.message);
      client = null;
    });

    logger.info(`Redis connected at ${url}`);
    return client;
  } catch {
    logger.warn('Redis unavailable — using JSON file storage');
    return null;
  }
}

export async function redisAvailable(): Promise<boolean> {
  const r = getRedis();
  if (!r) return false;
  try {
    await r.ping();
    return true;
  } catch {
    return false;
  }
}
