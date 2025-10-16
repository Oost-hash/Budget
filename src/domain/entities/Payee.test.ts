import { describe, test, expect } from 'vitest';
import { Payee } from './Payee';

describe('Payee', () => {
    test('should create a payee with valid data', () => {
        // Arrange
        const id = '789';
        const name = 'John Doe';
        const iban = 'DE89370400440532013000';
        const now = new Date();

        // Act
        const payee = new Payee(id, name, iban, now, now);

        // Assert
        expect(payee.id).toBe(id);
        expect(payee.name).toBe(name);
        expect(payee.iban).toBe(iban);
        expect(payee.createdAt).toBe(now);
        expect(payee.updatedAt).toBe(now);
    });

    test('should create a payee with null IBAN', () => {
        // Arrange
        const id = '789';
        const name = 'Jane Smith';
        const iban = null;
        const now = new Date();

        // Act
        const payee = new Payee(id, name, iban, now, now);

        // Assert
        expect(payee.iban).toBeNull();
    });

    test('should throw error when name is empty', () => {
        // Arrange
        const id = '789';
        const emptyName = '';
        const now = new Date();

        // Act & Assert
        expect(() => {
            new Payee(id, emptyName, 'DE89370400440532013000', now, now);
        }).toThrow('Payee name cannot be empty');
    });

    test('should throw error when IBAN format is invalid', () => {
        // Arrange
        const id = '789';
        const name = 'John Doe';
        const invalidIban = 'INVALID_IBAN';
        const now = new Date();

        // Act & Assert
        expect(() => {
            new Payee(id, name, invalidIban, now, now);
        }).toThrow('Invalid IBAN format');
    });

    test('should rename payee with valid name', () => {
        // Arrange
        const payee = new Payee('789', 'John Doe', 'DE89370400440532013000', new Date(), new Date());
        const originalUpdatedAt = payee.updatedAt;

        // Act
        const newName = 'Jonathan Doe';
        payee.rename(newName);

        // Assert
        expect(payee.name).toBe(newName);
        expect(payee.updatedAt).not.toBe(originalUpdatedAt);
    });

    test('should change IBAN with valid format', () => {
        // Arrange
        const payee = new Payee('789', 'John Doe', 'DE89370400440532013000', new Date(), new Date());
        const originalUpdatedAt = payee.updatedAt;

        // Act
        const newIban = 'FR7630006000011234567890189';
        payee.changeIban(newIban);

        // Assert
        expect(payee.iban).toBe(newIban);
        expect(payee.updatedAt).not.toBe(originalUpdatedAt);
    });

    test('should change IBAN to null', () => {
        // Arrange
        const payee = new Payee('789', 'John Doe', 'DE89370400440532013000', new Date(), new Date());

        // Act
        payee.changeIban(null);

        // Assert
        expect(payee.iban).toBeNull();
    });

    test('should not rename payee with empty name', () => {
        // Arrange
        const payee = new Payee('789', 'John Doe', 'DE89370400440532013000', new Date(), new Date());

        // Act & Assert
        expect(() => {
            payee.rename('');
        }).toThrow('Payee name cannot be empty');
    });

    test('should not change IBAN with invalid format', () => {
        // Arrange
        const payee = new Payee('789', 'John Doe', 'DE89370400440532013000', new Date(), new Date());

        // Act & Assert
        expect(() => {
            payee.changeIban('INVALID_IBAN');
        }).toThrow('Invalid IBAN format');
    });
});