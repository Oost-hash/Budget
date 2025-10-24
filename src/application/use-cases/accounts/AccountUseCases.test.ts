import { describe, test, expect, vi, beforeEach } from 'vitest';
import { CreateAccount } from './CreateAccount';
import { GetAllAccounts } from './GetAllAccounts';
import { GetAccount } from './GetAccount';
import { UpdateAccount } from './UpdateAccount';
import { DeleteAccount } from './DeleteAccount';
import { IAccountRepository } from '@domain/repositories/IAccountRepository';
import { Account } from '@domain/entities/Account';
import { Money } from '@domain/value-objects/Money';
import { ExpectedPaymentDueDate } from '@domain/value-objects/ExpectedPaymentDueDate';

describe('Account Use Cases', () => {
  let mockRepo: IAccountRepository;

  beforeEach(() => {
    mockRepo = {
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn(),
      existsByName: vi.fn(),
      existsByIban: vi.fn(),
    };
  });

  describe('CreateAccount', () => {
    test('should create asset account successfully', async () => {
      // Arrange
      mockRepo.existsByName = vi.fn().mockResolvedValue(false);
      const useCase = new CreateAccount(mockRepo);

      // Act
      const result = await useCase.execute({
        name: 'Checking Account',
        type: 'asset',
        overdraftLimit: { amount: 500 }
      });

      // Assert
      expect(result.name).toBe('Checking Account');
      expect(result.type).toBe('asset');
      expect(result.id).toBeDefined();
      expect(result.overdraftLimit.amount).toBe(500);
      expect(mockRepo.save).toHaveBeenCalledOnce();
    });

    test('should create liability account with payment due date', async () => {
      // Arrange
      mockRepo.existsByName = vi.fn().mockResolvedValue(false);
      const useCase = new CreateAccount(mockRepo);

      // Act
      const result = await useCase.execute({
        name: 'Credit Card',
        type: 'liability',
        creditLimit: { amount: 5000 },
        paymentDueDate: { dayOfMonth: 15, shiftDirection: 'before' }
      });

      // Assert
      expect(result.type).toBe('liability');
      expect(result.creditLimit.amount).toBe(5000);
      expect(result.paymentDueDate?.dayOfMonth).toBe(15);
      expect(result.paymentDueDate?.shiftDirection).toBe('before');
    });

    test('should create account with IBAN', async () => {
      // Arrange
      mockRepo.existsByName = vi.fn().mockResolvedValue(false);
      mockRepo.existsByIban = vi.fn().mockResolvedValue(false);
      const useCase = new CreateAccount(mockRepo);

      // Act
      const result = await useCase.execute({
        name: 'Dutch Account',
        type: 'asset',
        iban: 'NL01BANK0123456789'
      });

      // Assert
      expect(result.iban).toBe('NL01BANK0123456789');
      expect(mockRepo.existsByIban).toHaveBeenCalledWith('NL01BANK0123456789');
    });

    test('should create savings account', async () => {
      // Arrange
      mockRepo.existsByName = vi.fn().mockResolvedValue(false);
      const useCase = new CreateAccount(mockRepo);

      // Act
      const result = await useCase.execute({
        name: 'Savings',
        type: 'asset',
        isSavings: true
      });

      // Assert
      expect(result.isSavings).toBe(true);
    });

    test('should throw error when name already exists', async () => {
      // Arrange
      mockRepo.existsByName = vi.fn().mockResolvedValue(true);
      const useCase = new CreateAccount(mockRepo);

      // Act & Assert
      await expect(
        useCase.execute({ name: 'Checking', type: 'asset' })
      ).rejects.toThrow('Account name already exists');

      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    test('should throw error when IBAN already exists', async () => {
      // Arrange
      mockRepo.existsByName = vi.fn().mockResolvedValue(false);
      mockRepo.existsByIban = vi.fn().mockResolvedValue(true);
      const useCase = new CreateAccount(mockRepo);

      // Act & Assert
      await expect(
        useCase.execute({
          name: 'New Account',
          type: 'asset',
          iban: 'NL01BANK0123456789'
        })
      ).rejects.toThrow('IBAN already exists');

      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    test('should use default values when optional fields not provided', async () => {
      // Arrange
      mockRepo.existsByName = vi.fn().mockResolvedValue(false);
      const useCase = new CreateAccount(mockRepo);

      // Act
      const result = await useCase.execute({
        name: 'Simple Account',
        type: 'asset'
      });

      // Assert
      expect(result.isSavings).toBe(false);
      expect(result.iban).toBeNull();
      expect(result.overdraftLimit.amount).toBe(0);
      expect(result.creditLimit.amount).toBe(0);
      expect(result.paymentDueDate).toBeNull();
    });

    test('should support different currencies', async () => {
      // Arrange
      mockRepo.existsByName = vi.fn().mockResolvedValue(false);
      const useCase = new CreateAccount(mockRepo);

      // Act
      const result = await useCase.execute({
        name: 'USD Account',
        type: 'asset',
        overdraftLimit: { amount: 1000, currency: 'USD' }
      });

      // Assert
      expect(result.overdraftLimit.currency).toBe('USD');
    });
  });

  describe('GetAllAccounts', () => {
    test('should return all accounts as DTOs', async () => {
      // Arrange
      const accounts = [
        new Account('1', 'Checking', 'asset', null, false, Money.fromAmount(500), Money.fromAmount(0), null),
        new Account('2', 'Credit Card', 'liability', null, false, Money.fromAmount(0), Money.fromAmount(5000), null),
        new Account('3', 'Savings', 'asset', null, true, Money.fromAmount(0), Money.fromAmount(0), null),
      ];
      mockRepo.findAll = vi.fn().mockResolvedValue(accounts);
      const useCase = new GetAllAccounts(mockRepo);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]?.name).toBe('Checking');
      expect(result[1]?.name).toBe('Credit Card');
      expect(result[2]?.name).toBe('Savings');
    });

    test('should return empty array when no accounts exist', async () => {
      // Arrange
      mockRepo.findAll = vi.fn().mockResolvedValue([]);
      const useCase = new GetAllAccounts(mockRepo);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('GetAccount', () => {
    test('should return account by ID', async () => {
      // Arrange
      const account = new Account('123', 'Checking', 'asset', null, false, Money.fromAmount(500), Money.fromAmount(0), null);
      mockRepo.findById = vi.fn().mockResolvedValue(account);
      const useCase = new GetAccount(mockRepo);

      // Act
      const result = await useCase.execute({ id: '123' });

      // Assert
      expect(result.id).toBe('123');
      expect(result.name).toBe('Checking');
      expect(result.type).toBe('asset');
    });

    test('should throw error when account not found', async () => {
      // Arrange
      mockRepo.findById = vi.fn().mockResolvedValue(null);
      const useCase = new GetAccount(mockRepo);

      // Act & Assert
      await expect(
        useCase.execute({ id: 'non-existent' })
      ).rejects.toThrow('Account not found');
    });
  });

  describe('UpdateAccount', () => {
    test('should update account name', async () => {
      // Arrange
      const account = new Account('123', 'Checking', 'asset', null, false, Money.fromAmount(0), Money.fromAmount(0), null);
      mockRepo.findById = vi.fn().mockResolvedValue(account);
      mockRepo.existsByName = vi.fn().mockResolvedValue(false);
      const useCase = new UpdateAccount(mockRepo);

      // Act
      const result = await useCase.execute({
        id: '123',
        name: 'Primary Checking'
      });

      // Assert
      expect(result.name).toBe('Primary Checking');
      expect(mockRepo.save).toHaveBeenCalledOnce();
    });

    test('should update account type', async () => {
      // Arrange
      const account = new Account('123', 'Account', 'asset', null, false, Money.fromAmount(0), Money.fromAmount(0), null);
      mockRepo.findById = vi.fn().mockResolvedValue(account);
      const useCase = new UpdateAccount(mockRepo);

      // Act
      const result = await useCase.execute({
        id: '123',
        type: 'liability'
      });

      // Assert
      expect(result.type).toBe('liability');
    });

    test('should update IBAN', async () => {
      // Arrange
      const account = new Account('123', 'Account', 'asset', null, false, Money.fromAmount(0), Money.fromAmount(0), null);
      mockRepo.findById = vi.fn().mockResolvedValue(account);
      mockRepo.existsByIban = vi.fn().mockResolvedValue(false);
      const useCase = new UpdateAccount(mockRepo);

      // Act
      const result = await useCase.execute({
        id: '123',
        iban: 'NL01BANK0123456789'
      });

      // Assert
      expect(result.iban).toBe('NL01BANK0123456789');
    });

    test('should toggle isSavings', async () => {
      // Arrange
      const account = new Account('123', 'Account', 'asset', null, false, Money.fromAmount(0), Money.fromAmount(0), null);
      mockRepo.findById = vi.fn().mockResolvedValue(account);
      const useCase = new UpdateAccount(mockRepo);

      // Act
      const result = await useCase.execute({
        id: '123',
        isSavings: true
      });

      // Assert
      expect(result.isSavings).toBe(true);
    });

    test('should update overdraft limit', async () => {
      // Arrange
      const account = new Account('123', 'Account', 'asset', null, false, Money.fromAmount(0), Money.fromAmount(0), null);
      mockRepo.findById = vi.fn().mockResolvedValue(account);
      const useCase = new UpdateAccount(mockRepo);

      // Act
      const result = await useCase.execute({
        id: '123',
        overdraftLimit: { amount: 1000 }
      });

      // Assert
      expect(result.overdraftLimit.amount).toBe(1000);
    });

    test('should update credit limit', async () => {
      // Arrange
      const account = new Account('123', 'Account', 'liability', null, false, Money.fromAmount(0), Money.fromAmount(0), null);
      mockRepo.findById = vi.fn().mockResolvedValue(account);
      const useCase = new UpdateAccount(mockRepo);

      // Act
      const result = await useCase.execute({
        id: '123',
        creditLimit: { amount: 5000 }
      });

      // Assert
      expect(result.creditLimit.amount).toBe(5000);
    });

    test('should update payment due date', async () => {
      // Arrange
      const account = new Account('123', 'Credit Card', 'liability', null, false, Money.fromAmount(0), Money.fromAmount(0), null);
      mockRepo.findById = vi.fn().mockResolvedValue(account);
      const useCase = new UpdateAccount(mockRepo);

      // Act
      const result = await useCase.execute({
        id: '123',
        paymentDueDate: { dayOfMonth: 20, shiftDirection: 'after' }
      });

      // Assert
      expect(result.paymentDueDate?.dayOfMonth).toBe(20);
      expect(result.paymentDueDate?.shiftDirection).toBe('after');
    });

    test('should clear payment due date', async () => {
      // Arrange
      const dueDate = ExpectedPaymentDueDate.create(15, 'before');
      const account = new Account('123', 'Account', 'liability', null, false, Money.fromAmount(0), Money.fromAmount(5000), dueDate);
      mockRepo.findById = vi.fn().mockResolvedValue(account);
      const useCase = new UpdateAccount(mockRepo);

      // Act
      const result = await useCase.execute({
        id: '123',
        paymentDueDate: null
      });

      // Assert
      expect(result.paymentDueDate).toBeNull();
    });

    test('should throw error when account not found', async () => {
      // Arrange
      mockRepo.findById = vi.fn().mockResolvedValue(null);
      const useCase = new UpdateAccount(mockRepo);

      // Act & Assert
      await expect(
        useCase.execute({ id: 'non-existent', name: 'New Name' })
      ).rejects.toThrow('Account not found');
    });

    test('should throw error when new name already exists', async () => {
      // Arrange
      const account = new Account('123', 'Checking', 'asset', null, false, Money.fromAmount(0), Money.fromAmount(0), null);
      mockRepo.findById = vi.fn().mockResolvedValue(account);
      mockRepo.existsByName = vi.fn().mockResolvedValue(true);
      const useCase = new UpdateAccount(mockRepo);

      // Act & Assert
      await expect(
        useCase.execute({ id: '123', name: 'Savings' })
      ).rejects.toThrow('Account name already exists');
    });

    test('should throw error when new IBAN already exists', async () => {
      // Arrange
      const account = new Account('123', 'Account', 'asset', null, false, Money.fromAmount(0), Money.fromAmount(0), null);
      mockRepo.findById = vi.fn().mockResolvedValue(account);
      mockRepo.existsByIban = vi.fn().mockResolvedValue(true);
      const useCase = new UpdateAccount(mockRepo);

      // Act & Assert
      await expect(
        useCase.execute({ id: '123', iban: 'NL01BANK0123456789' })
      ).rejects.toThrow('IBAN already exists');
    });

    test('should allow updating to same name', async () => {
      // Arrange
      const account = new Account('123', 'Checking', 'asset', null, false, Money.fromAmount(0), Money.fromAmount(0), null);
      mockRepo.findById = vi.fn().mockResolvedValue(account);
      mockRepo.existsByName = vi.fn().mockResolvedValue(true);
      const useCase = new UpdateAccount(mockRepo);

      // Act
      const result = await useCase.execute({
        id: '123',
        name: 'Checking' // Same name
      });

      // Assert
      expect(result.name).toBe('Checking');
      expect(mockRepo.save).toHaveBeenCalledOnce();
    });
  });

  describe('DeleteAccount', () => {
    test('should delete account successfully', async () => {
      // Arrange
      const account = new Account('123', 'Checking', 'asset', null, false, Money.fromAmount(0), Money.fromAmount(0), null);
      mockRepo.findById = vi.fn().mockResolvedValue(account);
      const useCase = new DeleteAccount(mockRepo);

      // Act
      await useCase.execute({ id: '123' });

      // Assert
      expect(mockRepo.delete).toHaveBeenCalledWith('123');
    });

    test('should throw error when account not found', async () => {
      // Arrange
      mockRepo.findById = vi.fn().mockResolvedValue(null);
      const useCase = new DeleteAccount(mockRepo);

      // Act & Assert
      await expect(
        useCase.execute({ id: 'non-existent' })
      ).rejects.toThrow('Account not found');

      expect(mockRepo.delete).not.toHaveBeenCalled();
    });

    test('should not return any value', async () => {
      // Arrange
      const account = new Account('123', 'Checking', 'asset', null, false, Money.fromAmount(0), Money.fromAmount(0), null);
      mockRepo.findById = vi.fn().mockResolvedValue(account);
      const useCase = new DeleteAccount(mockRepo);

      // Act
      const result = await useCase.execute({ id: '123' });

      // Assert
      expect(result).toBeUndefined();
    });
  });
});