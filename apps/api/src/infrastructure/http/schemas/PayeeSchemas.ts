import { z } from 'zod';

/**
 * Schema for creating a new payee
 */
export const CreatePayeeSchema = z.object({
  name: z.string()
    .min(1, 'Payee name is required')
    .max(100, 'Payee name too long (max 100 characters)')
    .trim(),
  
  iban: z.string()
    .regex(/^[A-Z]{2}\d{2}[A-Z0-9]+$/, 'Invalid IBAN format')
    .optional()
    .nullable()
}).strict();

/**
 * Schema for updating an existing payee
 */
export const UpdatePayeeSchema = z.object({
  name: z.string()
    .min(1, 'Payee name cannot be empty')
    .max(100, 'Payee name too long (max 100 characters)')
    .trim()
    .optional(),
  
  iban: z.string()
    .regex(/^[A-Z]{2}\d{2}[A-Z0-9]+$/, 'Invalid IBAN format')
    .nullable()
    .optional()
}).strict();

// Export types
export type CreatePayeeInput = z.infer<typeof CreatePayeeSchema>;
export type UpdatePayeeInput = z.infer<typeof UpdatePayeeSchema>;