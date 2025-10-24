import { ICategoryRepository } from '@domain/repositories/ICategoryRepository';
import { CategoryDTO } from '@application/dtos/CategoryDTO';

export interface GetCategoriesByGroupInput {
  groupId: string | null;
}

export class GetCategoriesByGroup {
  constructor(
    private categoryRepo: ICategoryRepository
  ) {}

  async execute(input: GetCategoriesByGroupInput): Promise<CategoryDTO[]> {
    // 1. Get categories for specific group (or without group if null)
    let categories;
    if (input.groupId === null) {
      categories = await this.categoryRepo.findWithoutGroup();
    } else {
      categories = await this.categoryRepo.findByGroupId(input.groupId);
    }

    // 2. Convert to DTOs
    return categories.map(CategoryDTO.fromDomain);
  }
}