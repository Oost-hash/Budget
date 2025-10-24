import { ICategoryRepository } from '@domain/repositories/ICategoryRepository';
import { CategoryDTO } from '@application/dtos/CategoryDTO';

export interface MoveCategoryToGroupInput {
  categoryId: string;
  targetGroupId: string | null;
}

export class MoveCategoryToGroup {
  constructor(
    private categoryRepo: ICategoryRepository
  ) {}

  async execute(input: MoveCategoryToGroupInput): Promise<CategoryDTO> {
    // 1. Find existing category
    const category = await this.categoryRepo.findById(input.categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    // 2. Check if already in target group
    if (category.groupId === input.targetGroupId) {
      // Already in target group, nothing to do
      return CategoryDTO.fromDomain(category);
    }

    // 3. Move to target group (or remove from group if null)
    if (input.targetGroupId === null) {
      category.removeFromGroup();
    } else {
      category.assignToGroup(input.targetGroupId);
    }

    // 4. Set position to end of target group
    let newPosition = 1;
    if (input.targetGroupId === null) {
      const categoriesInTarget = await this.categoryRepo.findWithoutGroup();
      newPosition = categoriesInTarget.length + 1;
    } else {
      const categoriesInTarget = await this.categoryRepo.findByGroupId(input.targetGroupId);
      newPosition = categoriesInTarget.length + 1;
    }
    category.changePosition(newPosition);

    // 5. Persist
    await this.categoryRepo.save(category);

    // 6. Return DTO
    return CategoryDTO.fromDomain(category);
  }
}