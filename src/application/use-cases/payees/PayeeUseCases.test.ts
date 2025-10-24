import { describe, test, expect, vi, beforeEach } from 'vitest';
import { CreatePayee } from './CreatePayee';
import { GetAllPayees } from './GetAllPayees';
import { GetPayee } from './GetPayee';
import { UpdatePayee } from './UpdatePayee';
import { DeletePayee } from './DeletePayee';
import { IPayeeRepository } from '@domain/repositories/IPayeeRepository';
import { Payee } from '@domain/entities/Payee';
import { IBAN } from '@domain/value-objects/IBAN';

describe('Payee Use Cases', () => {
  let mockRepo: IPayeeRepository;

  beforeEach(() => {
    mockRepo = {
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn(),
      existsByName: vi.fn(),
      existsByIban: vi.fn(),
      findByIban: vi.fn(),
    };
  });

  describe('CreatePayee', () => {
    test('should create payee successfully', async () => {
      // Arrange
      mockRepo.existsByName = vi.fn().mockResolvedValue(false);
      const useCase = new CreatePayee(mockRepo);

      // Act
      const result = await useCase.execute({
        name: 'Albert Heijn'
      });

      // Assert
      expect(result.name).toBe('Albert Heijn');
      expect(result.id).toBeDefined();
      expect(mockRepo.save).toHaveBeenCalledOnce();
    });

    test('should create payee with IBAN', async () => {
      // Arrange
      mockRepo.existsByName = vi.fn().mockResolvedValue(false);
      mockRepo.existsByIban = vi.fn().mockResolvedValue(false);
      const useCase = new CreatePayee(mockRepo);

      // Act
      const result = await useCase.execute({
        name: 'Albert Heijn',
        iban: 'NL01BANK0123456789'
      });

      // Assert
      expect(result.iban).toBe('NL01BANK0123456789');
      expect(mockRepo.existsByIban).toHaveBeenCalledWith('NL01BANK0123456789');
    });

    test('should throw error when name already exists', async () => {
      // Arrange
      mockRepo.existsByName = vi.fn().mockResolvedValue(true);
      const useCase = new CreatePayee(mockRepo);

      // Act & Assert
      await expect(
        useCase.execute({ name: 'Albert Heijn' })
      ).rejects.toThrow('Payee name already exists');

      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    test('should throw error when IBAN already exists', async () => {
      // Arrange
      mockRepo.existsByName = vi.fn().mockResolvedValue(false);
      mockRepo.existsByIban = vi.fn().mockResolvedValue(true);
      const useCase = new CreatePayee(mockRepo);

      // Act & Assert
      await expect(
        useCase.execute({
          name: 'New Payee',
          iban: 'NL01BANK0123456789'
        })
      ).rejects.toThrow('IBAN already exists');

      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    test('should create payee without IBAN', async () => {
      // Arrange
      mockRepo.existsByName = vi.fn().mockResolvedValue(false);
      const useCase = new CreatePayee(mockRepo);

      // Act
      const result = await useCase.execute({
        name: 'Cash Payment'
      });

      // Assert
      expect(result.iban).toBeNull();
    });
  });

  describe('GetAllPayees', () => {
    test('should return all payees as DTOs', async () => {
      // Arrange
      const payees = [
        new Payee('1', 'Albert Heijn', null),
        new Payee('2', 'Jumbo', null),
        new Payee('3', 'Bol.com', IBAN.create('NL01BANK0123456789')),
      ];
      mockRepo.findAll = vi.fn().mockResolvedValue(payees);
      const useCase = new GetAllPayees(mockRepo);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]?.name).toBe('Albert Heijn');
      expect(result[1]?.name).toBe('Jumbo');
      expect(result[2]?.name).toBe('Bol.com');
    });

    test('should return empty array when no payees exist', async () => {
      // Arrange
      mockRepo.findAll = vi.fn().mockResolvedValue([]);
      const useCase = new GetAllPayees(mockRepo);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('GetPayee', () => {
    test('should return payee by ID', async () => {
      // Arrange
      const payee = new Payee('123', 'Albert Heijn', null);
      mockRepo.findById = vi.fn().mockResolvedValue(payee);
      const useCase = new GetPayee(mockRepo);

      // Act
      const result = await useCase.execute({ id: '123' });

      // Assert
      expect(result.id).toBe('123');
      expect(result.name).toBe('Albert Heijn');
    });

    test('should throw error when payee not found', async () => {
      // Arrange
      mockRepo.findById = vi.fn().mockResolvedValue(null);
      const useCase = new GetPayee(mockRepo);

      // Act & Assert
      await expect(
        useCase.execute({ id: 'non-existent' })
      ).rejects.toThrow('Payee not found');
    });
  });

  describe('UpdatePayee', () => {
    test('should update payee name', async () => {
      // Arrange
      const payee = new Payee('123', 'Albert Heijn', null);
      mockRepo.findById = vi.fn().mockResolvedValue(payee);
      mockRepo.existsByName = vi.fn().mockResolvedValue(false);
      const useCase = new UpdatePayee(mockRepo);

      // Act
      const result = await useCase.execute({
        id: '123',
        name: 'AH Supermarket'
      });

      // Assert
      expect(result.name).toBe('AH Supermarket');
      expect(mockRepo.save).toHaveBeenCalledOnce();
    });

    test('should update payee IBAN', async () => {
      // Arrange
      const payee = new Payee('123', 'Albert Heijn', null);
      mockRepo.findById = vi.fn().mockResolvedValue(payee);
      mockRepo.existsByIban = vi.fn().mockResolvedValue(false);
      const useCase = new UpdatePayee(mockRepo);

      // Act
      const result = await useCase.execute({
        id: '123',
        iban: 'NL01BANK0123456789'
      });

      // Assert
      expect(result.iban).toBe('NL01BANK0123456789');
    });

    test('should clear IBAN', async () => {
      // Arrange
      const iban = IBAN.create('NL01BANK0123456789');
      const payee = new Payee('123', 'Albert Heijn', iban);
      mockRepo.findById = vi.fn().mockResolvedValue(payee);
      const useCase = new UpdatePayee(mockRepo);

      // Act
      const result = await useCase.execute({
        id: '123',
        iban: null
      });

      // Assert
      expect(result.iban).toBeNull();
    });

    test('should throw error when payee not found', async () => {
      // Arrange
      mockRepo.findById = vi.fn().mockResolvedValue(null);
      const useCase = new UpdatePayee(mockRepo);

      // Act & Assert
      await expect(
        useCase.execute({ id: 'non-existent', name: 'New Name' })
      ).rejects.toThrow('Payee not found');
    });

    test('should throw error when new name already exists', async () => {
      // Arrange
      const payee = new Payee('123', 'Albert Heijn', null);
      mockRepo.findById = vi.fn().mockResolvedValue(payee);
      mockRepo.existsByName = vi.fn().mockResolvedValue(true);
      const useCase = new UpdatePayee(mockRepo);

      // Act & Assert
      await expect(
        useCase.execute({ id: '123', name: 'Jumbo' })
      ).rejects.toThrow('Payee name already exists');
    });

    test('should throw error when new IBAN already exists', async () => {
      // Arrange
      const payee = new Payee('123', 'Albert Heijn', null);
      mockRepo.findById = vi.fn().mockResolvedValue(payee);
      mockRepo.existsByIban = vi.fn().mockResolvedValue(true);
      const useCase = new UpdatePayee(mockRepo);

      // Act & Assert
      await expect(
        useCase.execute({ id: '123', iban: 'NL01BANK0123456789' })
      ).rejects.toThrow('IBAN already exists');
    });

    test('should allow updating to same name', async () => {
      // Arrange
      const payee = new Payee('123', 'Albert Heijn', null);
      mockRepo.findById = vi.fn().mockResolvedValue(payee);
      mockRepo.existsByName = vi.fn().mockResolvedValue(true);
      const useCase = new UpdatePayee(mockRepo);

      // Act
      const result = await useCase.execute({
        id: '123',
        name: 'Albert Heijn' // Same name
      });

      // Assert
      expect(result.name).toBe('Albert Heijn');
      expect(mockRepo.save).toHaveBeenCalledOnce();
    });
  });

  describe('DeletePayee', () => {
    test('should delete payee successfully', async () => {
      // Arrange
      const payee = new Payee('123', 'Albert Heijn', null);
      mockRepo.findById = vi.fn().mockResolvedValue(payee);
      const useCase = new DeletePayee(mockRepo);

      // Act
      await useCase.execute({ id: '123' });

      // Assert
      expect(mockRepo.delete).toHaveBeenCalledWith('123');
    });

    test('should throw error when payee not found', async () => {
      // Arrange
      mockRepo.findById = vi.fn().mockResolvedValue(null);
      const useCase = new DeletePayee(mockRepo);

      // Act & Assert
      await expect(
        useCase.execute({ id: 'non-existent' })
      ).rejects.toThrow('Payee not found');

      expect(mockRepo.delete).not.toHaveBeenCalled();
    });

    test('should not return any value', async () => {
      // Arrange
      const payee = new Payee('123', 'Albert Heijn', null);
      mockRepo.findById = vi.fn().mockResolvedValue(payee);
      const useCase = new DeletePayee(mockRepo);

      // Act
      const result = await useCase.execute({ id: '123' });

      // Assert
      expect(result).toBeUndefined();
    });
  });
});