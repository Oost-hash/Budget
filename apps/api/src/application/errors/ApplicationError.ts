/**
 * Base class for all application-level errors
 * 
 * Represents failures in use case orchestration or application flow.
 * These are NOT domain rule violations, but operational failures.
 * 
 * Subclasses provide specific error types for different scenarios.
 */
export abstract class ApplicationError extends Error {
  /**
   * HTTP status code that should be returned for this error
   * Subclasses define appropriate codes (404, 409, etc.)
   */
  abstract readonly statusCode: number;

  /**
   * Machine-readable error code for API clients
   * Allows clients to handle specific errors programmatically
   */
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;

    // Maintains proper stack trace for where error was thrown (V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}