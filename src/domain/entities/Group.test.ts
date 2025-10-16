import { describe, test, expect } from 'vitest';
import { Group } from './Group';

describe('Group', () => {
  test('should create a group with valid data', () => {
    // Arrange
    const id = '123';
    const name = 'Housing';
    const now = new Date();

    // Act
    const group = new Group(id, name, now, now);

    // Assert
    expect(group.id).toBe(id);
    expect(group.name).toBe(name);
    expect(group.createdAt).toBe(now);
    expect(group.updatedAt).toBe(now);
  });

  test('should throw error when name is empty', () => {
    // Arrange
    const id = '123';
    const emptyName = '';
    const now = new Date();

    // Act & Assert
    expect(() => {
      new Group(id, emptyName, now, now);
    }).toThrow('Group name cannot be empty');
  });

  test('should rename group with valid name', () => {
    // Arrange
    const id = '123';
    const originalName = 'Housing';
    const now = new Date();
    const group = new Group(id, originalName, now, now);
    const originalUpdatedAt = group.updatedAt;

    // Act
    const newName = 'Living Expenses';
    group.rename(newName);

    // Assert
    expect(group.name).toBe(newName);
    expect(group.updatedAt).not.toBe(originalUpdatedAt); 
  });

  test('should not rename group with empty name', () => {
    // Arrange
    const group = new Group('123', 'Housing', new Date(), new Date());

    // Act & Assert
    expect(() => {
      group.rename('');
    }).toThrow('Group name cannot be empty');
  });
});