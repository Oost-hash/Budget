import { z } from 'zod';

/**
 * Schema for creating a transfer transaction
 */
export const CreateTransferSchema = z.object({
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  
  fromAccountId: z.string()
    .uuid('Invalid from account ID format'),
  
  toAccountId: z.string()
    .uuid('Invalid to account ID format'),
  
  amount: z.number()
    .positive('Amount must be positive'),
  
  currency: z.string()
    .length(3, 'Currency must be 3-letter code (e.g. EUR)')
    .regex(/^[A-Z]{3}$/, 'Currency must be uppercase letters')
    .optional()
    .default('EUR'),
  
  description: z.string()
    .max(500, 'Description too long (max 500 characters)')
    .optional()
    .nullable()
}).strict()
  .refine(
    (data) => data.fromAccountId !== data.toAccountId,
    {
      message: 'From and to accounts must be different',
      path: ['toAccountId']
    }
  );

/**
 * Schema for creating an income transaction
 */
export const CreateIncomeSchema = z.object({
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  
  accountId: z.string()
    .uuid('Invalid account ID format'),
  
  payeeId: z.string()
    .uuid('Invalid payee ID format'),
  
  categoryId: z.string()
    .uuid('Invalid category ID format')
    .nullable()
    .optional(),
  
  amount: z.number()
    .positive('Amount must be positive'),
  
  currency: z.string()
    .length(3, 'Currency must be 3-letter code (e.g. EUR)')
    .regex(/^[A-Z]{3}$/, 'Currency must be uppercase letters')
    .optional()
    .default('EUR'),
  
  description: z.string()
    .max(500, 'Description too long (max 500 characters)')
    .optional()
    .nullable()
}).strict();

/**
 * Schema for creating an expense transaction
 */
export const CreateExpenseSchema = z.object({
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  
  accountId: z.string()
    .uuid('Invalid account ID format'),
  
  payeeId: z.string()
    .uuid('Invalid payee ID format'),
  
  categoryId: z.string()
    .uuid('Invalid category ID format')
    .nullable()
    .optional(),
  
  amount: z.number()
    .positive('Amount must be positive'),
  
  currency: z.string()
    .length(3, 'Currency must be 3-letter code (e.g. EUR)')
    .regex(/^[A-Z]{3}$/, 'Currency must be uppercase letters')
    .optional()
    .default('EUR'),
  
  description: z.string()
    .max(500, 'Description too long (max 500 characters)')
    .optional()
    .nullable()
}).strict();

/**
 * Schema for updating a transaction
 */
export const UpdateTransactionSchema = z.object({
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  
  payeeId: z.string()
    .uuid('Invalid payee ID format')
    .optional(),
  
  categoryId: z.string()
    .uuid('Invalid category ID format')
    .nullable()
    .optional(),
  
  amount: z.number()
    .positive('Amount must be positive')
    .optional(),
  
  currency: z.string()
    .length(3, 'Currency must be 3-letter code (e.g. EUR)')
    .regex(/^[A-Z]{3}$/, 'Currency must be uppercase letters')
    .optional(),
  
  description: z.string()
    .max(500, 'Description too long (max 500 characters)')
    .nullable()
    .optional()
}).strict();

// Export types
export type CreateTransferInput = z.infer<typeof CreateTransferSchema>;
export type CreateIncomeInput = z.infer<typeof CreateIncomeSchema>;
export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>;