import { describe, test, expect } from 'vitest';
import { Category } from './Category';

describe('Category', () => {
  test('should create a category with valid data and group', () => {
    // Arrange
    const id = '456';
    const name = 'Rent';
    const groupId = '123';
    const position = 1;
    const now = new Date();

    // Act
    const category = new Category(id, name, groupId, position, now, now);

    // Assert
    expect(category.id).toBe(id);
    expect(category.name).toBe(name);
    expect(category.groupId).toBe(groupId);
    expect(category.position).toBe(position);
    expect(category.createdAt).toBe(now);
    expect(category.updatedAt).toBe(now);
  });

  test('should create a category without group (null groupId)', () => {
    // Arrange
    const id = '456';
    const name = 'Uncategorized';
    const groupId = null;
    const position = 1;
    const now = new Date();

    // Act
    const category = new Category(id, name, groupId, position, now, now);

    // Assert
    expect(category.groupId).toBeNull();
  });

  test('should throw error when name is empty', () => {
    // Arrange
    const id = '456';
    const emptyName = '';
    const now = new Date();

    // Act & Assert
    expect(() => {
      new Category(id, emptyName, '123', 1, now, now);
    }).toThrow('Category name cannot be empty');
  });

  test('should rename category with valid name', () => {
    // Arrange
    const category = new Category('456', 'Rent', '123', 1, new Date(), new Date());
    const originalUpdatedAt = category.updatedAt;

    // Act
    const newName = 'Monthly Rent';
    category.rename(newName);

    // Assert
    expect(category.name).toBe(newName);
    expect(category.updatedAt).not.toBe(originalUpdatedAt);
  });

  test('should not rename category with empty name', () => {
    // Arrange
    const category = new Category('456', 'Rent', '123', 1, new Date(), new Date());

    // Act & Assert
    expect(() => {
      category.rename('');
    }).toThrow('Category name cannot be empty');
  });

  test('should change position', () => {
    // Arrange
    const category = new Category('456', 'Rent', '123', 1, new Date(), new Date());
    const originalUpdatedAt = category.updatedAt;

    // Act
    const newPosition = 5;
    category.changePosition(newPosition);

    // Assert
    expect(category.position).toBe(newPosition);
    expect(category.updatedAt).not.toBe(originalUpdatedAt);
  });

  test('should remove category from group', () => {
    // Arrange
    const category = new Category('456', 'Rent', '123', 1, new Date(), new Date());
    const originalUpdatedAt = category.updatedAt;

    // Act
    category.removeFromGroup();

    // Assert
    expect(category.groupId).toBeNull();
    expect(category.updatedAt).not.toBe(originalUpdatedAt);
  });

  test('should assign category to a different group', () => {
    // Arrange
    const category = new Category('456', 'Rent', '123', 1, new Date(), new Date());
    const originalUpdatedAt = category.updatedAt;

    // Act
    const newGroupId = '789';
    category.assignToGroup(newGroupId);

    // Assert
    expect(category.groupId).toBe(newGroupId);
    expect(category.updatedAt).not.toBe(originalUpdatedAt);
  });

  test('should assign category from no group to a group', () => {
    // Arrange
    const category = new Category('456', 'Rent', null, 1, new Date(), new Date());

    // Act
    category.assignToGroup('123');

    // Assert
    expect(category.groupId).toBe('123');
  });
});