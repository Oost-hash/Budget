import { describe, test, expect } from 'vitest';
import { IBAN } from './IBAN';

describe('IBAN', () => {
    describe('Creation', () => {
        test('should create IBAN with valid format', () => {
            // Arrange
            const validIban = 'NL91ABNA0417164300';

            // Act
            const iban = IBAN.create(validIban);

            // Assert
            expect(iban.toString()).toBe('NL91ABNA0417164300');
        });

        test('should create IBAN with lowercase input', () => {
            // Arrange
            const lowercaseIban = 'nl91abna0417164300';

            // Act
            const iban = IBAN.create(lowercaseIban);

            // Assert
            expect(iban.toString()).toBe('NL91ABNA0417164300');
        });

        test('should create IBAN with spaces and convert to clean format', () => {
            // Arrange
            const ibanWithSpaces = 'NL91 ABNA 0417 1643 00';

            // Act
            const iban = IBAN.create(ibanWithSpaces);

            // Assert
            expect(iban.toString()).toBe('NL91ABNA0417164300');
        });

        test('should throw error for IBAN that is too short', () => {
            // Arrange
            const shortIban = 'NL91ABNA';

            // Act & Assert
            expect(() => IBAN.create(shortIban))
                .toThrow('Invalid IBAN length');
        });

        test('should throw error for IBAN that is too long', () => {
            // Arrange
            const longIban = 'NL91ABNA0417164300'.repeat(3); // ~54 characters

            // Act & Assert
            expect(() => IBAN.create(longIban))
                .toThrow('Invalid IBAN length');
        });

        test('should throw error for IBAN without country code', () => {
            // Arrange
            const invalidIban = '91ABNA0417164300';

            // Act & Assert
            expect(() => IBAN.create(invalidIban))
                .toThrow('Invalid IBAN format');
        });

        test('should throw error for IBAN with invalid characters', () => {
            // Arrange
            const invalidIban = 'NL91-ABNA-0417-1643-00';

            // Act & Assert
            expect(() => IBAN.create(invalidIban))
                .toThrow('Invalid IBAN format');
        });

        test('should create optional IBAN from string', () => {
            // Arrange
            const validIban = 'NL91ABNA0417164300';

            // Act
            const iban = IBAN.createOptional(validIban);

            // Assert
            expect(iban).not.toBeNull();
            expect(iban?.toString()).toBe('NL91ABNA0417164300');
        });

        test('should create optional IBAN from null', () => {
            // Act
            const iban = IBAN.createOptional(null);

            // Assert
            expect(iban).toBeNull();
        });
    });

    describe('Equality', () => {
        test('should return true for equal IBANs', () => {
            // Arrange
            const iban1 = IBAN.create('NL91ABNA0417164300');
            const iban2 = IBAN.create('NL91ABNA0417164300');

            // Act & Assert
            expect(iban1.equals(iban2)).toBe(true);
        });

        test('should return false for different IBANs', () => {
            // Arrange
            const iban1 = IBAN.create('NL91ABNA0417164300');
            const iban2 = IBAN.create('DE89370400440532013000');

            // Act & Assert
            expect(iban1.equals(iban2)).toBe(false);
        });

        test('should handle case-insensitive comparison', () => {
            // Arrange
            const iban1 = IBAN.create('nl91abna0417164300');
            const iban2 = IBAN.create('NL91ABNA0417164300');

            // Act & Assert
            expect(iban1.equals(iban2)).toBe(true);
        });
    });

    describe('Country Code', () => {
        test('should extract country code from Dutch IBAN', () => {
            // Arrange
            const iban = IBAN.create('NL91ABNA0417164300');

            // Act
            const countryCode = iban.getCountryCode();

            // Assert
            expect(countryCode).toBe('NL');
        });

        test('should extract country code from German IBAN', () => {
            // Arrange
            const iban = IBAN.create('DE89370400440532013000');

            // Act
            const countryCode = iban.getCountryCode();

            // Assert
            expect(countryCode).toBe('DE');
        });

        test('should extract country code from French IBAN', () => {
            // Arrange
            const iban = IBAN.create('FR7630006000011234567890189');

            // Act
            const countryCode = iban.getCountryCode();

            // Assert
            expect(countryCode).toBe('FR');
        });
    });

    describe('Formatting', () => {
        test('should format IBAN with spaces', () => {
            // Arrange
            const iban = IBAN.create('NL91ABNA0417164300');

            // Act
            const formatted = iban.format();

            // Assert
            expect(formatted).toBe('NL91 ABNA 0417 1643 00');
        });

        test('should format German IBAN with spaces', () => {
            // Arrange
            const iban = IBAN.create('DE89370400440532013000');

            // Act
            const formatted = iban.format();

            // Assert
            expect(formatted).toBe('DE89 3704 0044 0532 0130 00');
        });
    });

    describe('Multiple Countries', () => {
        test('should work with Dutch IBAN', () => {
            const iban = IBAN.create('NL91ABNA0417164300');
            expect(iban.getCountryCode()).toBe('NL');
        });

        test('should work with German IBAN', () => {
            const iban = IBAN.create('DE89370400440532013000');
            expect(iban.getCountryCode()).toBe('DE');
        });

        test('should work with French IBAN', () => {
            const iban = IBAN.create('FR7630006000011234567890189');
            expect(iban.getCountryCode()).toBe('FR');
        });

        test('should work with Belgian IBAN', () => {
            const iban = IBAN.create('BE68539007547034');
            expect(iban.getCountryCode()).toBe('BE');
        });

        test('should work with UK IBAN', () => {
            const iban = IBAN.create('GB29NWBK60161331926819');
            expect(iban.getCountryCode()).toBe('GB');
        });
    });

    describe('toString', () => {
        test('should return IBAN as string', () => {
            // Arrange
            const iban = IBAN.create('NL91ABNA0417164300');

            // Act
            const result = iban.toString();

            // Assert
            expect(result).toBe('NL91ABNA0417164300');
        });
    });
});