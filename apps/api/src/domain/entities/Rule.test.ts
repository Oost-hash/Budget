import { describe, test, expect } from 'vitest';
import { Rule } from './Rule';
import { Money } from '@domain/value-objects/Money';
import { Frequency } from '@domain/value-objects/Frequency';

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

  test('should create a recurring rule with frequency and amount', () => {
    // Arrange
    const id = '111';
    const payeeId = '789';
    const amount = Money.fromAmount(12.99);
    const frequency = Frequency.monthly();

    // Act
    const rule = new Rule(
      id,
      payeeId,
      null,
      amount,
      'Netflix subscription',
      true,
      frequency,
      true,
    );

    // Assert
    expect(rule.isRecurring).toBe(true);
    expect(rule.frequency?.getType()).toBe('monthly');
    expect(rule.amount?.amount).toBe(12.99);
    expect(rule.amount?.currency).toBe('EUR');
  });

  test('should throw error when payeeId is empty', () => {
    // Arrange
    const id = '111';
    const emptyPayeeId = '';

    // Act & Assert
    expect(() => {
      new Rule(id, emptyPayeeId, null, null, null, false, null, true);
    }).toThrow('Payee ID cannot be empty');
  });

  test('should throw error when frequency is set but isRecurring is false', () => {
    // Arrange
    const id = '111';
    const payeeId = '789';
    const frequency = Frequency.monthly();

    // Act & Assert
    expect(() => {
      new Rule(id, payeeId, null, null, null, false, frequency, true);
    }).toThrow('Frequency can only be set when isRecurring is true');
  });

  test('should throw error when isRecurring is true but frequency is null', () => {
    // Arrange
    const id = '111';
    const payeeId = '789';

    // Act & Assert
    expect(() => {
      new Rule(id, payeeId, null, null, null, true, null, true);
    }).toThrow('Frequency is required when isRecurring is true');
  });

  test('should set category', () => {
    // Arrange
    const rule = new Rule('111', '789', null, null, null, false, null, true);

    // Act
    rule.setCategory('456');

    // Assert
    expect(rule.categoryId).toBe('456');
  });

  test('should clear category', () => {
    // Arrange
    const rule = new Rule('111', '789', '456', null, null, false, null, true);

    // Act
    rule.clearCategory();

    // Assert
    expect(rule.categoryId).toBeNull();
  });

  test('should set amount', () => {
    // Arrange
    const rule = new Rule('111', '789', null, null, null, false, null, true);
    const amount = Money.fromAmount(50.00);

    // Act
    rule.setAmount(amount);

    // Assert
    expect(rule.amount?.amount).toBe(50.00);
    expect(rule.amount?.currency).toBe('EUR');
  });

  test('should clear amount by setting it to null', () => {
    // Arrange
    const rule = new Rule(
      '111',
      '789',
      null,
      Money.fromAmount(50),
      null,
      false,
      null,
      true
    );

    // Act
    rule.setAmount(null);

    // Assert
    expect(rule.amount).toBeNull();
  });

  test('should set description template', () => {
    // Arrange
    const rule = new Rule('111', '789', null, null, null, false, null, true);

    // Act
    rule.setDescriptionTemplate('Payment to {{payee}}');

    // Assert
    expect(rule.descriptionTemplate).toBe('Payment to {{payee}}');
  });

  test('should activate rule', () => {
    // Arrange
    const rule = new Rule('111', '789', null, null, null, false, null, false);

    // Act
    rule.activate();

    // Assert
    expect(rule.isActive).toBe(true);
  });

  test('should deactivate rule', () => {
    // Arrange
    const rule = new Rule('111', '789', null, null, null, false, null, true);

    // Act
    rule.deactivate();

    // Assert
    expect(rule.isActive).toBe(false);
  });

  test('should set recurring with frequency', () => {
    // Arrange
    const rule = new Rule('111', '789', null, null, null, false, null, true);
    const frequency = Frequency.weekly();

    // Act
    rule.setRecurring(true, frequency);

    // Assert
    expect(rule.isRecurring).toBe(true);
    expect(rule.frequency?.getType()).toBe('weekly');
  });

  test('should clear recurring', () => {
    // Arrange
    const frequency = Frequency.monthly();
    const rule = new Rule('111', '789', null, null, null, true, frequency, true);

    // Act
    rule.setRecurring(false, null);

    // Assert
    expect(rule.isRecurring).toBe(false);
    expect(rule.frequency).toBeNull();
  });

  test('should throw error when setting recurring to true without frequency', () => {
    // Arrange
    const rule = new Rule('111', '789', null, null, null, false, null, true);

    // Act & Assert
    expect(() => {
      rule.setRecurring(true, null);
    }).toThrow('Frequency is required when isRecurring is true');
  });

  test('should support different currencies for amount', () => {
    // Arrange
    const amount = Money.fromAmount(99.99, 'USD');
    const frequency = Frequency.monthly();

    // Act
    const rule = new Rule(
      '111',
      '789',
      null,
      amount,
      'Monthly subscription',
      true,
      frequency,
      true
    );

    // Assert
    expect(rule.amount?.currency).toBe('USD');
    expect(rule.amount?.amount).toBe(99.99);
  });

  test('should support weekly frequency', () => {
    // Arrange
    const frequency = Frequency.weekly();

    // Act
    const rule = new Rule(
      '111',
      '789',
      null,
      null,
      null,
      true,
      frequency,
      true
    );

    // Assert
    expect(rule.frequency?.getType()).toBe('weekly');
  });

  test('should support yearly frequency', () => {
    // Arrange
    const frequency = Frequency.yearly();

    // Act
    const rule = new Rule(
      '111',
      '789',
      null,
      null,
      null,
      true,
      frequency,
      true
    );

    // Assert
    expect(rule.frequency?.getType()).toBe('yearly');
  });
});