import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { DataSource } from 'typeorm';
import { AccountRepository } from './AccountRepository';
import { Account } from '@domain/entities/Account';
import { AccountEntity } from '../database/entities/AccountEntity';
import { Money } from '@domain/value-objects/Money';
import { IBAN } from '@domain/value-objects/IBAN';
import { ExpectedPaymentDueDate } from '@domain/value-objects/ExpectedPaymentDueDate';

describe('AccountRepository', () => {
  let dataSource: DataSource;
  let repository: AccountRepository;

  beforeEach(async () => {
    dataSource = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      synchronize: true,
      logging: false,
      entities: [AccountEntity],
    });

    await dataSource.initialize();
    repository = new AccountRepository(dataSource);
  });

  afterEach(async () => {
    await dataSource.destroy();
  });

  describe('save and findById', () => {
    test('should save and retrieve an account', async () => {
      // Arrange
      const account = new Account(
        'acc-1',
        'Checking Account',
        'asset',
        IBAN.create('NL01BANK0123456789'),
        false,
        Money.fromAmount(500),
        Money.fromAmount(0),
        null
      );

      // Act
      await repository.save(account);
      const found = await repository.findById('acc-1');

      // Assert
      expect(found).not.toBeNull();
      expect(found?.id).toBe('acc-1');
      expect(found?.name).toBe('Checking Account');
      expect(found?.type).toBe('asset');
      expect(found?.iban?.toString()).toBe('NL01BANK0123456789');
      expect(found?.isSavings).toBe(false);
      expect(found?.overdraftLimit.amount).toBe(500);
    });

    test('should return null when account does not exist', async () => {
      // Act
      const found = await repository.findById('non-existent');

      // Assert
      expect(found).toBeNull();
    });

    test('should update existing account', async () => {
      // Arrange
      const account = new Account(
        'acc-1',
        'Checking',
        'asset',
        null,
        false,
        Money.fromAmount(0),
        Money.fromAmount(0),
        null
      );
      await repository.save(account);

      // Act - rename account
      account.rename('Primary Checking');
      await repository.save(account);

      // Assert
      const found = await repository.findById('acc-1');
      expect(found?.name).toBe('Primary Checking');
    });

    test('should save account without IBAN', async () => {
      // Arrange
      const account = new Account(
        'acc-1',
        'Cash Account',
        'asset',
        null,
        false,
        Money.fromAmount(0),
        Money.fromAmount(0),
        null
      );

      // Act
      await repository.save(account);
      const found = await repository.findById('acc-1');

      // Assert
      expect(found?.iban).toBeNull();
    });

    test('should save liability account with payment due date', async () => {
      // Arrange
      const dueDate = ExpectedPaymentDueDate.create(15, 'before');
      const account = new Account(
        'acc-1',
        'Credit Card',
        'liability',
        null,
        false,
        Money.fromAmount(0),
        Money.fromAmount(5000),
        dueDate
      );

      // Act
      await repository.save(account);
      const found = await repository.findById('acc-1');

      // Assert
      expect(found?.type).toBe('liability');
      expect(found?.creditLimit.amount).toBe(5000);
      expect(found?.paymentDueDate?.getDayOfMonth()).toBe(15);
      expect(found?.paymentDueDate?.getShiftDirection()).toBe('before');
    });
  });

  describe('findAll', () => {
    test('should return empty array when no accounts exist', async () => {
      // Act
      const accounts = await repository.findAll();

      // Assert
      expect(accounts).toEqual([]);
    });

    test('should return all accounts sorted by name', async () => {
      // Arrange
      const acc1 = new Account('acc-1', 'Savings', 'asset', null, true, Money.fromAmount(0), Money.fromAmount(0), null);
      const acc2 = new Account('acc-2', 'Checking', 'asset', null, false, Money.fromAmount(500), Money.fromAmount(0), null);
      const acc3 = new Account('acc-3', 'Credit Card', 'liability', null, false, Money.fromAmount(0), Money.fromAmount(5000), null);

      await repository.save(acc1);
      await repository.save(acc2);
      await repository.save(acc3);

      // Act
      const accounts = await repository.findAll();

      // Assert
      expect(accounts).toHaveLength(3);
      expect(accounts[0]?.name).toBe('Checking'); // Alphabetically first
      expect(accounts[1]?.name).toBe('Credit Card');
      expect(accounts[2]?.name).toBe('Savings');
    });

    test('should return both asset and liability accounts', async () => {
      // Arrange
      const asset = new Account('acc-1', 'Checking', 'asset', null, false, Money.fromAmount(500), Money.fromAmount(0), null);
      const liability = new Account('acc-2', 'Credit Card', 'liability', null, false, Money.fromAmount(0), Money.fromAmount(5000), null);

      await repository.save(asset);
      await repository.save(liability);

      // Act
      const accounts = await repository.findAll();

      // Assert
      expect(accounts).toHaveLength(2);
      expect(accounts.find(a => a.type === 'asset')).toBeDefined();
      expect(accounts.find(a => a.type === 'liability')).toBeDefined();
    });
  });

  describe('delete', () => {
    test('should delete an account', async () => {
      // Arrange
      const account = new Account('acc-1', 'Checking', 'asset', null, false, Money.fromAmount(0), Money.fromAmount(0), null);
      await repository.save(account);

      // Act
      await repository.delete('acc-1');

      // Assert
      const found = await repository.findById('acc-1');
      expect(found).toBeNull();
    });

    test('should not throw error when deleting non-existent account', async () => {
      // Act & Assert - should not throw
      await expect(repository.delete('non-existent')).resolves.toBeUndefined();
    });
  });

  describe('existsByName', () => {
    test('should return true when name exists', async () => {
      // Arrange
      const account = new Account('acc-1', 'Checking', 'asset', null, false, Money.fromAmount(0), Money.fromAmount(0), null);
      await repository.save(account);

      // Act
      const exists = await repository.existsByName('Checking');

      // Assert
      expect(exists).toBe(true);
    });

    test('should return false when name does not exist', async () => {
      // Arrange
      const account = new Account('acc-1', 'Checking', 'asset', null, false, Money.fromAmount(0), Money.fromAmount(0), null);
      await repository.save(account);

      // Act
      const exists = await repository.existsByName('Savings');

      // Assert
      expect(exists).toBe(false);
    });

    test('should be case sensitive', async () => {
      // Arrange
      const account = new Account('acc-1', 'Checking', 'asset', null, false, Money.fromAmount(0), Money.fromAmount(0), null);
      await repository.save(account);

      // Act
      const existsLower = await repository.existsByName('checking');
      const existsUpper = await repository.existsByName('CHECKING');

      // Assert
      expect(existsLower).toBe(false);
      expect(existsUpper).toBe(false);
    });
  });

  describe('existsByIban', () => {
    test('should return true when IBAN exists', async () => {
      // Arrange
      const iban = IBAN.create('NL01BANK0123456789');
      const account = new Account('acc-1', 'Checking', 'asset', iban, false, Money.fromAmount(0), Money.fromAmount(0), null);
      await repository.save(account);

      // Act
      const exists = await repository.existsByIban('NL01BANK0123456789');

      // Assert
      expect(exists).toBe(true);
    });

    test('should return false when IBAN does not exist', async () => {
      // Arrange
      const iban = IBAN.create('NL01BANK0123456789');
      const account = new Account('acc-1', 'Checking', 'asset', iban, false, Money.fromAmount(0), Money.fromAmount(0), null);
      await repository.save(account);

      // Act
      const exists = await repository.existsByIban('NL02BANK9876543210');

      // Assert
      expect(exists).toBe(false);
    });

    test('should return false when no account has IBAN', async () => {
      // Arrange
      const account = new Account('acc-1', 'Cash', 'asset', null, false, Money.fromAmount(0), Money.fromAmount(0), null);
      await repository.save(account);

      // Act
      const exists = await repository.existsByIban('NL01BANK0123456789');

      // Assert
      expect(exists).toBe(false);
    });
  });

  describe('database constraints', () => {
    test('should enforce unique name constraint', async () => {
      // Arrange
      const acc1 = new Account('acc-1', 'Checking', 'asset', null, false, Money.fromAmount(0), Money.fromAmount(0), null);
      await repository.save(acc1);

      // Act & Assert - duplicate name should fail
      const acc2 = new Account('acc-2', 'Checking', 'asset', null, false, Money.fromAmount(0), Money.fromAmount(0), null);
      await expect(repository.save(acc2)).rejects.toThrow();
    });

    test('should enforce unique IBAN constraint when not null', async () => {
      // Arrange
      const iban = IBAN.create('NL01BANK0123456789');
      const acc1 = new Account('acc-1', 'Checking 1', 'asset', iban, false, Money.fromAmount(0), Money.fromAmount(0), null);
      await repository.save(acc1);

      // Act & Assert - duplicate IBAN should fail
      const acc2 = new Account('acc-2', 'Checking 2', 'asset', iban, false, Money.fromAmount(0), Money.fromAmount(0), null);
      await expect(repository.save(acc2)).rejects.toThrow();
    });

    test('should allow multiple accounts without IBAN', async () => {
      // Arrange
      const acc1 = new Account('acc-1', 'Cash 1', 'asset', null, false, Money.fromAmount(0), Money.fromAmount(0), null);
      const acc2 = new Account('acc-2', 'Cash 2', 'asset', null, false, Money.fromAmount(0), Money.fromAmount(0), null);

      // Act & Assert - should not throw
      await repository.save(acc1);
      await repository.save(acc2);

      const accounts = await repository.findAll();
      expect(accounts).toHaveLength(2);
    });

    test('should allow same name after deletion', async () => {
      // Arrange
      const acc1 = new Account('acc-1', 'Checking', 'asset', null, false, Money.fromAmount(0), Money.fromAmount(0), null);
      await repository.save(acc1);
      await repository.delete('acc-1');

      // Act - should not throw
      const acc2 = new Account('acc-2', 'Checking', 'asset', null, false, Money.fromAmount(0), Money.fromAmount(0), null);
      await repository.save(acc2);

      // Assert
      const found = await repository.findById('acc-2');
      expect(found?.name).toBe('Checking');
    });
  });

  describe('currency support', () => {
    test('should save and retrieve different currencies', async () => {
      // Arrange
      const account = new Account(
        'acc-1',
        'USD Account',
        'asset',
        null,
        false,
        Money.fromAmount(1000, 'USD'),
        Money.fromAmount(0, 'USD'),
        null
      );

      // Act
      await repository.save(account);
      const found = await repository.findById('acc-1');

      // Assert
      expect(found?.overdraftLimit.currency).toBe('USD');
      expect(found?.overdraftLimit.amount).toBe(1000);
      expect(found?.creditLimit.currency).toBe('USD');
    });
  });
});