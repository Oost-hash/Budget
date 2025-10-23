import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { DataSource } from 'typeorm';
import { CategoryRepository } from './CategoryRepository';
import { Category } from '@domain/entities/Category';
import { CategoryEntity } from '../database/entities/CategoryEntity';
import { GroupEntity } from '../database/entities/GroupEntity';

describe('CategoryRepository', () => {
  let dataSource: DataSource;
  let repository: CategoryRepository;

  beforeEach(async () => {
    // Setup in-memory database voor elke test
    dataSource = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      synchronize: true,
      logging: false,
      entities: [CategoryEntity, GroupEntity],
    });

    await dataSource.initialize();
    repository = new CategoryRepository(dataSource);
  });

  afterEach(async () => {
    await dataSource.destroy();
  });

  // Helper function to create groups in database
  async function createGroup(id: string, name: string): Promise<void> {
    const groupRepo = dataSource.getRepository(GroupEntity);
    const group = new GroupEntity();
    group.id = id;
    group.name = name;
    await groupRepo.save(group);
  }

  describe('save and findById', () => {
    test('should save and retrieve a category', async () => {
      // Arrange
      const category = new Category('cat-1', 'Groceries', null, 1);

      // Act
      await repository.save(category);
      const found = await repository.findById('cat-1');

      // Assert
      expect(found).not.toBeNull();
      expect(found?.id).toBe('cat-1');
      expect(found?.name).toBe('Groceries');
      expect(found?.groupId).toBeNull();
      expect(found?.position).toBe(1);
    });

    test('should return null when category does not exist', async () => {
      // Act
      const found = await repository.findById('non-existent');

      // Assert
      expect(found).toBeNull();
    });

    test('should update existing category', async () => {
      // Arrange
      const category = new Category('cat-1', 'Groceries', null, 1);
      await repository.save(category);

      // Act - rename category
      category.rename('Food & Drinks');
      await repository.save(category);

      // Assert
      const found = await repository.findById('cat-1');
      expect(found?.name).toBe('Food & Drinks');
    });
  });

  describe('findAll', () => {
    test('should return empty array when no categories exist', async () => {
      // Act
      const categories = await repository.findAll();

      // Assert
      expect(categories).toEqual([]);
    });

    test('should return all categories sorted by position', async () => {
      // Arrange
      const cat1 = new Category('cat-1', 'Groceries', null, 3);
      const cat2 = new Category('cat-2', 'Rent', null, 1);
      const cat3 = new Category('cat-3', 'Transport', null, 2);

      await repository.save(cat1);
      await repository.save(cat2);
      await repository.save(cat3);

      // Act
      const categories = await repository.findAll();

      // Assert
      expect(categories).toHaveLength(3);
      expect(categories[0]?.name).toBe('Rent'); // position 1
      expect(categories[1]?.name).toBe('Transport'); // position 2
      expect(categories[2]?.name).toBe('Groceries'); // position 3
    });
  });

  describe('delete', () => {
    test('should delete a category', async () => {
      // Arrange
      const category = new Category('cat-1', 'Groceries', null, 1);
      await repository.save(category);

      // Act
      await repository.delete('cat-1');

      // Assert
      const found = await repository.findById('cat-1');
      expect(found).toBeNull();
    });

    test('should not throw error when deleting non-existent category', async () => {
      // Act & Assert - should not throw
      await expect(repository.delete('non-existent')).resolves.toBeUndefined();
    });
  });

  describe('findByGroupId', () => {
    test('should return categories for specific group', async () => {
      // Arrange
      await createGroup('group-1', 'Group 1');
      await createGroup('group-2', 'Group 2');

      const cat1 = new Category('cat-1', 'Groceries', 'group-1', 1);
      const cat2 = new Category('cat-2', 'Rent', 'group-1', 2);
      const cat3 = new Category('cat-3', 'Transport', 'group-2', 1);

      await repository.save(cat1);
      await repository.save(cat2);
      await repository.save(cat3);

      // Act
      const categories = await repository.findByGroupId('group-1');

      // Assert
      expect(categories).toHaveLength(2);
      expect(categories[0]?.name).toBe('Groceries');
      expect(categories[1]?.name).toBe('Rent');
    });

    test('should return empty array when group has no categories', async () => {
      // Act
      const categories = await repository.findByGroupId('empty-group');

      // Assert
      expect(categories).toEqual([]);
    });

    test('should return categories sorted by position', async () => {
      // Arrange
      await createGroup('group-1', 'Test Group');

      const cat1 = new Category('cat-1', 'B-Category', 'group-1', 2);
      const cat2 = new Category('cat-2', 'A-Category', 'group-1', 1);

      await repository.save(cat1);
      await repository.save(cat2);

      // Act
      const categories = await repository.findByGroupId('group-1');

      // Assert
      expect(categories[0]?.name).toBe('A-Category'); // position 1 first
      expect(categories[1]?.name).toBe('B-Category');
    });
  });

  describe('findWithoutGroup', () => {
    test('should return categories without group', async () => {
      // Arrange
      await createGroup('group-1', 'Test Group');

      const cat1 = new Category('cat-1', 'Uncategorized', null, 1);
      const cat2 = new Category('cat-2', 'Groceries', 'group-1', 1);
      const cat3 = new Category('cat-3', 'Other', null, 2);

      await repository.save(cat1);
      await repository.save(cat2);
      await repository.save(cat3);

      // Act
      const categories = await repository.findWithoutGroup();

      // Assert
      expect(categories).toHaveLength(2);
      expect(categories[0]?.name).toBe('Uncategorized');
      expect(categories[1]?.name).toBe('Other');
    });

    test('should return empty array when all categories have groups', async () => {
      // Arrange
      await createGroup('group-1', 'Test Group');

      const cat1 = new Category('cat-1', 'Groceries', 'group-1', 1);
      await repository.save(cat1);

      // Act
      const categories = await repository.findWithoutGroup();

      // Assert
      expect(categories).toEqual([]);
    });
  });

  describe('existsByNameInGroup', () => {
    test('should return true when name exists in group', async () => {
      // Arrange
      await createGroup('group-1', 'Test Group');

      const category = new Category('cat-1', 'Groceries', 'group-1', 1);
      await repository.save(category);

      // Act
      const exists = await repository.existsByNameInGroup('Groceries', 'group-1');

      // Assert
      expect(exists).toBe(true);
    });

    test('should return false when name does not exist in group', async () => {
      // Arrange
      await createGroup('group-1', 'Test Group');

      const category = new Category('cat-1', 'Groceries', 'group-1', 1);
      await repository.save(category);

      // Act
      const exists = await repository.existsByNameInGroup('Rent', 'group-1');

      // Assert
      expect(exists).toBe(false);
    });

    test('should return false when name exists in different group', async () => {
      // Arrange
      await createGroup('group-1', 'Test Group');

      const category = new Category('cat-1', 'Groceries', 'group-1', 1);
      await repository.save(category);

      // Act
      const exists = await repository.existsByNameInGroup('Groceries', 'group-2');

      // Assert
      expect(exists).toBe(false);
    });

    test('should return true when name exists in null group', async () => {
      // Arrange
      const category = new Category('cat-1', 'Uncategorized', null, 1);
      await repository.save(category);

      // Act
      const exists = await repository.existsByNameInGroup('Uncategorized', null);

      // Assert
      expect(exists).toBe(true);
    });

    test('should differentiate between null group and actual group', async () => {
      // Arrange
      await createGroup('group-1', 'Test Group');

      const cat1 = new Category('cat-1', 'Test', null, 1);
      const cat2 = new Category('cat-2', 'Test', 'group-1', 1);
      await repository.save(cat1);
      await repository.save(cat2);

      // Act
      const existsInNull = await repository.existsByNameInGroup('Test', null);
      const existsInGroup = await repository.existsByNameInGroup('Test', 'group-1');

      // Assert
      expect(existsInNull).toBe(true);
      expect(existsInGroup).toBe(true);
    });
  });

  describe('saveMany', () => {
    test('should save multiple categories at once', async () => {
      // Arrange
      const categories = [
        new Category('cat-1', 'Groceries', null, 1),
        new Category('cat-2', 'Rent', null, 2),
        new Category('cat-3', 'Transport', null, 3),
      ];

      // Act
      await repository.saveMany(categories);

      // Assert
      const all = await repository.findAll();
      expect(all).toHaveLength(3);
    });

    test('should update positions of multiple categories', async () => {
      // Arrange - create initial categories
      const cat1 = new Category('cat-1', 'A', null, 1);
      const cat2 = new Category('cat-2', 'B', null, 2);
      const cat3 = new Category('cat-3', 'C', null, 3);
      await repository.saveMany([cat1, cat2, cat3]);

      // Act - change positions (simulating drag & drop reorder)
      cat1.changePosition(3);
      cat2.changePosition(1);
      cat3.changePosition(2);
      await repository.saveMany([cat1, cat2, cat3]);

      // Assert
      const all = await repository.findAll();
      expect(all[0]?.name).toBe('B'); // position 1
      expect(all[1]?.name).toBe('C'); // position 2
      expect(all[2]?.name).toBe('A'); // position 3
    });

    test('should handle empty array', async () => {
      // Act & Assert - should not throw
      await expect(repository.saveMany([])).resolves.toBeUndefined();
    });
  });

  describe('integration with Group (database constraints)', () => {
    test('should allow category with valid group_id', async () => {
      // Arrange - create a group first
      const groupRepo = dataSource.getRepository(GroupEntity);
      const group = new GroupEntity();
      group.id = 'group-1';
      group.name = 'Housing';
      await groupRepo.save(group);

      // Act - create category with group_id
      const category = new Category('cat-1', 'Rent', 'group-1', 1);
      await repository.save(category);

      // Assert
      const found = await repository.findById('cat-1');
      expect(found?.groupId).toBe('group-1');
    });

    test('should set group_id to null when group is deleted', async () => {
      // Arrange - create group and category
      const groupRepo = dataSource.getRepository(GroupEntity);
      const group = new GroupEntity();
      group.id = 'group-1';
      group.name = 'Housing';
      await groupRepo.save(group);

      const category = new Category('cat-1', 'Rent', 'group-1', 1);
      await repository.save(category);

      // Act - delete the group
      await groupRepo.delete('group-1');

      // Assert - category should still exist but group_id is null
      const found = await repository.findById('cat-1');
      expect(found).not.toBeNull();
      expect(found?.groupId).toBeNull();
    });
  });
});