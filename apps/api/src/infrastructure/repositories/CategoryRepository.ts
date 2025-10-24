import { DataSource, Repository, IsNull } from 'typeorm';
import { ICategoryRepository } from '@domain/repositories/ICategoryRepository';
import { Category } from '@domain/entities/Category';
import { CategoryEntity } from '../database/entities/CategoryEntity';
import { CategoryMapper } from '../database/mappers/CategoryMapper';

export class CategoryRepository implements ICategoryRepository {
  private repository: Repository<CategoryEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(CategoryEntity);
  }

  async save(category: Category): Promise<void> {
    const entity = CategoryMapper.toEntity(category);
    await this.repository.save(entity);
  }

  async findById(id: string): Promise<Category | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? CategoryMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Category[]> {
    const entities = await this.repository.find({
      order: { position: 'ASC' }
    });
    return entities.map(CategoryMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findByGroupId(groupId: string): Promise<Category[]> {
    const entities = await this.repository.find({
      where: { group_id: groupId },
      order: { position: 'ASC' }
    });
    return entities.map(CategoryMapper.toDomain);
  }

  async findWithoutGroup(): Promise<Category[]> {
    const entities = await this.repository.find({
      where: { group_id: IsNull() },
      order: { position: 'ASC' }
    });
    return entities.map(CategoryMapper.toDomain);
  }

  async existsByNameInGroup(name: string, groupId: string | null): Promise<boolean> {
    const count = await this.repository.count({
      where: {
        name,
        group_id: groupId === null ? IsNull() : groupId
      }
    });
    return count > 0;
  }

  async saveMany(categories: Category[]): Promise<void> {
    const entities = categories.map(CategoryMapper.toEntity);
    await this.repository.save(entities);
  }
}