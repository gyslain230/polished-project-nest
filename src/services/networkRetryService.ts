
interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  timeoutMs: number;
}

class NetworkRetryService {
  private defaultOptions: RetryOptions = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    timeoutMs: 20000
  };

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private calculateDelay(attempt: number, baseDelay: number, maxDelay: number): number {
    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 0.1 * exponentialDelay;
    return Math.min(exponentialDelay + jitter, maxDelay);
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const opts = { ...this.defaultOptions, ...options };
    let lastError: Error;

    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Network timeout')), opts.timeoutMs)
        );

        const result = await Promise.race([operation(), timeoutPromise]);
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === opts.maxRetries) {
          break;
        }

        const delayMs = this.calculateDelay(attempt, opts.baseDelay, opts.maxDelay);
        console.log(`Retry attempt ${attempt + 1}/${opts.maxRetries} after ${delayMs}ms delay`);
        await this.delay(delayMs);
      }
    }

    throw lastError!;
  }
}

export const networkRetryService = new NetworkRetryService();
