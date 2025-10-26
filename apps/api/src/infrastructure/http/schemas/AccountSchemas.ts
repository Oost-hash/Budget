import { z } from 'zod';

/**
 * Schema for creating a new account
 * 
 * Security features:
 * - Type validation (string, number, boolean, enum)
 * - Length limits (prevents DoS attacks)
 * - Format validation (IBAN regex)
 * - Range validation (no negative amounts)
 * - Strict mode (blocks prototype pollution via extra fields)
 */
export const CreateAccountSchema = z.object({
  name: z.string()
    .min(1, 'Account name is required')
    .max(100, 'Account name too long (max 100 characters)')
    .trim(),
  
  type: z.enum(['asset', 'liability'], {
    message: 'Type must be either "asset" or "liability"'
  }),
  
  iban: z.string()
    .regex(/^[A-Z]{2}\d{2}[A-Z0-9]+$/, 'Invalid IBAN format')
    .optional()
    .nullable(),
  
  isSavings: z.boolean()
    .optional()
    .default(false),
  
  overdraftLimit: z.object({
    amount: z.number()
      .min(0, 'Overdraft limit cannot be negative'),
    currency: z.string()
      .length(3, 'Currency must be 3-letter code (e.g. EUR)')
      .regex(/^[A-Z]{3}$/, 'Currency must be uppercase letters')
      .default('EUR')
  }).optional(),
  
  creditLimit: z.object({
    amount: z.number()
      .min(0, 'Credit limit cannot be negative'),
    currency: z.string()
      .length(3, 'Currency must be 3-letter code (e.g. EUR)')
      .regex(/^[A-Z]{3}$/, 'Currency must be uppercase letters')
      .default('EUR')
  }).optional(),
  
  paymentDueDate: z.object({
    dayOfMonth: z.number()
      .int('Day must be an integer')
      .min(1, 'Day must be between 1 and 31')
      .max(31, 'Day must be between 1 and 31'),
    shiftDirection: z.enum(['before', 'after', 'none'])
  }).optional()
    .nullable()
}).strict(); // 🛡️ Reject any extra fields (prevents prototype pollution)

/**
 * Schema for updating an existing account
 * 
 * Same validations as CreateAccountSchema but all fields are optional
 * (partial update support)
 */
export const UpdateAccountSchema = z.object({
  name: z.string()
    .min(1, 'Account name cannot be empty')
    .max(100, 'Account name too long (max 100 characters)')
    .trim()
    .optional(),
  
  type: z.enum(['asset', 'liability'], {
    message: 'Type must be either "asset" or "liability"'
  }).optional(),
  
  iban: z.string()
    .regex(/^[A-Z]{2}\d{2}[A-Z0-9]+$/, 'Invalid IBAN format')
    .nullable()
    .optional(),
  
  isSavings: z.boolean()
    .optional(),
  
  overdraftLimit: z.object({
    amount: z.number()
      .min(0, 'Overdraft limit cannot be negative'),
    currency: z.string()
      .length(3, 'Currency must be 3-letter code (e.g. EUR)')
      .regex(/^[A-Z]{3}$/, 'Currency must be uppercase letters')
  }).optional(),
  
  creditLimit: z.object({
    amount: z.number()
      .min(0, 'Credit limit cannot be negative'),
    currency: z.string()
      .length(3, 'Currency must be 3-letter code (e.g. EUR)')
      .regex(/^[A-Z]{3}$/, 'Currency must be uppercase letters')
  }).optional(),
  
  paymentDueDate: z.object({
    dayOfMonth: z.number()
      .int('Day must be an integer')
      .min(1, 'Day must be between 1 and 31')
      .max(31, 'Day must be between 1 and 31'),
    shiftDirection: z.enum(['before', 'after', 'none'])
  }).nullable()
    .optional()
}).strict(); // 🛡️ Reject any extra fields

// Export types for use in routes (optional but helpful)
export type CreateAccountInput = z.infer<typeof CreateAccountSchema>;
export type UpdateAccountInput = z.infer<typeof UpdateAccountSchema>;