import { Category } from '@domain/entities/Category';

export interface ICategoryRepository {
  save(category: Category): Promise<void>;
  findById(id: string): Promise<Category | null>;
  findAll(): Promise<Category[]>;
  delete(id: string): Promise<void>;
  
  findByGroupId(groupId: string): Promise<Category[]>;
  findWithoutGroup(): Promise<Category[]>;
  
  existsByNameInGroup(name: string, groupId: string | null): Promise<boolean>;
  saveMany(categories: Category[]): Promise<void>;
}