import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { DataSource } from 'typeorm';
import { RuleRepository } from './RuleRepository';
import { Rule } from '@domain/entities/Rule';
import { RuleEntity } from '../database/entities/RuleEntity';
import { PayeeEntity } from '../database/entities/PayeeEntity';
import { CategoryEntity } from '../database/entities/CategoryEntity';
import { GroupEntity } from '../database/entities/GroupEntity';
import { Money } from '@domain/value-objects/Money';
import { Frequency } from '@domain/value-objects/Frequency';

describe('RuleRepository', () => {
  let dataSource: DataSource;
  let repository: RuleRepository;

  beforeEach(async () => {
    dataSource = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      synchronize: true,
      logging: false,
      entities: [RuleEntity, PayeeEntity, CategoryEntity, GroupEntity],
    });

    await dataSource.initialize();
    repository = new RuleRepository(dataSource);
  });

  afterEach(async () => {
    await dataSource.destroy();
  });

  describe('save and findById', () => {
    test('should save and retrieve a simple rule', async () => {
      // Arrange - create payee first
      const payeeRepo = dataSource.getRepository(PayeeEntity);
      await payeeRepo.save({
        id: 'payee-1',
        name: 'Albert Heijn',
        iban: null
      });

      const rule = new Rule(
        'rule-1',
        'payee-1',
        null,
        null,
        null,
        false,
        null,
        true
      );

      // Act
      await repository.save(rule);
      const found = await repository.findById('rule-1');

      // Assert
      expect(found).not.toBeNull();
      expect(found?.id).toBe('rule-1');
      expect(found?.payeeId).toBe('payee-1');
      expect(found?.categoryId).toBeNull();
      expect(found?.isActive).toBe(true);
      expect(found?.isRecurring).toBe(false);
    });

    test('should save and retrieve a rule with amount', async () => {
      // Arrange
      const payeeRepo = dataSource.getRepository(PayeeEntity);
      await payeeRepo.save({
        id: 'payee-1',
        name: 'Netflix',
        iban: null
      });

      const amount = Money.fromAmount(12.99);
      const rule = new Rule(
        'rule-1',
        'payee-1',
        null,
        amount,
        'Netflix subscription',
        false,
        null,
        true
      );

      // Act
      await repository.save(rule);
      const found = await repository.findById('rule-1');

      // Assert
      expect(found?.amount?.amount).toBe(12.99);
      expect(found?.amount?.currency).toBe('EUR');
      expect(found?.descriptionTemplate).toBe('Netflix subscription');
    });

    test('should save and retrieve a recurring rule', async () => {
      // Arrange
      const payeeRepo = dataSource.getRepository(PayeeEntity);
      await payeeRepo.save({
        id: 'payee-1',
        name: 'Landlord',
        iban: null
      });

      const amount = Money.fromAmount(1200);
      const frequency = Frequency.monthly();
      const rule = new Rule(
        'rule-1',
        'payee-1',
        null,
        amount,
        'Monthly rent',
        true,
        frequency,
        true
      );

      // Act
      await repository.save(rule);
      const found = await repository.findById('rule-1');

      // Assert
      expect(found?.isRecurring).toBe(true);
      expect(found?.frequency?.toString()).toBe('monthly');
    });

    test('should save rule with category', async () => {
      // Arrange
      const payeeRepo = dataSource.getRepository(PayeeEntity);
      await payeeRepo.save({
        id: 'payee-1',
        name: 'Albert Heijn',
        iban: null
      });

      const categoryRepo = dataSource.getRepository(CategoryEntity);
      await categoryRepo.save({
        id: 'cat-1',
        name: 'Groceries',
        group_id: null,
        position: 1
      });

      const rule = new Rule(
        'rule-1',
        'payee-1',
        'cat-1',
        null,
        null,
        false,
        null,
        true
      );

      // Act
      await repository.save(rule);
      const found = await repository.findById('rule-1');

      // Assert
      expect(found?.categoryId).toBe('cat-1');
    });

    test('should return null for non-existent rule', async () => {
      // Act
      const found = await repository.findById('non-existent');

      // Assert
      expect(found).toBeNull();
    });

    test('should update existing rule', async () => {
      // Arrange
      const payeeRepo = dataSource.getRepository(PayeeEntity);
      await payeeRepo.save({
        id: 'payee-1',
        name: 'Netflix',
        iban: null
      });

      const rule = new Rule('rule-1', 'payee-1', null, null, null, false, null, true);
      await repository.save(rule);

      // Act - deactivate rule
      rule.deactivate();
      await repository.save(rule);

      // Assert
      const found = await repository.findById('rule-1');
      expect(found?.isActive).toBe(false);
    });
  });

  describe('findAll', () => {
    test('should return all rules ordered by created_at DESC', async () => {
      // Arrange
      const payeeRepo = dataSource.getRepository(PayeeEntity);
      await payeeRepo.save({
        id: 'payee-1',
        name: 'Payee 1',
        iban: null
      });

      const ruleEntityRepo = dataSource.getRepository(RuleEntity);
      
      // Create entities directly with different timestamps
      const now = new Date();
      
      await ruleEntityRepo.save({
        id: 'rule-1',
        payee_id: 'payee-1',
        category_id: null,
        amount: null,
        currency: 'EUR',
        description_template: null,
        is_recurring: false,
        frequency: null,
        is_active: true,
        created_at: new Date(now.getTime() - 2000), // 2 seconds ago
      });

      await ruleEntityRepo.save({
        id: 'rule-2',
        payee_id: 'payee-1',
        category_id: null,
        amount: null,
        currency: 'EUR',
        description_template: null,
        is_recurring: false,
        frequency: null,
        is_active: true,
        created_at: new Date(now.getTime() - 1000), // 1 second ago
      });

      await ruleEntityRepo.save({
        id: 'rule-3',
        payee_id: 'payee-1',
        category_id: null,
        amount: null,
        currency: 'EUR',
        description_template: null,
        is_recurring: false,
        frequency: null,
        is_active: true,
        created_at: now, // Most recent
      });

      // Act
      const rules = await repository.findAll();

      // Assert
      expect(rules).toHaveLength(3);
      expect(rules[0]?.id).toBe('rule-3'); // Most recent first
      expect(rules[1]?.id).toBe('rule-2');
      expect(rules[2]?.id).toBe('rule-1');
    });

    test('should return empty array when no rules exist', async () => {
      // Act
      const rules = await repository.findAll();

      // Assert
      expect(rules).toEqual([]);
    });
  });

  describe('findByPayeeId', () => {
    test('should find all rules for a specific payee', async () => {
      // Arrange
      const payeeRepo = dataSource.getRepository(PayeeEntity);
      await payeeRepo.save({ id: 'payee-1', name: 'Payee 1', iban: null });
      await payeeRepo.save({ id: 'payee-2', name: 'Payee 2', iban: null });

      const rule1 = new Rule('rule-1', 'payee-1', null, null, null, false, null, true);
      const rule2 = new Rule('rule-2', 'payee-1', null, null, null, false, null, true);
      const rule3 = new Rule('rule-3', 'payee-2', null, null, null, false, null, true);

      await repository.save(rule1);
      await repository.save(rule2);
      await repository.save(rule3);

      // Act
      const rules = await repository.findByPayeeId('payee-1');

      // Assert
      expect(rules).toHaveLength(2);
      expect(rules.every(r => r.payeeId === 'payee-1')).toBe(true);
    });

    test('should return empty array when payee has no rules', async () => {
      // Act
      const rules = await repository.findByPayeeId('non-existent-payee');

      // Assert
      expect(rules).toEqual([]);
    });
  });

  describe('findActiveByPayeeId', () => {
    test('should find only active rules for a payee', async () => {
      // Arrange
      const payeeRepo = dataSource.getRepository(PayeeEntity);
      await payeeRepo.save({ id: 'payee-1', name: 'Payee 1', iban: null });

      const rule1 = new Rule('rule-1', 'payee-1', null, null, null, false, null, true);
      const rule2 = new Rule('rule-2', 'payee-1', null, null, null, false, null, false);
      const rule3 = new Rule('rule-3', 'payee-1', null, null, null, false, null, true);

      await repository.save(rule1);
      await repository.save(rule2);
      await repository.save(rule3);

      // Act
      const rules = await repository.findActiveByPayeeId('payee-1');

      // Assert
      expect(rules).toHaveLength(2);
      expect(rules.every(r => r.isActive)).toBe(true);
    });
  });

  describe('findRecurring', () => {
    test('should find only active recurring rules', async () => {
      // Arrange
      const payeeRepo = dataSource.getRepository(PayeeEntity);
      await payeeRepo.save({ id: 'payee-1', name: 'Payee 1', iban: null });

      const frequency = Frequency.monthly();
      const rule1 = new Rule('rule-1', 'payee-1', null, null, null, true, frequency, true);
      const rule2 = new Rule('rule-2', 'payee-1', null, null, null, true, frequency, false);
      const rule3 = new Rule('rule-3', 'payee-1', null, null, null, false, null, true);
      const rule4 = new Rule('rule-4', 'payee-1', null, null, null, true, frequency, true);

      await repository.save(rule1);
      await repository.save(rule2);
      await repository.save(rule3);
      await repository.save(rule4);

      // Act
      const rules = await repository.findRecurring();

      // Assert
      expect(rules).toHaveLength(2);
      expect(rules.every(r => r.isRecurring && r.isActive)).toBe(true);
    });
  });

  describe('delete', () => {
    test('should delete a rule', async () => {
      // Arrange
      const payeeRepo = dataSource.getRepository(PayeeEntity);
      await payeeRepo.save({ id: 'payee-1', name: 'Payee 1', iban: null });

      const rule = new Rule('rule-1', 'payee-1', null, null, null, false, null, true);
      await repository.save(rule);

      // Act
      await repository.delete('rule-1');
      const found = await repository.findById('rule-1');

      // Assert
      expect(found).toBeNull();
    });

    test('should not throw error when deleting non-existent rule', async () => {
      // Act & Assert - should not throw
      await expect(repository.delete('non-existent')).resolves.toBeUndefined();
    });
  });

  describe('exists', () => {
    test('should return true for existing rule', async () => {
      // Arrange
      const payeeRepo = dataSource.getRepository(PayeeEntity);
      await payeeRepo.save({ id: 'payee-1', name: 'Payee 1', iban: null });

      const rule = new Rule('rule-1', 'payee-1', null, null, null, false, null, true);
      await repository.save(rule);

      // Act
      const exists = await repository.exists('rule-1');

      // Assert
      expect(exists).toBe(true);
    });

    test('should return false for non-existent rule', async () => {
      // Act
      const exists = await repository.exists('non-existent');

      // Assert
      expect(exists).toBe(false);
    });
  });

  describe('cascade behavior', () => {
    test('should cascade delete rules when payee is deleted', async () => {
      // Arrange
      const payeeRepo = dataSource.getRepository(PayeeEntity);
      await payeeRepo.save({ id: 'payee-1', name: 'Payee 1', iban: null });

      const rule = new Rule('rule-1', 'payee-1', null, null, null, false, null, true);
      await repository.save(rule);

      // Act - delete payee
      await payeeRepo.delete('payee-1');

      // Assert - rule should be deleted
      const found = await repository.findById('rule-1');
      expect(found).toBeNull();
    });

    test('should set category_id to null when category is deleted', async () => {
      // Arrange
      const payeeRepo = dataSource.getRepository(PayeeEntity);
      await payeeRepo.save({ id: 'payee-1', name: 'Payee 1', iban: null });

      const categoryRepo = dataSource.getRepository(CategoryEntity);
      await categoryRepo.save({
        id: 'cat-1',
        name: 'Groceries',
        group_id: null,
        position: 1
      });

      const rule = new Rule('rule-1', 'payee-1', 'cat-1', null, null, false, null, true);
      await repository.save(rule);

      // Act - delete category
      await categoryRepo.delete('cat-1');

      // Assert - rule should exist with null category_id
      const found = await repository.findById('rule-1');
      expect(found).not.toBeNull();
      expect(found?.categoryId).toBeNull();
    });
  });
});