import { Category } from '@domain/entities/Category';

export interface CategoryDTO {
  id: string;
  name: string;
  groupId: string | null;
  position: number;
  created_at?: Date;
  updated_at?: Date;
}

export class CategoryDTO {
  static fromDomain(category: Category): CategoryDTO {
    return {
      id: category.id,
      name: category.name,
      groupId: category.groupId,
      position: category.position,
    };
  }
}