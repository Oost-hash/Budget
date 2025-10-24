import { DataSource, Repository } from 'typeorm';
import { IGroupRepository } from '@domain/repositories/IGroupRepository';
import { Group } from '@domain/entities/Group';
import { GroupEntity } from '../database/entities/GroupEntity';
import { GroupMapper } from '../database/mappers/GroupMapper';

export class GroupRepository implements IGroupRepository {
  private repository: Repository<GroupEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(GroupEntity);
  }

  async save(group: Group): Promise<void> {
    const entity = GroupMapper.toEntity(group);
    await this.repository.save(entity);
  }

  async findById(id: string): Promise<Group | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? GroupMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Group[]> {
    const entities = await this.repository.find({
      order: { name: 'ASC' }
    });
    return entities.map(GroupMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.repository.count({ where: { name } });
    return count > 0;
  }
}