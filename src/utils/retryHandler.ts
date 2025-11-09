// utils/retryHandler.ts
import { delay } from './errorHandler';

export interface RateLimitError extends Error {
  statusCode?: number;
  responseHeaders?: {
    'retry-after'?: string;
  };
}

export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const rateLimitError = error as RateLimitError;
      
      if (rateLimitError?.statusCode === 429 && attempt < maxRetries) {
        const retryAfter = rateLimitError.responseHeaders?.['retry-after'] || '5';
        const delayMs = parseInt(retryAfter) * 1000;
        console.log(`Rate limited. Retrying in ${delayMs}ms... (Attempt ${attempt}/${maxRetries})`);
        await delay(delayMs);
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
};