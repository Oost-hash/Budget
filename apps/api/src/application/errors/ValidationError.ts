import { ApplicationError } from './ApplicationError';

/**
 * Error thrown when input validation fails at the application layer
 * 
 * Note: Zod validation happens at the HTTP layer (before reaching use cases).
 * This error is for business-level validation that Zod cannot express.
 * 
 * Use this when:
 * - A value is technically valid but doesn't make business sense
 * - Complex cross-field validation fails
 * - Business-specific constraints are violated
 * 
 * Examples:
 * - "Transfer amount exceeds account balance"
 * - "End date must be after start date"
 * - "Cannot transfer to the same account"
 * 
 * Maps to HTTP 422 Unprocessable Entity
 */
export class ValidationError extends ApplicationError {
  readonly statusCode = 422;
  readonly code = 'VALIDATION_ERROR';

  constructor(message: string) {
    super(message);
  }
}