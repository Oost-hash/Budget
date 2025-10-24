import { Group } from '@domain/entities/Group';

export interface GroupDTO {
  id: string;
  name: string;
  created_at?: Date;
  updated_at?: Date;
}

export class GroupDTO {
  static fromDomain(group: Group): GroupDTO {
    return {
      id: group.id,
      name: group.name,
    };
  }
}