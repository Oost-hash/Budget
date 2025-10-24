import { IGroupRepository } from '@domain/repositories/IGroupRepository';

export interface DeleteGroupInput {
  id: string;
}

export class DeleteGroup {
  constructor(
    private groupRepo: IGroupRepository
  ) {}

  async execute(input: DeleteGroupInput): Promise<void> {
    // 1. Check if group exists
    const group = await this.groupRepo.findById(input.id);
    if (!group) {
      throw new Error('Group not found');
    }

    // 2. Delete group
    // Note: Database CASCADE will set category.group_id to NULL automatically
    await this.groupRepo.delete(input.id);

    // No return value for delete operations
  }
}