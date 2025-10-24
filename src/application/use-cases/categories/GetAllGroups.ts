import { IGroupRepository } from '@domain/repositories/IGroupRepository';
import { GroupDTO } from '@application/dtos/GroupDTO';

export class GetAllGroups {
  constructor(
    private groupRepo: IGroupRepository
  ) {}

  async execute(): Promise<GroupDTO[]> {
    // 1. Get all groups from repository
    const groups = await this.groupRepo.findAll();

    // 2. Convert to DTOs
    return groups.map(GroupDTO.fromDomain);
  }
}