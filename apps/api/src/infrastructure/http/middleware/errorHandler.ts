import { Request, Response, NextFunction } from 'express';
import { ApplicationError } from '@application/errors';
import { DomainError } from '@domain/errors';
import { config } from '../../../config';

/**
 * Error Response Structure
 */
interface ErrorResponse {
  error: string;
  code?: string;
  statusCode?: number;
  stack?: string;
}

/**
 * Centralized Error Handler Middleware
 * 
 * Catches all errors thrown in routes and use cases, then:
 * 1. Maps errors to appropriate HTTP status codes
 * 2. Formats error responses consistently
 * 3. Hides sensitive information in production
 * 4. Includes stack traces in development for debugging
 * 
 * Error Mapping:
 * - ApplicationError → Uses error.statusCode (404, 409, 422, etc.)
 * - DomainError → 400 Bad Request (business rule violation)
 * - Unknown Error → 500 Internal Server Error
 * 
 * Usage:
 * Place AFTER all routes in main.ts:
 * ```typescript
 * app.use('/api', apiRouter);
 * app.use(errorHandler); // ← Catches errors from routes
 * ```
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error for debugging (in production, use proper logger)
  console.error('Error occurred:', {
    message: err.message,
    name: err.name,
    path: req.path,
    method: req.method,
  });

  // Determine status code and error code based on error type
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';

  if (err instanceof ApplicationError) {
    // Application-level errors have explicit status codes
    statusCode = err.statusCode;
    errorCode = err.code;
  } else if (err instanceof DomainError) {
    // Domain errors are business rule violations → 400 Bad Request
    statusCode = 400;
    errorCode = 'DOMAIN_ERROR';
  }

  // Build error response
  const errorResponse: ErrorResponse = {
    error: err.message,
  };

  // Include error code and status in development (helps debugging)
  if (config.isDevelopment) {
    errorResponse.code = errorCode;
    errorResponse.statusCode = statusCode;
  }

  // Include stack trace ONLY in development
  if (config.isDevelopment && err.stack) {
    errorResponse.stack = err.stack;
  }

  // Production: Hide internal errors (security)
  if (config.isProduction && statusCode === 500) {
    errorResponse.error = 'Internal server error';
  }

  res.status(statusCode).json(errorResponse);
}