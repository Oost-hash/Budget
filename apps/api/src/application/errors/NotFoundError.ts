import { ApplicationError } from './ApplicationError';

/**
 * Error thrown when a requested resource cannot be found
 * 
 * Use this when:
 * - Repository.findById() returns null
 * - A required entity doesn't exist in the database
 * 
 * Examples:
 * - "Account not found"
 * - "Transaction not found"
 * - "Payee not found"
 * 
 * Maps to HTTP 404 Not Found
 */
export class NotFoundError extends ApplicationError {
  readonly statusCode = 404;
  readonly code = 'NOT_FOUND';

  constructor(message: string) {
    super(message);
  }
}