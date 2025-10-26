import { z } from 'zod';

/**
 * Schema for creating a new category
 */
export const CreateCategorySchema = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .max(100, 'Category name too long (max 100 characters)')
    .trim(),
  
  groupId: z.string()
    .uuid('Invalid group ID format')
    .nullable()
}).strict();

/**
 * Schema for updating an existing category
 */
export const UpdateCategorySchema = z.object({
  name: z.string()
    .min(1, 'Category name cannot be empty')
    .max(100, 'Category name too long (max 100 characters)')
    .trim()
    .optional(),
  
  position: z.number()
    .int('Position must be an integer')
    .min(1, 'Position must be at least 1')
    .optional()
}).strict();

/**
 * Schema for moving a category to a different group
 */
export const MoveCategorySchema = z.object({
  targetGroupId: z.string()
    .uuid('Invalid target group ID format')
    .nullable()
}).strict();

// Export types
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
export type MoveCategoryInput = z.infer<typeof MoveCategorySchema>;