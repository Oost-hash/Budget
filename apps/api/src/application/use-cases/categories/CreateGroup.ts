import { IGroupRepository } from '@domain/repositories/IGroupRepository';
import { Group } from '@domain/entities/Group';
import { GroupDTO } from '@application/dtos/GroupDTO';
import { v4 as uuid } from 'uuid';

export interface CreateGroupInput {
  name: string;
}

export class CreateGroup {
  constructor(
    private groupRepo: IGroupRepository
  ) {}

  async execute(input: CreateGroupInput): Promise<GroupDTO> {
    // 1. Validation: Check if name already exists
    const exists = await this.groupRepo.existsByName(input.name);
    if (exists) {
      throw new Error('Group name already exists');
    }

    // 2. Create domain entity
    const group = new Group(
      uuid(),
      input.name
    );

    // 3. Persist
    await this.groupRepo.save(group);

    // 4. Return DTO
    return GroupDTO.fromDomain(group);
  }
}