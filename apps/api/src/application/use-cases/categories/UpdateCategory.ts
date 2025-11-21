import { ICategoryRepository } from '@domain/repositories/ICategoryRepository';
import { CategoryDTO } from '@application/dtos/CategoryDTO';
import { NotFoundError, ConflictError } from '@application/errors';

export interface UpdateCategoryInput {
  id: string;
  name?: string;
  position?: number;
}

export class UpdateCategory {
  constructor(
    private categoryRepo: ICategoryRepository
  ) {}

  async execute(input: UpdateCategoryInput): Promise<CategoryDTO> {
    // 1. Find existing category
    const category = await this.categoryRepo.findById(input.id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // 2. Update name if provided
    if (input.name !== undefined) {
      // Check if new name already exists in same group
      const exists = await this.categoryRepo.existsByNameInGroup(
        input.name,
        category.groupId
      );
      if (exists && category.name !== input.name) {
        throw new ConflictError('Category name already exists in this group');
      }

      category.rename(input.name);
    }

    // 3. Update position if provided
    if (input.position !== undefined) {
      category.changePosition(input.position);
    }

    // 4. Persist
    await this.categoryRepo.save(category);

    // 5. Return DTO
    return CategoryDTO.fromDomain(category);
  }
}