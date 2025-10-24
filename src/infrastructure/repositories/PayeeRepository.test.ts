import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { DataSource } from 'typeorm';
import { PayeeRepository } from './PayeeRepository';
import { Payee } from '@domain/entities/Payee';
import { PayeeEntity } from '../database/entities/PayeeEntity';
import { IBAN } from '@domain/value-objects/IBAN';

describe('PayeeRepository', () => {
  let dataSource: DataSource;
  let repository: PayeeRepository;

  beforeEach(async () => {
    dataSource = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      synchronize: true,
      logging: false,
      entities: [PayeeEntity],
    });

    await dataSource.initialize();
    repository = new PayeeRepository(dataSource);
  });

  afterEach(async () => {
    await dataSource.destroy();
  });

  describe('save and findById', () => {
    test('should save and retrieve a payee', async () => {
      // Arrange
      const payee = new Payee(
        'payee-1',
        'Albert Heijn',
        IBAN.create('NL01BANK0123456789')
      );

      // Act
      await repository.save(payee);
      const found = await repository.findById('payee-1');

      // Assert
      expect(found).not.toBeNull();
      expect(found?.id).toBe('payee-1');
      expect(found?.name).toBe('Albert Heijn');
      expect(found?.iban?.toString()).toBe('NL01BANK0123456789');
    });

    test('should return null when payee does not exist', async () => {
      // Act
      const found = await repository.findById('non-existent');

      // Assert
      expect(found).toBeNull();
    });

    test('should update existing payee', async () => {
      // Arrange
      const payee = new Payee('payee-1', 'Albert Heijn', null);
      await repository.save(payee);

      // Act - rename payee
      payee.rename('AH Supermarket');
      await repository.save(payee);

      // Assert
      const found = await repository.findById('payee-1');
      expect(found?.name).toBe('AH Supermarket');
    });

    test('should save payee without IBAN', async () => {
      // Arrange
      const payee = new Payee('payee-1', 'Cash Payment', null);

      // Act
      await repository.save(payee);
      const found = await repository.findById('payee-1');

      // Assert
      expect(found?.iban).toBeNull();
    });
  });

  describe('findAll', () => {
    test('should return empty array when no payees exist', async () => {
      // Act
      const payees = await repository.findAll();

      // Assert
      expect(payees).toEqual([]);
    });

    test('should return all payees sorted by name', async () => {
      // Arrange
      const payee1 = new Payee('payee-1', 'Jumbo', null);
      const payee2 = new Payee('payee-2', 'Albert Heijn', null);
      const payee3 = new Payee('payee-3', 'Bol.com', null);

      await repository.save(payee1);
      await repository.save(payee2);
      await repository.save(payee3);

      // Act
      const payees = await repository.findAll();

      // Assert
      expect(payees).toHaveLength(3);
      expect(payees[0]?.name).toBe('Albert Heijn'); // Alphabetically first
      expect(payees[1]?.name).toBe('Bol.com');
      expect(payees[2]?.name).toBe('Jumbo');
    });
  });

  describe('delete', () => {
    test('should delete a payee', async () => {
      // Arrange
      const payee = new Payee('payee-1', 'Albert Heijn', null);
      await repository.save(payee);

      // Act
      await repository.delete('payee-1');

      // Assert
      const found = await repository.findById('payee-1');
      expect(found).toBeNull();
    });

    test('should not throw error when deleting non-existent payee', async () => {
      // Act & Assert - should not throw
      await expect(repository.delete('non-existent')).resolves.toBeUndefined();
    });
  });

  describe('existsByName', () => {
    test('should return true when name exists', async () => {
      // Arrange
      const payee = new Payee('payee-1', 'Albert Heijn', null);
      await repository.save(payee);

      // Act
      const exists = await repository.existsByName('Albert Heijn');

      // Assert
      expect(exists).toBe(true);
    });

    test('should return false when name does not exist', async () => {
      // Arrange
      const payee = new Payee('payee-1', 'Albert Heijn', null);
      await repository.save(payee);

      // Act
      const exists = await repository.existsByName('Jumbo');

      // Assert
      expect(exists).toBe(false);
    });

    test('should be case sensitive', async () => {
      // Arrange
      const payee = new Payee('payee-1', 'Albert Heijn', null);
      await repository.save(payee);

      // Act
      const existsLower = await repository.existsByName('albert heijn');
      const existsUpper = await repository.existsByName('ALBERT HEIJN');

      // Assert
      expect(existsLower).toBe(false);
      expect(existsUpper).toBe(false);
    });
  });

  describe('existsByIban', () => {
    test('should return true when IBAN exists', async () => {
      // Arrange
      const iban = IBAN.create('NL01BANK0123456789');
      const payee = new Payee('payee-1', 'Albert Heijn', iban);
      await repository.save(payee);

      // Act
      const exists = await repository.existsByIban('NL01BANK0123456789');

      // Assert
      expect(exists).toBe(true);
    });

    test('should return false when IBAN does not exist', async () => {
      // Arrange
      const iban = IBAN.create('NL01BANK0123456789');
      const payee = new Payee('payee-1', 'Albert Heijn', iban);
      await repository.save(payee);

      // Act
      const exists = await repository.existsByIban('NL02BANK9876543210');

      // Assert
      expect(exists).toBe(false);
    });

    test('should return false when no payee has IBAN', async () => {
      // Arrange
      const payee = new Payee('payee-1', 'Cash', null);
      await repository.save(payee);

      // Act
      const exists = await repository.existsByIban('NL01BANK0123456789');

      // Assert
      expect(exists).toBe(false);
    });
  });

  describe('findByIban', () => {
    test('should find payee by IBAN', async () => {
      // Arrange
      const iban = IBAN.create('NL01BANK0123456789');
      const payee = new Payee('payee-1', 'Albert Heijn', iban);
      await repository.save(payee);

      // Act
      const found = await repository.findByIban('NL01BANK0123456789');

      // Assert
      expect(found).not.toBeNull();
      expect(found?.id).toBe('payee-1');
      expect(found?.name).toBe('Albert Heijn');
    });

    test('should return null when IBAN not found', async () => {
      // Arrange
      const iban = IBAN.create('NL01BANK0123456789');
      const payee = new Payee('payee-1', 'Albert Heijn', iban);
      await repository.save(payee);

      // Act
      const found = await repository.findByIban('NL02BANK9876543210');

      // Assert
      expect(found).toBeNull();
    });
  });

  describe('database constraints', () => {
    test('should enforce unique name constraint', async () => {
      // Arrange
      const payee1 = new Payee('payee-1', 'Albert Heijn', null);
      await repository.save(payee1);

      // Act & Assert - duplicate name should fail
      const payee2 = new Payee('payee-2', 'Albert Heijn', null);
      await expect(repository.save(payee2)).rejects.toThrow();
    });

    test('should enforce unique IBAN constraint when not null', async () => {
      // Arrange
      const iban = IBAN.create('NL01BANK0123456789');
      const payee1 = new Payee('payee-1', 'Payee 1', iban);
      await repository.save(payee1);

      // Act & Assert - duplicate IBAN should fail
      const payee2 = new Payee('payee-2', 'Payee 2', iban);
      await expect(repository.save(payee2)).rejects.toThrow();
    });

    test('should allow multiple payees without IBAN', async () => {
      // Arrange
      const payee1 = new Payee('payee-1', 'Cash 1', null);
      const payee2 = new Payee('payee-2', 'Cash 2', null);

      // Act & Assert - should not throw
      await repository.save(payee1);
      await repository.save(payee2);

      const payees = await repository.findAll();
      expect(payees).toHaveLength(2);
    });

    test('should allow same name after deletion', async () => {
      // Arrange
      const payee1 = new Payee('payee-1', 'Albert Heijn', null);
      await repository.save(payee1);
      await repository.delete('payee-1');

      // Act - should not throw
      const payee2 = new Payee('payee-2', 'Albert Heijn', null);
      await repository.save(payee2);

      // Assert
      const found = await repository.findById('payee-2');
      expect(found?.name).toBe('Albert Heijn');
    });
  });
});