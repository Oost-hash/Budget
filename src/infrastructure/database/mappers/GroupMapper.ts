import { Group } from '@domain/entities/Group';
import { GroupEntity } from '../entities/GroupEntity';

export class GroupMapper {
  static toDomain(entity: GroupEntity): Group {
    return new Group(
      entity.id,
      entity.name
    );
  }

  static toEntity(group: Group): GroupEntity {
    const entity = new GroupEntity();
    entity.id = group.id;
    entity.name = group.name;
    return entity;
  }
}