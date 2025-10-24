import { ICategoryRepository } from '@domain/repositories/ICategoryRepository';
import { Category } from '@domain/entities/Category';
import { CategoryDTO } from '@application/dtos/CategoryDTO';
import { v4 as uuid } from 'uuid';

export interface CreateCategoryInput {
  name: string;
  groupId: string | null;
}

export class CreateCategory {
  constructor(
    private categoryRepo: ICategoryRepository
  ) {}

  async execute(input: CreateCategoryInput): Promise<CategoryDTO> {
    // 1. Validation: Check if name already exists in group
    const exists = await this.categoryRepo.existsByNameInGroup(
      input.name,
      input.groupId
    );
    if (exists) {
      throw new Error('Category name already exists in this group');
    }

    // 2. Determine position (add to end of group)
    let position = 1;
    if (input.groupId) {
      const existingCategories = await this.categoryRepo.findByGroupId(input.groupId);
      position = existingCategories.length + 1;
    } else {
      const existingCategories = await this.categoryRepo.findWithoutGroup();
      position = existingCategories.length + 1;
    }

    // 3. Create domain entity
    const category = new Category(
      uuid(),
      input.name,
      input.groupId,
      position
    );

    // 4. Persist
    await this.categoryRepo.save(category);

    // 5. Return DTO
    return CategoryDTO.fromDomain(category);
  }
}