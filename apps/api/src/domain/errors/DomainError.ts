/**
 * Base class for all domain-level errors
 * 
 * Represents violations of business rules, invariants, or domain constraints.
 * These errors indicate that something is wrong with the business logic itself.
 * 
 * Examples:
 * - "Transfer amount must be positive"
 * - "Invalid IBAN format"
 * - "Cannot delete payee with active transactions"
 * - "Overdraft limit only allowed for asset accounts"
 */
export class DomainError extends Error {
  /**
   * Creates a new domain error
   * @param message - Human-readable description of the business rule violation
   */
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
    
    // Maintains proper stack trace for where error was thrown (V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}