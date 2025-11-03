import { IGroupRepository } from '@domain/repositories/IGroupRepository';
import { GroupDTO } from '@application/dtos/GroupDTO';
import { NotFoundError } from '@application/errors';

export interface GetGroupInput {
  id: string;
}

export class GetGroup {
  constructor(
    private groupRepo: IGroupRepository
  ) {}

  async execute(input: GetGroupInput): Promise<GroupDTO> {
    // 1. Find group by ID
    const group = await this.groupRepo.findById(input.id);

    // 2. Check if exists
    if (!group) {
      throw new NotFoundError('Group not found');
    }

    // 3. Return DTO
    return GroupDTO.fromDomain(group);
  }
}