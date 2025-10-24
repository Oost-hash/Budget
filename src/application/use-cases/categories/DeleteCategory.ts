import { ICategoryRepository } from '@domain/repositories/ICategoryRepository';

export interface DeleteCategoryInput {
  id: string;
}

export class DeleteCategory {
  constructor(
    private categoryRepo: ICategoryRepository
  ) {}

  async execute(input: DeleteCategoryInput): Promise<void> {
    // 1. Check if category exists
    const category = await this.categoryRepo.findById(input.id);
    if (!category) {
      throw new Error('Category not found');
    }

    // 2. Delete category
    // Note: TransactionCategory records will be CASCADE deleted by database
    await this.categoryRepo.delete(input.id);

    // No return value for delete operations
  }
}