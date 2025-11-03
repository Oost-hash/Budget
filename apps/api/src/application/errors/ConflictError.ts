import { ApplicationError } from './ApplicationError';

/**
 * Error thrown when attempting to create a resource that already exists
 * 
 * Use this when:
 * - Repository.existsByName() returns true
 * - Repository.existsByIban() returns true
 * - Unique constraint would be violated
 * 
 * Examples:
 * - "Account name already exists"
 * - "IBAN already exists"
 * - "Category name already exists in this group"
 * - "Payee with this name already exists"
 * 
 * Maps to HTTP 409 Conflict
 */
export class ConflictError extends ApplicationError {
  readonly statusCode = 409;
  readonly code = 'CONFLICT';

  constructor(message: string) {
    super(message);
  }
}