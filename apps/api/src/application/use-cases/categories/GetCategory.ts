import { ICategoryRepository } from '@domain/repositories/ICategoryRepository';
import { CategoryDTO } from '@application/dtos/CategoryDTO';
import { NotFoundError } from '@application/errors';

export interface GetCategoryInput {
  id: string;
}

export class GetCategory {
  constructor(
    private categoryRepo: ICategoryRepository
  ) {}

  async execute(input: GetCategoryInput): Promise<CategoryDTO> {
    // 1. Find category by ID
    const category = await this.categoryRepo.findById(input.id);

    // 2. Check if exists
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // 3. Return DTO
    return CategoryDTO.fromDomain(category);
  }
}