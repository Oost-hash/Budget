import { z } from 'zod';

/**
 * Schema for creating a new rule
 */
export const CreateRuleSchema = z.object({
  payee_id: z.string()
    .uuid('Invalid payee ID format'),
  
  category_id: z.string()
    .uuid('Invalid category ID format')
    .nullable()
    .optional(),
  
  amount: z.number()
    .optional()
    .nullable(),
  
  currency: z.string()
    .length(3, 'Currency must be 3-letter code (e.g. EUR)')
    .regex(/^[A-Z]{3}$/, 'Currency must be uppercase letters')
    .optional()
    .default('EUR'),
  
  description_template: z.string()
    .max(500, 'Description template too long (max 500 characters)')
    .nullable()
    .optional(),
  
  is_recurring: z.boolean()
    .optional()
    .default(false),
  
  frequency: z.enum(['monthly', 'weekly', 'yearly'])
    .nullable()
    .optional(),
  
  is_active: z.boolean()
    .optional()
    .default(true)
}).strict()
  .refine(
    (data) => {
      // If is_recurring is true, frequency must be provided
      if (data.is_recurring && !data.frequency) {
        return false;
      }
      return true;
    },
    {
      message: 'Frequency is required when is_recurring is true',
      path: ['frequency']
    }
  )
  .refine(
    (data) => {
      // If is_recurring is false, frequency must be null
      if (!data.is_recurring && data.frequency) {
        return false;
      }
      return true;
    },
    {
      message: 'Frequency can only be set when is_recurring is true',
      path: ['frequency']
    }
  );

/**
 * Schema for updating an existing rule
 */
export const UpdateRuleSchema = z.object({
  category_id: z.string()
    .uuid('Invalid category ID format')
    .nullable()
    .optional(),
  
  amount: z.number()
    .nullable()
    .optional(),
  
  currency: z.string()
    .length(3, 'Currency must be 3-letter code (e.g. EUR)')
    .regex(/^[A-Z]{3}$/, 'Currency must be uppercase letters')
    .optional(),
  
  description_template: z.string()
    .max(500, 'Description template too long (max 500 characters)')
    .nullable()
    .optional(),
  
  is_recurring: z.boolean()
    .optional(),
  
  frequency: z.enum(['monthly', 'weekly', 'yearly'])
    .nullable()
    .optional(),
  
  is_active: z.boolean()
    .optional()
}).strict()
  .refine(
    (data) => {
      // If is_recurring is explicitly set to true, frequency must be provided
      if (data.is_recurring === true && !data.frequency) {
        return false;
      }
      return true;
    },
    {
      message: 'Frequency is required when is_recurring is true',
      path: ['frequency']
    }
  )
  .refine(
    (data) => {
      // If is_recurring is explicitly set to false, frequency must be null
      if (data.is_recurring === false && data.frequency) {
        return false;
      }
      return true;
    },
    {
      message: 'Frequency can only be set when is_recurring is true',
      path: ['frequency']
    }
  );

// Export types
export type CreateRuleInput = z.infer<typeof CreateRuleSchema>;
export type UpdateRuleInput = z.infer<typeof UpdateRuleSchema>;