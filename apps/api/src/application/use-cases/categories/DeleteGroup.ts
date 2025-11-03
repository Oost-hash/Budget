import { IGroupRepository } from '@domain/repositories/IGroupRepository';
import { NotFoundError } from '@application/errors';

export interface DeleteGroupInput {
  id: string;
}

export class DeleteGroup {
  constructor(
    private groupRepo: IGroupRepository
  ) {}

  async execute(input: DeleteGroupInput): Promise<void> {
    // 1. Verify group exists
    const group = await this.groupRepo.findById(input.id);
    if (!group) {
      throw new NotFoundError('Group not found');
    }

    // 2. Delete
    await this.groupRepo.delete(input.id);
  }
}