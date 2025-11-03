import { ICategoryRepository } from '@domain/repositories/ICategoryRepository';
import { CategoryDTO } from '@application/dtos/CategoryDTO';
import { NotFoundError } from '@application/errors';

export interface MoveCategoryToGroupInput {
  categoryId: string;
  targetGroupId: string | null;
}

export class MoveCategoryToGroup {
  constructor(
    private categoryRepo: ICategoryRepository
  ) {}

  async execute(input: MoveCategoryToGroupInput): Promise<CategoryDTO> {
    // 1. Find category
    const category = await this.categoryRepo.findById(input.categoryId);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // 2. Get position for target group (add to end)
    let newPosition = 1;
    if (input.targetGroupId) {
      const existingCategories = await this.categoryRepo.findByGroupId(input.targetGroupId);
      newPosition = existingCategories.length + 1;
    } else {
      const existingCategories = await this.categoryRepo.findWithoutGroup();
      newPosition = existingCategories.length + 1;
    }

    // 3. Move category
    if (input.targetGroupId) {
      category.assignToGroup(input.targetGroupId);
    } else {
      category.removeFromGroup();
    }
    category.changePosition(newPosition);

    // 4. Persist
    await this.categoryRepo.save(category);

    // 5. Return DTO
    return CategoryDTO.fromDomain(category);
  }
}