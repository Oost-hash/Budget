import { z } from 'zod';

/**
 * Schema for creating a new group
 */
export const CreateGroupSchema = z.object({
  name: z.string()
    .min(1, 'Group name is required')
    .max(100, 'Group name too long (max 100 characters)')
    .trim()
}).strict();

/**
 * Schema for updating an existing group
 */
export const UpdateGroupSchema = z.object({
  name: z.string()
    .min(1, 'Group name cannot be empty')
    .max(100, 'Group name too long (max 100 characters)')
    .trim()
}).strict();

// Export types
export type CreateGroupInput = z.infer<typeof CreateGroupSchema>;
export type UpdateGroupInput = z.infer<typeof UpdateGroupSchema>;