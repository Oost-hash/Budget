import { describe, test, expect, vi, beforeEach } from 'vitest';
import { CreateRule } from './CreateRule';
import { GetAllRules } from './GetAllRules';
import { GetRule } from './GetRule';
import { GetRulesByPayee } from './GetRulesByPayee';
import { GetRecurringRules } from './GetRecurringRules';
import { UpdateRule } from './UpdateRule';
import { DeleteRule } from './DeleteRule';
import { IRuleRepository } from '@domain/repositories/IRuleRepository';
import { IPayeeRepository } from '@domain/repositories/IPayeeRepository';
import { ICategoryRepository } from '@domain/repositories/ICategoryRepository';
import { Rule } from '@domain/entities/Rule';
import { Payee } from '@domain/entities/Payee';
import { Category } from '@domain/entities/Category';
import { Frequency } from '@domain/value-objects/Frequency';

describe('Rule Use Cases', () => {
  let mockRuleRepo: IRuleRepository;
  let mockPayeeRepo: IPayeeRepository;
  let mockCategoryRepo: ICategoryRepository;

  beforeEach(() => {
    // Fresh mock repositories for each test
    mockRuleRepo = {
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn(),
      findByPayeeId: vi.fn(),
      findActiveByPayeeId: vi.fn(),
      findRecurring: vi.fn(),
      exists: vi.fn(),
    };

    mockPayeeRepo = {
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn(),
      existsByName: vi.fn(),
      existsByIban: vi.fn(),
      findByIban: vi.fn(),
    };

    mockCategoryRepo = {
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

  describe('CreateRule', () => {
    test('should create a simple rule', async () => {
      // Arrange
      const payee = new Payee('payee-1', 'Albert Heijn', null);
      mockPayeeRepo.findById = vi.fn().mockResolvedValue(payee);
      const useCase = new CreateRule(mockRuleRepo, mockPayeeRepo, mockCategoryRepo);

      // Act
      const result = await useCase.execute({
        payee_id: 'payee-1',
      });

      // Assert
      expect(result.payee_id).toBe('payee-1');
      expect(result.category_id).toBeNull();
      expect(result.amount).toBeNull();
      expect(result.is_recurring).toBe(false);
      expect(result.is_active).toBe(true);
      expect(result.id).toBeDefined();
      expect(mockRuleRepo.save).toHaveBeenCalledOnce();
    });

    test('should create a rule with amount', async () => {
      // Arrange
      const payee = new Payee('payee-1', 'Netflix', null);
      mockPayeeRepo.findById = vi.fn().mockResolvedValue(payee);
      const useCase = new CreateRule(mockRuleRepo, mockPayeeRepo, mockCategoryRepo);

      // Act
      const result = await useCase.execute({
        payee_id: 'payee-1',
        amount: 12.99,
        currency: 'EUR',
        description_template: 'Netflix subscription',
      });

      // Assert
      expect(result.amount).toBe(12.99);
      expect(result.currency).toBe('EUR');
      expect(result.description_template).toBe('Netflix subscription');
    });

    test('should create a recurring rule with frequency', async () => {
      // Arrange
      const payee = new Payee('payee-1', 'Landlord', null);
      mockPayeeRepo.findById = vi.fn().mockResolvedValue(payee);
      const useCase = new CreateRule(mockRuleRepo, mockPayeeRepo, mockCategoryRepo);

      // Act
      const result = await useCase.execute({
        payee_id: 'payee-1',
        is_recurring: true,
        frequency: 'monthly',
      });

      // Assert
      expect(result.is_recurring).toBe(true);
      expect(result.frequency).toBe('monthly');
    });

    test('should create rule with category', async () => {
      // Arrange
      const payee = new Payee('payee-1', 'Albert Heijn', null);
      const category = new Category('cat-1', 'Groceries', null, 1);
      mockPayeeRepo.findById = vi.fn().mockResolvedValue(payee);
      mockCategoryRepo.findById = vi.fn().mockResolvedValue(category);
      const useCase = new CreateRule(mockRuleRepo, mockPayeeRepo, mockCategoryRepo);

      // Act
      const result = await useCase.execute({
        payee_id: 'payee-1',
        category_id: 'cat-1',
      });

      // Assert
      expect(result.category_id).toBe('cat-1');
    });

    test('should throw error if payee does not exist', async () => {
      // Arrange
      mockPayeeRepo.findById = vi.fn().mockResolvedValue(null);
      const useCase = new CreateRule(mockRuleRepo, mockPayeeRepo, mockCategoryRepo);

      // Act & Assert
      await expect(
        useCase.execute({ payee_id: 'non-existent' })
      ).rejects.toThrow('Payee not found');

      expect(mockRuleRepo.save).not.toHaveBeenCalled();
    });

    test('should throw error if category does not exist', async () => {
      // Arrange
      const payee = new Payee('payee-1', 'Albert Heijn', null);
      mockPayeeRepo.findById = vi.fn().mockResolvedValue(payee);
      mockCategoryRepo.findById = vi.fn().mockResolvedValue(null);
      const useCase = new CreateRule(mockRuleRepo, mockPayeeRepo, mockCategoryRepo);

      // Act & Assert
      await expect(
        useCase.execute({ 
          payee_id: 'payee-1',
          category_id: 'non-existent'
        })
      ).rejects.toThrow('Category not found');

      expect(mockRuleRepo.save).not.toHaveBeenCalled();
    });

    test('should throw error if recurring rule has no frequency', async () => {
      // Arrange
      const payee = new Payee('payee-1', 'Test', null);
      mockPayeeRepo.findById = vi.fn().mockResolvedValue(payee);
      const useCase = new CreateRule(mockRuleRepo, mockPayeeRepo, mockCategoryRepo);

      // Act & Assert
      await expect(
        useCase.execute({ 
          payee_id: 'payee-1',
          is_recurring: true
        })
      ).rejects.toThrow('Frequency is required when isRecurring is true');

      expect(mockRuleRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('GetAllRules', () => {
    test('should return all rules', async () => {
      // Arrange
      const rules = [
        new Rule('rule-1', 'payee-1', null, null, null, false, null, true),
        new Rule('rule-2', 'payee-2', null, null, null, false, null, true),
      ];
      mockRuleRepo.findAll = vi.fn().mockResolvedValue(rules);
      const useCase = new GetAllRules(mockRuleRepo);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe('rule-1');
      expect(result[1]?.id).toBe('rule-2');
    });

    test('should return empty array when no rules exist', async () => {
      // Arrange
      mockRuleRepo.findAll = vi.fn().mockResolvedValue([]);
      const useCase = new GetAllRules(mockRuleRepo);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('GetRule', () => {
    test('should return a rule by id', async () => {
      // Arrange
      const rule = new Rule('rule-1', 'payee-1', null, null, null, false, null, true);
      mockRuleRepo.findById = vi.fn().mockResolvedValue(rule);
      const useCase = new GetRule(mockRuleRepo);

      // Act
      const result = await useCase.execute({ id: 'rule-1' });

      // Assert
      expect(result.id).toBe('rule-1');
      expect(result.payee_id).toBe('payee-1');
    });

    test('should throw error if rule not found', async () => {
      // Arrange
      mockRuleRepo.findById = vi.fn().mockResolvedValue(null);
      const useCase = new GetRule(mockRuleRepo);

      // Act & Assert
      await expect(
        useCase.execute({ id: 'non-existent' })
      ).rejects.toThrow('Rule not found');
    });
  });

  describe('GetRulesByPayee', () => {
    test('should return all rules for a payee', async () => {
      // Arrange
      const rules = [
        new Rule('rule-1', 'payee-1', null, null, null, false, null, true),
        new Rule('rule-2', 'payee-1', null, null, null, false, null, false),
      ];
      mockRuleRepo.findByPayeeId = vi.fn().mockResolvedValue(rules);
      const useCase = new GetRulesByPayee(mockRuleRepo);

      // Act
      const result = await useCase.execute({ payee_id: 'payee-1' });

      // Assert
      expect(result).toHaveLength(2);
      expect(mockRuleRepo.findByPayeeId).toHaveBeenCalledWith('payee-1');
    });

    test('should return only active rules when active_only is true', async () => {
      // Arrange
      const rules = [
        new Rule('rule-1', 'payee-1', null, null, null, false, null, true),
      ];
      mockRuleRepo.findActiveByPayeeId = vi.fn().mockResolvedValue(rules);
      const useCase = new GetRulesByPayee(mockRuleRepo);

      // Act
      const result = await useCase.execute({ 
        payee_id: 'payee-1',
        active_only: true
      });

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]?.is_active).toBe(true);
      expect(mockRuleRepo.findActiveByPayeeId).toHaveBeenCalledWith('payee-1');
    });
  });

  describe('GetRecurringRules', () => {
    test('should return all recurring rules', async () => {
      // Arrange
      const frequency = Frequency.monthly();
      const rules = [
        new Rule('rule-1', 'payee-1', null, null, null, true, frequency, true),
        new Rule('rule-2', 'payee-2', null, null, null, true, frequency, true),
      ];
      mockRuleRepo.findRecurring = vi.fn().mockResolvedValue(rules);
      const useCase = new GetRecurringRules(mockRuleRepo);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every(r => r.is_recurring && r.is_active)).toBe(true);
    });
  });

  describe('UpdateRule', () => {
    test('should update rule category', async () => {
      // Arrange
      const rule = new Rule('rule-1', 'payee-1', null, null, null, false, null, true);
      const category = new Category('cat-1', 'Groceries', null, 1);
      mockRuleRepo.findById = vi.fn().mockResolvedValue(rule);
      mockCategoryRepo.findById = vi.fn().mockResolvedValue(category);
      const useCase = new UpdateRule(mockRuleRepo, mockCategoryRepo);

      // Act
      const result = await useCase.execute({
        id: 'rule-1',
        category_id: 'cat-1',
      });

      // Assert
      expect(result.category_id).toBe('cat-1');
      expect(mockRuleRepo.save).toHaveBeenCalled();
    });

    test('should update rule amount', async () => {
      // Arrange
      const rule = new Rule('rule-1', 'payee-1', null, null, null, false, null, true);
      mockRuleRepo.findById = vi.fn().mockResolvedValue(rule);
      const useCase = new UpdateRule(mockRuleRepo, mockCategoryRepo);

      // Act
      const result = await useCase.execute({
        id: 'rule-1',
        amount: 99.99,
        currency: 'EUR',
      });

      // Assert
      expect(result.amount).toBe(99.99);
    });

    test('should update rule to recurring with frequency', async () => {
      // Arrange
      const rule = new Rule('rule-1', 'payee-1', null, null, null, false, null, true);
      mockRuleRepo.findById = vi.fn().mockResolvedValue(rule);
      const useCase = new UpdateRule(mockRuleRepo, mockCategoryRepo);

      // Act
      const result = await useCase.execute({
        id: 'rule-1',
        is_recurring: true,
        frequency: 'monthly',
      });

      // Assert
      expect(result.is_recurring).toBe(true);
      expect(result.frequency).toBe('monthly');
    });

    test('should deactivate rule', async () => {
      // Arrange
      const rule = new Rule('rule-1', 'payee-1', null, null, null, false, null, true);
      mockRuleRepo.findById = vi.fn().mockResolvedValue(rule);
      const useCase = new UpdateRule(mockRuleRepo, mockCategoryRepo);

      // Act
      const result = await useCase.execute({
        id: 'rule-1',
        is_active: false,
      });

      // Assert
      expect(result.is_active).toBe(false);
    });

    test('should clear category', async () => {
      // Arrange
      const rule = new Rule('rule-1', 'payee-1', 'cat-1', null, null, false, null, true);
      mockRuleRepo.findById = vi.fn().mockResolvedValue(rule);
      const useCase = new UpdateRule(mockRuleRepo, mockCategoryRepo);

      // Act
      const result = await useCase.execute({
        id: 'rule-1',
        category_id: null,
      });

      // Assert
      expect(result.category_id).toBeNull();
    });

    test('should throw error if rule not found', async () => {
      // Arrange
      mockRuleRepo.findById = vi.fn().mockResolvedValue(null);
      const useCase = new UpdateRule(mockRuleRepo, mockCategoryRepo);

      // Act & Assert
      await expect(
        useCase.execute({ id: 'non-existent', is_active: false })
      ).rejects.toThrow('Rule not found');

      expect(mockRuleRepo.save).not.toHaveBeenCalled();
    });

    test('should throw error if category does not exist', async () => {
      // Arrange
      const rule = new Rule('rule-1', 'payee-1', null, null, null, false, null, true);
      mockRuleRepo.findById = vi.fn().mockResolvedValue(rule);
      mockCategoryRepo.findById = vi.fn().mockResolvedValue(null);
      const useCase = new UpdateRule(mockRuleRepo, mockCategoryRepo);

      // Act & Assert
      await expect(
        useCase.execute({ 
          id: 'rule-1',
          category_id: 'non-existent'
        })
      ).rejects.toThrow('Category not found');

      expect(mockRuleRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('DeleteRule', () => {
    test('should delete a rule', async () => {
      // Arrange
      const rule = new Rule('rule-1', 'payee-1', null, null, null, false, null, true);
      mockRuleRepo.findById = vi.fn().mockResolvedValue(rule);
      const useCase = new DeleteRule(mockRuleRepo);

      // Act
      await useCase.execute({ id: 'rule-1' });

      // Assert
      expect(mockRuleRepo.delete).toHaveBeenCalledWith('rule-1');
    });

    test('should throw error if rule not found', async () => {
      // Arrange
      mockRuleRepo.findById = vi.fn().mockResolvedValue(null);
      const useCase = new DeleteRule(mockRuleRepo);

      // Act & Assert
      await expect(
        useCase.execute({ id: 'non-existent' })
      ).rejects.toThrow('Rule not found');

      expect(mockRuleRepo.delete).not.toHaveBeenCalled();
    });
  });
});