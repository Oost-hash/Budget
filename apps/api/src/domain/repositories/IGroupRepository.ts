import { Group } from '@domain/entities/Group';

export interface IGroupRepository {
  // Basic CRUD
  save(group: Group): Promise<void>;
  findById(id: string): Promise<Group | null>;
  findAll(): Promise<Group[]>;
  delete(id: string): Promise<void>;
  
  // Validation helper
  existsByName(name: string): Promise<boolean>;
}