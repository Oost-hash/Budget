import { ICategoryRepository } from '@domain/repositories/ICategoryRepository';
import { CategoryDTO } from '@application/dtos/CategoryDTO';

export class GetAllCategories {
  constructor(
    private categoryRepo: ICategoryRepository
  ) {}

  async execute(): Promise<CategoryDTO[]> {
    // 1. Get all categories from repository (sorted by position)
    const categories = await this.categoryRepo.findAll();

    // 2. Convert to DTOs
    return categories.map(CategoryDTO.fromDomain);
  }
}