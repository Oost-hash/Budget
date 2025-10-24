import { describe, test, expect } from 'vitest';
import { Payee } from './Payee';
import { IBAN } from '@domain/value-objects/IBAN';

describe('Payee', () => {
    test('should create a payee with valid data', () => {
        // Arrange
        const id = '789';
        const name = 'John Doe';
        const iban = IBAN.create('DE89370400440532013000');

        // Act
        const payee = new Payee(id, name, iban);

        // Assert
        expect(payee.id).toBe(id);
        expect(payee.name).toBe(name);
        expect(payee.iban?.toString()).toBe('DE89370400440532013000');
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
            new Payee(id, emptyName, IBAN.create('DE89370400440532013000'));
        }).toThrow('Payee name cannot be empty');
    });

    test('should throw error when IBAN format is invalid', () => {
        // Arrange
        const invalidIban = 'INVALID_IBAN';

        // Act & Assert
        expect(() => {
            IBAN.create(invalidIban);
        }).toThrow('Invalid IBAN');
    });

    test('should rename payee with valid name', () => {
        // Arrange
        const payee = new Payee(
            '789',
            'John Doe',
            IBAN.create('DE89370400440532013000')
        );

        // Act
        const newName = 'Jonathan Doe';
        payee.rename(newName);

        // Assert
        expect(payee.name).toBe(newName);
    });

    test('should change IBAN with valid format', () => {
        // Arrange
        const payee = new Payee(
            '789',
            'John Doe',
            IBAN.create('DE89370400440532013000')
        );

        // Act
        const newIban = IBAN.create('FR7630006000011234567890189');
        payee.changeIban(newIban);

        // Assert
        expect(payee.iban?.toString()).toBe('FR7630006000011234567890189');
    });

    test('should change IBAN to null', () => {
        // Arrange
        const payee = new Payee(
            '789',
            'John Doe',
            IBAN.create('DE89370400440532013000')
        );

        // Act
        payee.changeIban(null);

        // Assert
        expect(payee.iban).toBeNull();
    });

    test('should not rename payee with empty name', () => {
        // Arrange
        const payee = new Payee(
            '789',
            'John Doe',
            IBAN.create('DE89370400440532013000')
        );

        // Act & Assert
        expect(() => {
            payee.rename('');
        }).toThrow('Payee name cannot be empty');
    });

    test('should get country code from IBAN', () => {
        // Arrange
        const iban = IBAN.create('NL91ABNA0417164300');
        const payee = new Payee('789', 'Dutch Company', iban);

        // Assert
        expect(payee.iban?.getCountryCode()).toBe('NL');
    });

    test('should format IBAN with spaces', () => {
        // Arrange
        const iban = IBAN.create('DE89370400440532013000');
        const payee = new Payee('789', 'German Company', iban);

        // Assert
        expect(payee.iban?.format()).toBe('DE89 3704 0044 0532 0130 00');
    });

    test('should handle IBAN with spaces on creation', () => {
        // Arrange
        const ibanWithSpaces = IBAN.create('NL91 ABNA 0417 1643 00');
        const payee = new Payee('789', 'Company', ibanWithSpaces);

        // Assert
        expect(payee.iban?.toString()).toBe('NL91ABNA0417164300');
    });

    test('should create payee with lowercase IBAN', () => {
        // Arrange
        const lowercaseIban = IBAN.create('nl91abna0417164300');
        const payee = new Payee('789', 'Company', lowercaseIban);

        // Assert
        expect(payee.iban?.toString()).toBe('NL91ABNA0417164300');
    });
});