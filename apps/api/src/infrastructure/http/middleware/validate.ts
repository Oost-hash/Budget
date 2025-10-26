import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Validation middleware factory
 * 
 * Creates Express middleware that validates request body against a Zod schema.
 * Blocks invalid requests before they reach use cases.
 * 
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 * 
 * @example
 * router.post('/', validate(CreateAccountSchema), async (req, res) => {
 *   // req.body is now validated and type-safe
 * });
 */
export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code
        }))
      });
      return;
    }
    
    // Replace req.body with validated & sanitized data
    req.body = result.data;
    next();
  };
}