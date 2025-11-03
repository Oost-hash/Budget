/**
 * Application Configuration
 * 
 * Reads from process.env (set via Docker Compose or terminal)
 * Has sensible defaults so app works out-of-the-box
 */

const env = process.env.NODE_ENV || 'development';

export const config = {
  // Environment
  env,
  isDevelopment: env === 'development',
  isProduction: env === 'production',
  isTest: env === 'test',

  // Server
  port: parseInt(process.env.PORT || '3000', 10),

  // Database
  database: {
    path: process.env.DB_PATH || './data/budget.sqlite',
    synchronize: process.env.DB_SYNCHRONIZE === 'false' ? false : env !== 'production',
    logging: process.env.DB_LOGGING === 'true' ? true : env === 'development',
  },

  // CORS
  cors: {
    origins: process.env.CORS_ORIGINS 
      ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
      : ['http://localhost:5173'],
  },

  // Rate Limiting
  rateLimit: {
    read: {
      windowMs: parseInt(process.env.RATE_LIMIT_READ_WINDOW_MS || '900000', 10), // 15 min
      max: parseInt(process.env.RATE_LIMIT_READ_MAX || '1000', 10),
    },
    write: {
      windowMs: parseInt(process.env.RATE_LIMIT_WRITE_WINDOW_MS || '900000', 10), // 15 min
      max: parseInt(process.env.RATE_LIMIT_WRITE_MAX || '100', 10),
    },
  },
} as const;

/**
 * Validate configuration (warns about dangerous settings)
 */
export function validateConfig(): void {
  if (config.isProduction && config.database.synchronize) {
    console.warn(
      '⚠️  WARNING: DB_SYNCHRONIZE is enabled in production! ' +
      'This can cause data loss. Set DB_SYNCHRONIZE=false in docker-compose.yml'
    );
  }
}