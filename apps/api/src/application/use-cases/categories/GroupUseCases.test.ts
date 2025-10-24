import { describe, test, expect, vi, beforeEach } from 'vitest';
import { CreateGroup } from './CreateGroup';
import { GetAllGroups } from './GetAllGroups';
import { GetGroup } from './GetGroup';
import { UpdateGroup } from './UpdateGroup';
import { DeleteGroup } from './DeleteGroup';
import { IGroupRepository } from '@domain/repositories/IGroupRepository';
import { Group } from '@domain/entities/Group';

describe('Group Use Cases', () => {
  let mockRepo: IGroupRepository;

  beforeEach(() => {
    // Fresh mock repository for each test
    mockRepo = {
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn(),
      existsByName: vi.fn(),
    };
  });

  describe('CreateGroup', () => {
    test('should create group successfully', async () => {
      // Arrange
      mockRepo.existsByName = vi.fn().mockResolvedValue(false);
      const useCase = new CreateGroup(mockRepo);

      // Act
      const result = await useCase.execute({ name: 'Housing' });

      // Assert
      expect(result.name).toBe('Housing');
      expect(result.id).toBeDefined();
      expect(mockRepo.existsByName).toHaveBeenCalledWith('Housing');
      expect(mockRepo.save).toHaveBeenCalledOnce();
    });

    test('should throw error when name already exists', async () => {
      // Arrange
      mockRepo.existsByName = vi.fn().mockResolvedValue(true);
      const useCase = new CreateGroup(mockRepo);

      // Act & Assert
      await expect(
        useCase.execute({ name: 'Housing' })
      ).rejects.toThrow('Group name already exists');

      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    test('should throw error when name is empty', async () => {
      // Arrange
      mockRepo.existsByName = vi.fn().mockResolvedValue(false);
      const useCase = new CreateGroup(mockRepo);

      // Act & Assert
      await expect(
        useCase.execute({ name: '' })
      ).rejects.toThrow('Group name cannot be empty');

      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    test('should generate unique ID for each group', async () => {
      // Arrange
      mockRepo.existsByName = vi.fn().mockResolvedValue(false);
      const useCase = new CreateGroup(mockRepo);

      // Act
      const result1 = await useCase.execute({ name: 'Housing' });
      const result2 = await useCase.execute({ name: 'Transport' });

      // Assert
      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe('GetAllGroups', () => {
    test('should return all groups as DTOs', async () => {
      // Arrange
      const groups = [
        new Group('1', 'Housing'),
        new Group('2', 'Transport'),
        new Group('3', 'Food'),
      ];
      mockRepo.findAll = vi.fn().mockResolvedValue(groups);
      const useCase = new GetAllGroups(mockRepo);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]?.name).toBe('Housing');
      expect(result[1]?.name).toBe('Transport');
      expect(result[2]?.name).toBe('Food');
      expect(mockRepo.findAll).toHaveBeenCalledOnce();
    });

    test('should return empty array when no groups exist', async () => {
      // Arrange
      mockRepo.findAll = vi.fn().mockResolvedValue([]);
      const useCase = new GetAllGroups(mockRepo);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([]);
      expect(mockRepo.findAll).toHaveBeenCalledOnce();
    });
  });

  describe('GetGroup', () => {
    test('should return group by ID', async () => {
      // Arrange
      const group = new Group('123', 'Housing');
      mockRepo.findById = vi.fn().mockResolvedValue(group);
      const useCase = new GetGroup(mockRepo);

      // Act
      const result = await useCase.execute({ id: '123' });

      // Assert
      expect(result.id).toBe('123');
      expect(result.name).toBe('Housing');
      expect(mockRepo.findById).toHaveBeenCalledWith('123');
    });

    test('should throw error when group not found', async () => {
      // Arrange
      mockRepo.findById = vi.fn().mockResolvedValue(null);
      const useCase = new GetGroup(mockRepo);

      // Act & Assert
      await expect(
        useCase.execute({ id: 'non-existent' })
      ).rejects.toThrow('Group not found');
    });
  });

  describe('UpdateGroup', () => {
    test('should update group name successfully', async () => {
      // Arrange
      const group = new Group('123', 'Housing');
      mockRepo.findById = vi.fn().mockResolvedValue(group);
      mockRepo.existsByName = vi.fn().mockResolvedValue(false);
      const useCase = new UpdateGroup(mockRepo);

      // Act
      const result = await useCase.execute({
        id: '123',
        name: 'Living Expenses'
      });

      // Assert
      expect(result.name).toBe('Living Expenses');
      expect(mockRepo.save).toHaveBeenCalledOnce();
    });

    test('should throw error when group not found', async () => {
      // Arrange
      mockRepo.findById = vi.fn().mockResolvedValue(null);
      const useCase = new UpdateGroup(mockRepo);

      // Act & Assert
      await expect(
        useCase.execute({ id: 'non-existent', name: 'New Name' })
      ).rejects.toThrow('Group not found');

      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    test('should throw error when new name already exists', async () => {
      // Arrange
      const group = new Group('123', 'Housing');
      mockRepo.findById = vi.fn().mockResolvedValue(group);
      mockRepo.existsByName = vi.fn().mockResolvedValue(true);
      const useCase = new UpdateGroup(mockRepo);

      // Act & Assert
      await expect(
        useCase.execute({ id: '123', name: 'Transport' })
      ).rejects.toThrow('Group name already exists');

      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    test('should allow updating to same name', async () => {
      // Arrange
      const group = new Group('123', 'Housing');
      mockRepo.findById = vi.fn().mockResolvedValue(group);
      mockRepo.existsByName = vi.fn().mockResolvedValue(true);
      const useCase = new UpdateGroup(mockRepo);

      // Act
      const result = await useCase.execute({
        id: '123',
        name: 'Housing' // Same name
      });

      // Assert
      expect(result.name).toBe('Housing');
      expect(mockRepo.save).toHaveBeenCalledOnce();
    });

    test('should throw error when new name is empty', async () => {
      // Arrange
      const group = new Group('123', 'Housing');
      mockRepo.findById = vi.fn().mockResolvedValue(group);
      const useCase = new UpdateGroup(mockRepo);

      // Act & Assert
      await expect(
        useCase.execute({ id: '123', name: '' })
      ).rejects.toThrow('Group name cannot be empty');

      expect(mockRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('DeleteGroup', () => {
    test('should delete group successfully', async () => {
      // Arrange
      const group = new Group('123', 'Housing');
      mockRepo.findById = vi.fn().mockResolvedValue(group);
      const useCase = new DeleteGroup(mockRepo);

      // Act
      await useCase.execute({ id: '123' });

      // Assert
      expect(mockRepo.findById).toHaveBeenCalledWith('123');
      expect(mockRepo.delete).toHaveBeenCalledWith('123');
    });

    test('should throw error when group not found', async () => {
      // Arrange
      mockRepo.findById = vi.fn().mockResolvedValue(null);
      const useCase = new DeleteGroup(mockRepo);

      // Act & Assert
      await expect(
        useCase.execute({ id: 'non-existent' })
      ).rejects.toThrow('Group not found');

      expect(mockRepo.delete).not.toHaveBeenCalled();
    });

    test('should not return any value', async () => {
      // Arrange
      const group = new Group('123', 'Housing');
      mockRepo.findById = vi.fn().mockResolvedValue(group);
      const useCase = new DeleteGroup(mockRepo);

      // Act
      const result = await useCase.execute({ id: '123' });

      // Assert
      expect(result).toBeUndefined();
    });
  });
});