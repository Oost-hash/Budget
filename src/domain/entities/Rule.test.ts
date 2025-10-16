import { describe, test, expect } from 'vitest';
import { Rule } from './Rule';

describe('Rule', () => {
  test('should create a rule with required fields', () => {
    // Arrange
    const id = '111';
    const payeeId = '789';
    const categoryId = '456';
    const amount = null;
    const descriptionTemplate = null;
    const isRecurring = false;
    const frequency = null;
    const isActive = true;
    const now = new Date();

    // Act
    const rule = new Rule(
      id,
      payeeId,
      categoryId,
      amount,
      descriptionTemplate,
      isRecurring,
      frequency,
      isActive,
      now,
      now
    );

    // Assert
    expect(rule.id).toBe(id);
    expect(rule.payeeId).toBe(payeeId);
    expect(rule.categoryId).toBe(categoryId);
    expect(rule.amount).toBeNull();
    expect(rule.descriptionTemplate).toBeNull();
    expect(rule.isRecurring).toBe(false);
    expect(rule.frequency).toBeNull();
    expect(rule.isActive).toBe(true);
  });

  test('should create a recurring rule with frequency', () => {
    // Arrange
    const id = '111';
    const payeeId = '789';
    const now = new Date();

    // Act
    const rule = new Rule(
      id,
      payeeId,
      null,
      12.99,
      'Netflix subscription',
      true,
      'monthly',
      true,
      now,
      now
    );

    // Assert
    expect(rule.isRecurring).toBe(true);
    expect(rule.frequency).toBe('monthly');
    expect(rule.amount).toBe(12.99);
  });

  test('should throw error when payeeId is empty', () => {
    // Arrange
    const id = '111';
    const emptyPayeeId = '';
    const now = new Date();

    // Act & Assert
    expect(() => {
      new Rule(id, emptyPayeeId, null, null, null, false, null, true, now, now);
    }).toThrow('Payee ID cannot be empty');
  });

  test('should throw error when frequency is set but isRecurring is false', () => {
    // Arrange
    const id = '111';
    const payeeId = '789';
    const now = new Date();

    // Act & Assert
    expect(() => {
      new Rule(id, payeeId, null, null, null, false, 'monthly', true, now, now);
    }).toThrow('Frequency can only be set when isRecurring is true');
  });

  test('should throw error when frequency is invalid', () => {
    // Arrange
    const id = '111';
    const payeeId = '789';
    const now = new Date();

    // Act & Assert
    expect(() => {
      new Rule(id, payeeId, null, null, null, true, 'daily' as any, true, now, now);
    }).toThrow('Frequency must be monthly, weekly, or yearly');
  });

  test('should set category', () => {
    // Arrange
    const rule = new Rule('111', '789', null, null, null, false, null, true, new Date(), new Date());
    const originalUpdatedAt = rule.updatedAt;

    // Act
    rule.setCategory('456');

    // Assert
    expect(rule.categoryId).toBe('456');
    expect(rule.updatedAt).not.toBe(originalUpdatedAt);
  });

  test('should clear category', () => {
    // Arrange
    const rule = new Rule('111', '789', '456', null, null, false, null, true, new Date(), new Date());

    // Act
    rule.clearCategory();

    // Assert
    expect(rule.categoryId).toBeNull();
  });

  test('should set amount', () => {
    // Arrange
    const rule = new Rule('111', '789', null, null, null, false, null, true, new Date(), new Date());
    const originalUpdatedAt = rule.updatedAt;

    // Act
    rule.setAmount(50.00);

    // Assert
    expect(rule.amount).toBe(50.00);
    expect(rule.updatedAt).not.toBe(originalUpdatedAt);
  });

  test('should set description template', () => {
    // Arrange
    const rule = new Rule('111', '789', null, null, null, false, null, true, new Date(), new Date());

    // Act
    rule.setDescriptionTemplate('Payment to {{payee}}');

    // Assert
    expect(rule.descriptionTemplate).toBe('Payment to {{payee}}');
  });

  test('should activate rule', () => {
    // Arrange
    const rule = new Rule('111', '789', null, null, null, false, null, false, new Date(), new Date());
    const originalUpdatedAt = rule.updatedAt;

    // Act
    rule.activate();

    // Assert
    expect(rule.isActive).toBe(true);
    expect(rule.updatedAt).not.toBe(originalUpdatedAt);
  });

  test('should deactivate rule', () => {
    // Arrange
    const rule = new Rule('111', '789', null, null, null, false, null, true, new Date(), new Date());

    // Act
    rule.deactivate();

    // Assert
    expect(rule.isActive).toBe(false);
  });

  test('should set recurring with frequency', () => {
    // Arrange
    const rule = new Rule('111', '789', null, null, null, false, null, true, new Date(), new Date());
    const originalUpdatedAt = rule.updatedAt;

    // Act
    rule.setRecurring(true, 'weekly');

    // Assert
    expect(rule.isRecurring).toBe(true);
    expect(rule.frequency).toBe('weekly');
    expect(rule.updatedAt).not.toBe(originalUpdatedAt);
  });

  test('should clear recurring', () => {
    // Arrange
    const rule = new Rule('111', '789', null, null, null, true, 'monthly', true, new Date(), new Date());

    // Act
    rule.setRecurring(false, null);

    // Assert
    expect(rule.isRecurring).toBe(false);
    expect(rule.frequency).toBeNull();
  });

  test('should throw error when setting recurring to true without frequency', () => {
    // Arrange
    const rule = new Rule('111', '789', null, null, null, false, null, true, new Date(), new Date());

    // Act & Assert
    expect(() => {
      rule.setRecurring(true, null);
    }).toThrow('Frequency is required when isRecurring is true');
  });
});