import { describe, test, expect } from 'vitest';
import { Group } from './Group';

describe('Group', () => {
  test('should create a group with valid data', () => {
    // Arrange
    const id = '123';
    const name = 'Housing';

    // Act
    const group = new Group(id, name);

    // Assert
    expect(group.id).toBe(id);
    expect(group.name).toBe(name);
  });

  test('should throw error when name is empty', () => {
    // Arrange
    const id = '123';
    const emptyName = '';

    // Act & Assert
    expect(() => {
      new Group(id, emptyName);
    }).toThrow('Group name cannot be empty');
  });

  test('should rename group with valid name', () => {
    // Arrange
    const id = '123';
    const originalName = 'Housing';
    const group = new Group(id, originalName);

    // Act
    const newName = 'Living Expenses';
    group.rename(newName);

    // Assert
    expect(group.name).toBe(newName);
  });

  test('should not rename group with empty name', () => {
    // Arrange
    const group = new Group('123', 'Housing');

    // Act & Assert
    expect(() => {
      group.rename('');
    }).toThrow('Group name cannot be empty');
  });
});