import { describe, test, expect, vi, beforeEach } from 'vitest';
import { CreateCategory } from './CreateCategory';
import { GetAllCategories } from './GetAllCategories';
import { GetCategory } from './GetCategory';
import { GetCategoriesByGroup } from './GetCategoriesByGroup';
import { UpdateCategory } from './UpdateCategory';
import { MoveCategoryToGroup } from './MoveCategoryToGroup';
import { DeleteCategory } from './DeleteCategory';
import { ICategoryRepository } from '@domain/repositories/ICategoryRepository';
import { Category } from '@domain/entities/Category';

describe('Category Use Cases', () => {
  let mockRepo: ICategoryRepository;

  beforeEach(() => {
    // Fresh mock repository for each test
    mockRepo = {
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn(),
      findByGroupId: vi.fn(),
      findWithoutGroup: vi.fn(),
      existsByNameInGroup: vi.fn(),
      saveMany: vi.fn(),
    };
  });

  describe('CreateCategory', () => {
    test('should create category with group successfully', async () => {
      // Arrange
      mockRepo.existsByNameInGroup = vi.fn().mockResolvedValue(false);
      mockRepo.findByGroupId = vi.fn().mockResolvedValue([]);
      const useCase = new CreateCategory(mockRepo);

      // Act
      const result = await useCase.execute({
        name: 'Groceries',
        groupId: 'group-1'
      });

      // Assert
      expect(result.name).toBe('Groceries');
      expect(result.groupId).toBe('group-1');
      expect(result.position).toBe(1);
      expect(result.id).toBeDefined();
      expect(mockRepo.save).toHaveBeenCalledOnce();
    });

    test('should create category without group', async () => {
      // Arrange
      mockRepo.existsByNameInGroup = vi.fn().mockResolvedValue(false);
      mockRepo.findWithoutGroup = vi.fn().mockResolvedValue([]);
      const useCase = new CreateCategory(mockRepo);

      // Act
      const result = await useCase.execute({
        name: 'Uncategorized',
        groupId: null
      });

      // Assert
      expect(result.groupId).toBeNull();
      expect(result.position).toBe(1);
    });

    test('should set position to end of existing categories in group', async () => {
      // Arrange
      mockRepo.existsByNameInGroup = vi.fn().mockResolvedValue(false);
      mockRepo.findByGroupId = vi.fn().mockResolvedValue([
        new Category('1', 'Cat1', 'group-1', 1),
        new Category('2', 'Cat2', 'group-1', 2),
      ]);
      const useCase = new CreateCategory(mockRepo);

      // Act
      const result = await useCase.execute({
        name: 'Cat3',
        groupId: 'group-1'
      });

      // Assert
      expect(result.position).toBe(3);
    });

    test('should throw error when name already exists in group', async () => {
      // Arrange
      mockRepo.existsByNameInGroup = vi.fn().mockResolvedValue(true);
      const useCase = new CreateCategory(mockRepo);

      // Act & Assert
      await expect(
        useCase.execute({ name: 'Groceries', groupId: 'group-1' })
      ).rejects.toThrow('Category name already exists in this group');

      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    test('should throw error when name is empty', async () => {
      // Arrange
      mockRepo.existsByNameInGroup = vi.fn().mockResolvedValue(false);
      mockRepo.findByGroupId = vi.fn().mockResolvedValue([]);
      const useCase = new CreateCategory(mockRepo);

      // Act & Assert
      await expect(
        useCase.execute({ name: '', groupId: 'group-1' })
      ).rejects.toThrow('Category name cannot be empty');
    });
  });

  describe('GetAllCategories', () => {
    test('should return all categories as DTOs', async () => {
      // Arrange
      const categories = [
        new Category('1', 'Groceries', 'group-1', 1),
        new Category('2', 'Rent', 'group-1', 2),
        new Category('3', 'Transport', null, 1),
      ];
      mockRepo.findAll = vi.fn().mockResolvedValue(categories);
      const useCase = new GetAllCategories(mockRepo);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]?.name).toBe('Groceries');
      expect(result[1]?.name).toBe('Rent');
      expect(result[2]?.name).toBe('Transport');
    });

    test('should return empty array when no categories exist', async () => {
      // Arrange
      mockRepo.findAll = vi.fn().mockResolvedValue([]);
      const useCase = new GetAllCategories(mockRepo);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('GetCategory', () => {
    test('should return category by ID', async () => {
      // Arrange
      const category = new Category('123', 'Groceries', 'group-1', 1);
      mockRepo.findById = vi.fn().mockResolvedValue(category);
      const useCase = new GetCategory(mockRepo);

      // Act
      const result = await useCase.execute({ id: '123' });

      // Assert
      expect(result.id).toBe('123');
      expect(result.name).toBe('Groceries');
      expect(result.groupId).toBe('group-1');
    });

    test('should throw error when category not found', async () => {
      // Arrange
      mockRepo.findById = vi.fn().mockResolvedValue(null);
      const useCase = new GetCategory(mockRepo);

      // Act & Assert
      await expect(
        useCase.execute({ id: 'non-existent' })
      ).rejects.toThrow('Category not found');
    });
  });

  describe('GetCategoriesByGroup', () => {
    test('should return categories for specific group', async () => {
      // Arrange
      const categories = [
        new Category('1', 'Groceries', 'group-1', 1),
        new Category('2', 'Rent', 'group-1', 2),
      ];
      mockRepo.findByGroupId = vi.fn().mockResolvedValue(categories);
      const useCase = new GetCategoriesByGroup(mockRepo);

      // Act
      const result = await useCase.execute({ groupId: 'group-1' });

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]?.groupId).toBe('group-1');
      expect(mockRepo.findByGroupId).toHaveBeenCalledWith('group-1');
    });

    test('should return categories without group when groupId is null', async () => {
      // Arrange
      const categories = [
        new Category('1', 'Uncategorized', null, 1),
      ];
      mockRepo.findWithoutGroup = vi.fn().mockResolvedValue(categories);
      const useCase = new GetCategoriesByGroup(mockRepo);

      // Act
      const result = await useCase.execute({ groupId: null });

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]?.groupId).toBeNull();
      expect(mockRepo.findWithoutGroup).toHaveBeenCalled();
    });

    test('should return empty array when group has no categories', async () => {
      // Arrange
      mockRepo.findByGroupId = vi.fn().mockResolvedValue([]);
      const useCase = new GetCategoriesByGroup(mockRepo);

      // Act
      const result = await useCase.execute({ groupId: 'empty-group' });

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('UpdateCategory', () => {
    test('should update category name', async () => {
      // Arrange
      const category = new Category('123', 'Groceries', 'group-1', 1);
      mockRepo.findById = vi.fn().mockResolvedValue(category);
      mockRepo.existsByNameInGroup = vi.fn().mockResolvedValue(false);
      const useCase = new UpdateCategory(mockRepo);

      // Act
      const result = await useCase.execute({
        id: '123',
        name: 'Food & Drinks'
      });

      // Assert
      expect(result.name).toBe('Food & Drinks');
      expect(mockRepo.save).toHaveBeenCalledOnce();
    });

    test('should update category position', async () => {
      // Arrange
      const category = new Category('123', 'Groceries', 'group-1', 1);
      mockRepo.findById = vi.fn().mockResolvedValue(category);
      const useCase = new UpdateCategory(mockRepo);

      // Act
      const result = await useCase.execute({
        id: '123',
        position: 5
      });

      // Assert
      expect(result.position).toBe(5);
      expect(mockRepo.save).toHaveBeenCalledOnce();
    });

    test('should update both name and position', async () => {
      // Arrange
      const category = new Category('123', 'Groceries', 'group-1', 1);
      mockRepo.findById = vi.fn().mockResolvedValue(category);
      mockRepo.existsByNameInGroup = vi.fn().mockResolvedValue(false);
      const useCase = new UpdateCategory(mockRepo);

      // Act
      const result = await useCase.execute({
        id: '123',
        name: 'Food',
        position: 3
      });

      // Assert
      expect(result.name).toBe('Food');
      expect(result.position).toBe(3);
    });

    test('should throw error when category not found', async () => {
      // Arrange
      mockRepo.findById = vi.fn().mockResolvedValue(null);
      const useCase = new UpdateCategory(mockRepo);

      // Act & Assert
      await expect(
        useCase.execute({ id: 'non-existent', name: 'New Name' })
      ).rejects.toThrow('Category not found');
    });

    test('should throw error when new name already exists in group', async () => {
      // Arrange
      const category = new Category('123', 'Groceries', 'group-1', 1);
      mockRepo.findById = vi.fn().mockResolvedValue(category);
      mockRepo.existsByNameInGroup = vi.fn().mockResolvedValue(true);
      const useCase = new UpdateCategory(mockRepo);

      // Act & Assert
      await expect(
        useCase.execute({ id: '123', name: 'Rent' })
      ).rejects.toThrow('Category name already exists in this group');
    });

    test('should allow updating to same name', async () => {
      // Arrange
      const category = new Category('123', 'Groceries', 'group-1', 1);
      mockRepo.findById = vi.fn().mockResolvedValue(category);
      mockRepo.existsByNameInGroup = vi.fn().mockResolvedValue(true);
      const useCase = new UpdateCategory(mockRepo);

      // Act
      const result = await useCase.execute({
        id: '123',
        name: 'Groceries' // Same name
      });

      // Assert
      expect(result.name).toBe('Groceries');
      expect(mockRepo.save).toHaveBeenCalledOnce();
    });
  });

  describe('MoveCategoryToGroup', () => {
    test('should move category to different group', async () => {
      // Arrange
      const category = new Category('123', 'Groceries', 'group-1', 1);
      mockRepo.findById = vi.fn().mockResolvedValue(category);
      mockRepo.findByGroupId = vi.fn().mockResolvedValue([
        new Category('2', 'Rent', 'group-2', 1),
      ]);
      const useCase = new MoveCategoryToGroup(mockRepo);

      // Act
      const result = await useCase.execute({
        categoryId: '123',
        targetGroupId: 'group-2'
      });

      // Assert
      expect(result.groupId).toBe('group-2');
      expect(result.position).toBe(2); // Added to end
      expect(mockRepo.save).toHaveBeenCalledOnce();
    });

    test('should move category to no group (null)', async () => {
      // Arrange
      const category = new Category('123', 'Groceries', 'group-1', 1);
      mockRepo.findById = vi.fn().mockResolvedValue(category);
      mockRepo.findWithoutGroup = vi.fn().mockResolvedValue([]);
      const useCase = new MoveCategoryToGroup(mockRepo);

      // Act
      const result = await useCase.execute({
        categoryId: '123',
        targetGroupId: null
      });

      // Assert
      expect(result.groupId).toBeNull();
      expect(result.position).toBe(1);
      expect(mockRepo.save).toHaveBeenCalledOnce();
    });

    test('should do nothing when already in target group', async () => {
      // Arrange
      const category = new Category('123', 'Groceries', 'group-1', 1);
      mockRepo.findById = vi.fn().mockResolvedValue(category);
      const useCase = new MoveCategoryToGroup(mockRepo);

      // Act
      const result = await useCase.execute({
        categoryId: '123',
        targetGroupId: 'group-1' // Same group
      });

      // Assert
      expect(result.groupId).toBe('group-1');
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    test('should throw error when category not found', async () => {
      // Arrange
      mockRepo.findById = vi.fn().mockResolvedValue(null);
      const useCase = new MoveCategoryToGroup(mockRepo);

      // Act & Assert
      await expect(
        useCase.execute({ categoryId: 'non-existent', targetGroupId: 'group-2' })
      ).rejects.toThrow('Category not found');
    });

    test('should set position to end of target group', async () => {
      // Arrange
      const category = new Category('123', 'Groceries', 'group-1', 1);
      mockRepo.findById = vi.fn().mockResolvedValue(category);
      mockRepo.findByGroupId = vi.fn().mockResolvedValue([
        new Category('2', 'Cat1', 'group-2', 1),
        new Category('3', 'Cat2', 'group-2', 2),
        new Category('4', 'Cat3', 'group-2', 3),
      ]);
      const useCase = new MoveCategoryToGroup(mockRepo);

      // Act
      const result = await useCase.execute({
        categoryId: '123',
        targetGroupId: 'group-2'
      });

      // Assert
      expect(result.position).toBe(4); // After 3 existing
    });
  });

  describe('DeleteCategory', () => {
    test('should delete category successfully', async () => {
      // Arrange
      const category = new Category('123', 'Groceries', 'group-1', 1);
      mockRepo.findById = vi.fn().mockResolvedValue(category);
      const useCase = new DeleteCategory(mockRepo);

      // Act
      await useCase.execute({ id: '123' });

      // Assert
      expect(mockRepo.delete).toHaveBeenCalledWith('123');
    });

    test('should throw error when category not found', async () => {
      // Arrange
      mockRepo.findById = vi.fn().mockResolvedValue(null);
      const useCase = new DeleteCategory(mockRepo);

      // Act & Assert
      await expect(
        useCase.execute({ id: 'non-existent' })
      ).rejects.toThrow('Category not found');

      expect(mockRepo.delete).not.toHaveBeenCalled();
    });

    test('should not return any value', async () => {
      // Arrange
      const category = new Category('123', 'Groceries', 'group-1', 1);
      mockRepo.findById = vi.fn().mockResolvedValue(category);
      const useCase = new DeleteCategory(mockRepo);

      // Act
      const result = await useCase.execute({ id: '123' });

      // Assert
      expect(result).toBeUndefined();
    });
  });
});