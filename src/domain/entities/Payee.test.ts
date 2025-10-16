import { describe, test, expect } from 'vitest';
import { Payee } from './Payee';

describe('Payee', () => {
    test('should create a payee with valid data', () => {
        // Arrange
        const id = '789';
        const name = 'John Doe';
        const iban = 'DE89370400440532013000';

        // Act
        const payee = new Payee(id, name, iban);

        // Assert
        expect(payee.id).toBe(id);
        expect(payee.name).toBe(name);
        expect(payee.iban).toBe(iban);
    });

    test('should create a payee with null IBAN', () => {
        // Arrange
        const id = '789';
        const name = 'Jane Smith';
        const iban = null;

        // Act
        const payee = new Payee(id, name, iban);

        // Assert
        expect(payee.iban).toBeNull();
    });

    test('should throw error when name is empty', () => {
        // Arrange
        const id = '789';
        const emptyName = '';

        // Act & Assert
        expect(() => {
            new Payee(id, emptyName, 'DE89370400440532013000');
        }).toThrow('Payee name cannot be empty');
    });

    test('should throw error when IBAN format is invalid', () => {
        // Arrange
        const id = '789';
        const name = 'John Doe';
        const invalidIban = 'INVALID_IBAN';

        // Act & Assert
        expect(() => {
            new Payee(id, name, invalidIban);
        }).toThrow('Invalid IBAN format');
    });

    test('should rename payee with valid name', () => {
        // Arrange
        const payee = new Payee('789', 'John Doe', 'DE89370400440532013000');

        // Act
        const newName = 'Jonathan Doe';
        payee.rename(newName);

        // Assert
        expect(payee.name).toBe(newName);
    });

    test('should change IBAN with valid format', () => {
        // Arrange
        const payee = new Payee('789', 'John Doe', 'DE89370400440532013000');

        // Act
        const newIban = 'FR7630006000011234567890189';
        payee.changeIban(newIban);

        // Assert
        expect(payee.iban).toBe(newIban);
    });

    test('should change IBAN to null', () => {
        // Arrange
        const payee = new Payee('789', 'John Doe', 'DE89370400440532013000');

        // Act
        payee.changeIban(null);

        // Assert
        expect(payee.iban).toBeNull();
    });

    test('should not rename payee with empty name', () => {
        // Arrange
        const payee = new Payee('789', 'John Doe', 'DE89370400440532013000');

        // Act & Assert
        expect(() => {
            payee.rename('');
        }).toThrow('Payee name cannot be empty');
    });

    test('should not change IBAN with invalid format', () => {
        // Arrange
        const payee = new Payee('789', 'John Doe', 'DE89370400440532013000');

        // Act & Assert
        expect(() => {
            payee.changeIban('INVALID_IBAN');
        }).toThrow('Invalid IBAN format');
    });
});