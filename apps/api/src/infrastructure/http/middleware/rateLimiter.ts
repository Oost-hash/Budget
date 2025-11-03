import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';

/**
 * Rate Limiter Configuration
 */
interface RateLimiterConfig {
  windowMs?: number;
  max?: number;
}

/**
 * Create rate limiter for write operations (POST, PUT, DELETE)
 * 
 * @param config - Optional configuration (uses defaults if not provided)
 * @returns Express rate limiter middleware
 */
export function createWriteRateLimiter(config?: RateLimiterConfig): RateLimitRequestHandler {
  return rateLimit({
    windowMs: config?.windowMs || 15 * 60 * 1000, // Default: 15 minutes
    max: config?.max || 100, // Default: 100 requests per window
    message: { error: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
  });
}

/**
 * Create rate limiter for read operations (GET)
 * 
 * @param config - Optional configuration (uses defaults if not provided)
 * @returns Express rate limiter middleware
 */
export function createReadRateLimiter(config?: RateLimiterConfig): RateLimitRequestHandler {
  return rateLimit({
    windowMs: config?.windowMs || 15 * 60 * 1000, // Default: 15 minutes
    max: config?.max || 1000, // Default: 1000 requests per window
    message: { error: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

// Export default instances for backwards compatibility
export const writeRateLimiter = createWriteRateLimiter();
export const readRateLimiter = createReadRateLimiter();