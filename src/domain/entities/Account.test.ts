import { describe, test, expect } from 'vitest';
import { Account } from './Account';

describe('Account', () => {
    test('should create asset account with valid data', () => {
        // Arrange
        const id = '789';
        const name = 'Checking Account';
        const type = 'asset';
        const iban = 'NL01BANK0123456789';
        const isSavings = false;
        const overdraftLimit = 500;
        const creditLimit = 0;
        const paymentDueDay = null;
        const now = new Date();

        // Act
        const account = new Account(
            id,
            name,
            type,
            iban,
            isSavings,
            overdraftLimit,
            creditLimit,
            paymentDueDay,
            now,
            now
        );

        // Assert
        expect(account.id).toBe(id);
        expect(account.name).toBe(name);
        expect(account.type).toBe(type);
        expect(account.iban).toBe(iban);
        expect(account.isSavings).toBe(isSavings);
        expect(account.overdraftLimit).toBe(overdraftLimit);
        expect(account.creditLimit).toBe(creditLimit);
        expect(account.paymentDueDay).toBeNull();
        expect(account.createdAt).toBe(now);
        expect(account.updatedAt).toBe(now);
    });

    test('should create liability account with valid data', () => {
        // Arrange
        const id = '790';
        const name = 'Credit Card';
        const type = 'liability';
        const iban = null;
        const isSavings = false;
        const overdraftLimit = 0;
        const creditLimit = 5000;
        const paymentDueDay = 15;
        const now = new Date();

        // Act
        const account = new Account(
            id,
            name,
            type,
            iban,
            isSavings,
            overdraftLimit,
            creditLimit,
            paymentDueDay,
            now,
            now
        );

        // Assert
        expect(account.id).toBe(id);
        expect(account.type).toBe('liability');
        expect(account.creditLimit).toBe(creditLimit);
        expect(account.paymentDueDay).toBe(paymentDueDay);
    });

    test('should throw error when name is empty', () => {
        // Arrange
        const id = '789';
        const emptyName = '';
        const now = new Date();

        // Act & Assert
        expect(() => {
            new Account(id, emptyName, 'asset', null, false, 0, 0, null, now, now);
        }).toThrow('Account name cannot be empty');
    });

    test('should rename account with valid name', () => {
        // Arrange
        const account = new Account(
            '789',
            'Checking',
            'asset',
            null,
            false,
            0,
            0,
            null,
            new Date(),
            new Date()
        );
        const originalUpdatedAt = account.updatedAt;

        // Act
        const newName = 'Primary Checking';
        account.rename(newName);

        // Assert
        expect(account.name).toBe(newName);
        expect(account.updatedAt).not.toBe(originalUpdatedAt);
    });

    test('should not rename account with empty name', () => {
        // Arrange
        const account = new Account(
            '789',
            'Checking',
            'asset',
            null,
            false,
            0,
            0,
            null,
            new Date(),
            new Date()
        );

        // Act & Assert
        expect(() => {
            account.rename('');
        }).toThrow('Account name cannot be empty');
    });

    test('should change type from asset to liability', () => {
        // Arrange
        const account = new Account(
            '789',
            'Account',
            'asset',
            null,
            false,
            500,
            0,
            null,
            new Date(),
            new Date()
        );
        const originalUpdatedAt = account.updatedAt;

        // Act
        account.changeType('liability');

        // Assert
        expect(account.type).toBe('liability');
        expect(account.updatedAt).not.toBe(originalUpdatedAt);
    });

    test('should change type from liability to asset', () => {
        // Arrange
        const account = new Account(
            '789',
            'Account',
            'liability',
            null,
            false,
            0,
            5000,
            15,
            new Date(),
            new Date()
        );

        // Act
        account.changeType('asset');

        // Assert
        expect(account.type).toBe('asset');
    });

    test('should set overdraft limit', () => {
        // Arrange
        const account = new Account(
            '789',
            'Checking',
            'asset',
            null,
            false,
            0,
            0,
            null,
            new Date(),
            new Date()
        );
        const originalUpdatedAt = account.updatedAt;

        // Act
        account.setOverdraftLimit(1000);

        // Assert
        expect(account.overdraftLimit).toBe(1000);
        expect(account.updatedAt).not.toBe(originalUpdatedAt);
    });

    test('should set credit limit', () => {
        // Arrange
        const account = new Account(
            '789',
            'Credit Card',
            'liability',
            null,
            false,
            0,
            0,
            null,
            new Date(),
            new Date()
        );
        const originalUpdatedAt = account.updatedAt;

        // Act
        account.setCreditLimit(5000);

        // Assert
        expect(account.creditLimit).toBe(5000);
        expect(account.updatedAt).not.toBe(originalUpdatedAt);
    });

    test('should set payment due day', () => {
        // Arrange
        const account = new Account(
            '789',
            'Credit Card',
            'liability',
            null,
            false,
            0,
            5000,
            null,
            new Date(),
            new Date()
        );
        const originalUpdatedAt = account.updatedAt;

        // Act
        account.setPaymentDueDay(20);

        // Assert
        expect(account.paymentDueDay).toBe(20);
        expect(account.updatedAt).not.toBe(originalUpdatedAt);
    });

    test('should toggle is_savings from false to true', () => {
        // Arrange
        const account = new Account(
            '789',
            'Account',
            'asset',
            null,
            false,
            500,
            0,
            null,
            new Date(),
            new Date()
        );
        const originalUpdatedAt = account.updatedAt;

        // Act
        account.toggleSavings();

        // Assert
        expect(account.isSavings).toBe(true);
        expect(account.updatedAt).not.toBe(originalUpdatedAt);
    });

    test('should toggle is_savings from true to false', () => {
        // Arrange
        const account = new Account(
            '789',
            'Savings Account',
            'asset',
            null,
            true,
            0,
            0,
            null,
            new Date(),
            new Date()
        );

        // Act
        account.toggleSavings();

        // Assert
        expect(account.isSavings).toBe(false);
    });

    test('should update IBAN', () => {
        // Arrange
        const account = new Account(
            '789',
            'Checking',
            'asset',
            'NL01BANK0123456789',
            false,
            0,
            0,
            null,
            new Date(),
            new Date()
        );
        const originalUpdatedAt = account.updatedAt;

        // Act
        const newIban = 'NL02BANK9876543210';
        account.changeIban(newIban);

        // Assert
        expect(account.iban).toBe(newIban);
        expect(account.updatedAt).not.toBe(originalUpdatedAt);
    });

    test('should create account without IBAN (null)', () => {
        // Arrange
        const id = '789';
        const name = 'Cash Account';
        const iban = null;
        const now = new Date();

        // Act
        const account = new Account(
            id,
            name,
            'asset',
            iban,
            false,
            0,
            0,
            null,
            now,
            now
        );

        // Assert
        expect(account.iban).toBeNull();
    });

    test('should throw error when overdraft limit is negative', () => {
        // Arrange
        const account = new Account(
            '789',
            'Checking',
            'asset',
            null,
            false,
            0,
            0,
            null,
            new Date(),
            new Date()
        );

        // Act & Assert
        expect(() => {
            account.setOverdraftLimit(-100);
        }).toThrow('Overdraft limit cannot be negative');
    });

    test('should throw error when credit limit is negative', () => {
        // Arrange
        const account = new Account(
            '789',
            'Credit Card',
            'liability',
            null,
            false,
            0,
            0,
            null,
            new Date(),
            new Date()
        );

        // Act & Assert
        expect(() => {
            account.setCreditLimit(-500);
        }).toThrow('Credit limit cannot be negative');
    });

    test('should throw error when payment due day is less than 1', () => {
        // Arrange
        const account = new Account(
            '789',
            'Credit Card',
            'liability',
            null,
            false,
            0,
            5000,
            null,
            new Date(),
            new Date()
        );

        // Act & Assert
        expect(() => {
            account.setPaymentDueDay(0);
        }).toThrow('Payment due day must be between 1 and 31');
    });

    test('should throw error when payment due day is greater than 31', () => {
        // Arrange
        const account = new Account(
            '789',
            'Credit Card',
            'liability',
            null,
            false,
            0,
            5000,
            null,
            new Date(),
            new Date()
        );

        // Act & Assert
        expect(() => {
            account.setPaymentDueDay(32);
        }).toThrow('Payment due day must be between 1 and 31');
    });

    test('should throw error when IBAN format is invalid', () => {
        // Arrange
        const id = '789';
        const name = 'Checking';
        const invalidIban = 'INVALID';
        const now = new Date();

        // Act & Assert
        expect(() => {
            new Account(id, name, 'asset', invalidIban, false, 0, 0, null, now, now);
        }).toThrow('Invalid IBAN format');
    });

    test('should accept valid IBAN format', () => {
        // Arrange
        const validIban = 'NL91ABNA0417164300';
        const now = new Date();

        // Act
        const account = new Account(
            '789',
            'Checking',
            'asset',
            validIban,
            false,
            0,
            0,
            null,
            now,
            now
        );

        // Assert
        expect(account.iban).toBe(validIban);
    });

    test('should accept null IBAN', () => {
        // Arrange
        const now = new Date();

        // Act
        const account = new Account(
            '789',
            'Checking',
            'asset',
            null,
            false,
            0,
            0,
            null,
            now,
            now
        );

        // Assert
        expect(account.iban).toBeNull();
    });
});