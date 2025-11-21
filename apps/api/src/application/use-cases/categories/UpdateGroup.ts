import { IGroupRepository } from '@domain/repositories/IGroupRepository';
import { GroupDTO } from '@application/dtos/GroupDTO';
import { NotFoundError, ConflictError } from '@application/errors';

export interface UpdateGroupInput {
  id: string;
  name: string;
}

export class UpdateGroup {
  constructor(
    private groupRepo: IGroupRepository
  ) {}

  async execute(input: UpdateGroupInput): Promise<GroupDTO> {
    // 1. Find existing group
    const group = await this.groupRepo.findById(input.id);
    if (!group) {
      throw new NotFoundError('Group not found');
    }

    // 2. Validation: Check if new name already exists (on different group)
    const existingGroup = await this.groupRepo.existsByName(input.name);
    if (existingGroup && group.name !== input.name) {
      throw new ConflictError('Group name already exists');
    }

    // 3. Update domain entity (uses domain validation)
    group.rename(input.name);

    // 4. Persist
    await this.groupRepo.save(group);

    // 5. Return DTO
    return GroupDTO.fromDomain(group);
  }
}