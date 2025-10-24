import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { DataSource } from 'typeorm';
import { GroupRepository } from './GroupRepository';
import { Group } from '@domain/entities/Group';
import { GroupEntity } from '../database/entities/GroupEntity';
import { CategoryEntity } from '../database/entities/CategoryEntity';

describe('GroupRepository', () => {
  let dataSource: DataSource;
  let repository: GroupRepository;

  beforeEach(async () => {
    // Setup in-memory database voor elke test
    dataSource = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      synchronize: true,
      logging: false,
      entities: [GroupEntity, CategoryEntity],
    });

    await dataSource.initialize();
    repository = new GroupRepository(dataSource);
  });

  afterEach(async () => {
    await dataSource.destroy();
  });

  describe('save and findById', () => {
    test('should save and retrieve a group', async () => {
      // Arrange
      const group = new Group('group-1', 'Housing');

      // Act
      await repository.save(group);
      const found = await repository.findById('group-1');

      // Assert
      expect(found).not.toBeNull();
      expect(found?.id).toBe('group-1');
      expect(found?.name).toBe('Housing');
    });

    test('should return null when group does not exist', async () => {
      // Act
      const found = await repository.findById('non-existent');

      // Assert
      expect(found).toBeNull();
    });

    test('should update existing group', async () => {
      // Arrange
      const group = new Group('group-1', 'Housing');
      await repository.save(group);

      // Act - rename group
      group.rename('Living Expenses');
      await repository.save(group);

      // Assert
      const found = await repository.findById('group-1');
      expect(found?.name).toBe('Living Expenses');
    });
  });

  describe('findAll', () => {
    test('should return empty array when no groups exist', async () => {
      // Act
      const groups = await repository.findAll();

      // Assert
      expect(groups).toEqual([]);
    });

    test('should return all groups sorted by name', async () => {
      // Arrange
      const group1 = new Group('group-1', 'Utilities');
      const group2 = new Group('group-2', 'Housing');
      const group3 = new Group('group-3', 'Transport');

      await repository.save(group1);
      await repository.save(group2);
      await repository.save(group3);

      // Act
      const groups = await repository.findAll();

      // Assert
      expect(groups).toHaveLength(3);
      expect(groups[0]?.name).toBe('Housing'); // Alphabetically first
      expect(groups[1]?.name).toBe('Transport');
      expect(groups[2]?.name).toBe('Utilities');
    });
  });

  describe('delete', () => {
    test('should delete a group', async () => {
      // Arrange
      const group = new Group('group-1', 'Housing');
      await repository.save(group);

      // Act
      await repository.delete('group-1');

      // Assert
      const found = await repository.findById('group-1');
      expect(found).toBeNull();
    });

    test('should not throw error when deleting non-existent group', async () => {
      // Act & Assert - should not throw
      await expect(repository.delete('non-existent')).resolves.toBeUndefined();
    });

    test('should set category group_id to null when group is deleted', async () => {
      // Arrange - create group
      const group = new Group('group-1', 'Housing');
      await repository.save(group);

      // Create category linked to group
      const categoryRepo = dataSource.getRepository(CategoryEntity);
      const category = new CategoryEntity();
      category.id = 'cat-1';
      category.name = 'Rent';
      category.group_id = 'group-1';
      category.position = 1;
      await categoryRepo.save(category);

      // Act - delete the group
      await repository.delete('group-1');

      // Assert - category still exists but group_id is null
      const foundCategory = await categoryRepo.findOne({ where: { id: 'cat-1' } });
      expect(foundCategory).not.toBeNull();
      expect(foundCategory?.group_id).toBeNull();
    });
  });

  describe('existsByName', () => {
    test('should return true when name exists', async () => {
      // Arrange
      const group = new Group('group-1', 'Housing');
      await repository.save(group);

      // Act
      const exists = await repository.existsByName('Housing');

      // Assert
      expect(exists).toBe(true);
    });

    test('should return false when name does not exist', async () => {
      // Arrange
      const group = new Group('group-1', 'Housing');
      await repository.save(group);

      // Act
      const exists = await repository.existsByName('Transport');

      // Assert
      expect(exists).toBe(false);
    });

    test('should return false when no groups exist', async () => {
      // Act
      const exists = await repository.existsByName('Housing');

      // Assert
      expect(exists).toBe(false);
    });

    test('should be case sensitive', async () => {
      // Arrange
      const group = new Group('group-1', 'Housing');
      await repository.save(group);

      // Act
      const existsLower = await repository.existsByName('housing');
      const existsUpper = await repository.existsByName('HOUSING');

      // Assert
      expect(existsLower).toBe(false);
      expect(existsUpper).toBe(false);
    });
  });

  describe('database constraints', () => {
    test('should enforce unique name constraint', async () => {
      // Arrange
      const group1 = new Group('group-1', 'Housing');
      await repository.save(group1);

      // Act & Assert - duplicate name should fail
      const group2 = new Group('group-2', 'Housing');
      await expect(repository.save(group2)).rejects.toThrow();
    });

    test('should allow same name after deletion', async () => {
      // Arrange
      const group1 = new Group('group-1', 'Housing');
      await repository.save(group1);
      await repository.delete('group-1');

      // Act - should not throw
      const group2 = new Group('group-2', 'Housing');
      await repository.save(group2);

      // Assert
      const found = await repository.findById('group-2');
      expect(found?.name).toBe('Housing');
    });
  });
});
