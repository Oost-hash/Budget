import { Category } from '@domain/entities/Category';
import { CategoryEntity } from '../entities/CategoryEntity';

export class CategoryMapper {
  // Database → Domain
  static toDomain(entity: CategoryEntity): Category {
    return new Category(
      entity.id,
      entity.name,
      entity.group_id,
      entity.position
    );
  }

  // Domain → Database
  static toEntity(category: Category): CategoryEntity {
    const entity = new CategoryEntity();
    entity.id = category.id;
    entity.name = category.name;
    entity.group_id = category.groupId;
    entity.position = category.position;
    // created_at en updated_at worden automatisch door TypeORM gezet
    return entity;
  }
}