import { describe, test, expect } from 'vitest';
import { Account } from './Account';
import { Money } from '@domain/value-objects/Money';
import { IBAN } from '@domain/value-objects/IBAN';

describe('Account', () => {
    test('should create asset account with valid data', () => {
        // Arrange
        const id = '789';
        const name = 'Checking Account';
        const type = 'asset';
        const iban = IBAN.create('NL01BANK0123456789');
        const isSavings = false;
        const overdraftLimit = Money.fromAmount(500);
        const creditLimit = Money.fromAmount(0);

        // Act
        const account = new Account(
            id,
            name,
            type,
            iban,
            isSavings,
            overdraftLimit,
            creditLimit,
        );

        // Assert
        expect(account.id).toBe(id);
        expect(account.name).toBe(name);
        expect(account.type).toBe(type);
        expect(account.iban?.toString()).toBe('NL01BANK0123456789');
        expect(account.isSavings).toBe(isSavings);
        expect(account.overdraftLimit.amount).toBe(500);
        expect(account.creditLimit.amount).toBe(0);
    });

    test('should create liability account with valid data', () => {
        // Arrange
        const id = '790';
        const name = 'Credit Card';
        const type = 'liability';
        const iban = null;
        const isSavings = false;
        const overdraftLimit = Money.fromAmount(0);
        const creditLimit = Money.fromAmount(5000);

        // Act
        const account = new Account(
            id,
            name,
            type,
            iban,
            isSavings,
            overdraftLimit,
            creditLimit,
        );

        // Assert
        expect(account.id).toBe(id);
        expect(account.type).toBe('liability');
        expect(account.creditLimit.amount).toBe(5000);
    });

    test('should throw error when name is empty', () => {
        // Arrange
        const id = '789';
        const emptyName = '';

        // Act & Assert
        expect(() => {
            new Account(
                id,
                emptyName,
                'asset',
                null,
                false,
                Money.fromAmount(0),
                Money.fromAmount(0),
                null
            );
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
            Money.fromAmount(0),
            Money.fromAmount(0),
            null,
        );
        // Act
        const newName = 'Primary Checking';
        account.rename(newName);

        // Assert
        expect(account.name).toBe(newName);
    });

    test('should not rename account with empty name', () => {
        // Arrange
        const account = new Account(
            '789',
            'Checking',
            'asset',
            null,
            false,
            Money.fromAmount(0),
            Money.fromAmount(0),
            null,
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
            Money.fromAmount(500),
            Money.fromAmount(0),
            null,
        );

        // Act
        account.changeType('liability');

        // Assert
        expect(account.type).toBe('liability');
    });

    test('should change type from liability to asset', () => {
        // Arrange
        const account = new Account(
            '789',
            'Account',
            'liability',
            null,
            false,
            Money.fromAmount(0),
            Money.fromAmount(5000),
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
            Money.fromAmount(0),
            Money.fromAmount(0),
            null,
        );

        // Act
        account.setOverdraftLimit(Money.fromAmount(1000));

        // Assert
        expect(account.overdraftLimit.amount).toBe(1000);
    });

    test('should set credit limit', () => {
        // Arrange
        const account = new Account(
            '789',
            'Credit Card',
            'liability',
            null,
            false,
            Money.fromAmount(0),
            Money.fromAmount(0),
            null,
        );

        // Act
        account.setCreditLimit(Money.fromAmount(5000));

        // Assert
        expect(account.creditLimit.amount).toBe(5000);
    });

    test('should set payment due date', () => {
        // Arrange
        const account = new Account(
            '789',
            'Credit Card',
            'liability',
            null,
            false,
            Money.fromAmount(0),
            Money.fromAmount(5000),
            null,
        );

        // Act

        // Assert
    });

    test('should clear payment due date by setting to null', () => {
        // Arrange
        const account = new Account(
            '789',
            'Credit Card',
            'liability',
            null,
            false,
            Money.fromAmount(0),
            Money.fromAmount(5000),
        );

        // Act

        // Assert
    });

    test('should toggle is_savings from false to true', () => {
        // Arrange
        const account = new Account(
            '789',
            'Account',
            'asset',
            null,
            false,
            Money.fromAmount(500),
            Money.fromAmount(0),
            null,
        );

        // Act
        account.toggleSavings();

        // Assert
        expect(account.isSavings).toBe(true);
    });

    test('should toggle is_savings from true to false', () => {
        // Arrange
        const account = new Account(
            '789',
            'Savings Account',
            'asset',
            null,
            true,
            Money.fromAmount(0),
            Money.fromAmount(0),
            null,
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
            IBAN.create('NL01BANK0123456789'),
            false,
            Money.fromAmount(0),
            Money.fromAmount(0),
            null,
        );

        // Act
        const newIban = IBAN.create('NL02BANK9876543210');
        account.changeIban(newIban);

        // Assert
        expect(account.iban?.toString()).toBe('NL02BANK9876543210');
    });

    test('should create account without IBAN (null)', () => {
        // Arrange
        const id = '789';
        const name = 'Cash Account';
        const iban = null;

        // Act
        const account = new Account(
            id,
            name,
            'asset',
            iban,
            false,
            Money.fromAmount(0),
            Money.fromAmount(0),
            null,
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
            Money.fromAmount(0),
            Money.fromAmount(0),
            null,
        );

        // Act & Assert
        expect(() => {
            account.setOverdraftLimit(Money.fromAmount(-100));
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
            Money.fromAmount(0),
            Money.fromAmount(0),
            null,
        );

        // Act & Assert
        expect(() => {
            account.setCreditLimit(Money.fromAmount(-500));
        }).toThrow('Credit limit cannot be negative');
    });

    test('should throw error when IBAN format is invalid', () => {
        // Arrange
        const invalidIban = 'INVALID';

        // Act & Assert
        expect(() => {
            IBAN.create(invalidIban);
        }).toThrow('Invalid IBAN');
    });

    test('should accept valid IBAN format', () => {
        // Arrange
        const validIban = IBAN.create('NL91ABNA0417164300');

        // Act
        const account = new Account(
            '789',
            'Checking',
            'asset',
            validIban,
            false,
            Money.fromAmount(0),
            Money.fromAmount(0),
            null,
        );

        // Assert
        expect(account.iban?.toString()).toBe('NL91ABNA0417164300');
    });

    test('should accept null IBAN', () => {
        // Act
        const account = new Account(
            '789',
            'Checking',
            'asset',
            null,
            false,
            Money.fromAmount(0),
            Money.fromAmount(0),
            null,
        );

        // Assert
        expect(account.iban).toBeNull();
    });

    test('should support different currencies for limits', () => {
        // Arrange
        const account = new Account(
            '789',
            'USD Account',
            'asset',
            null,
            false,
            Money.fromAmount(1000, 'USD'),
            Money.fromAmount(0, 'USD'),
            null,
        );

        // Assert
        expect(account.overdraftLimit.currency).toBe('USD');
        expect(account.overdraftLimit.amount).toBe(1000);
    });

    test('should set IBAN to null', () => {
        // Arrange
        const account = new Account(
            '789',
            'Checking',
            'asset',
            IBAN.create('NL01BANK0123456789'),
            false,
            Money.fromAmount(0),
            Money.fromAmount(0),
            null,
        );

        // Act
        account.changeIban(null);

        // Assert
        expect(account.iban).toBeNull();
    });

    test('should get country code from IBAN', () => {
        // Arrange
        const iban = IBAN.create('DE89370400440532013000');
        const account = new Account(
            '789',
            'German Account',
            'asset',
            iban,
            false,
            Money.fromAmount(0),
            Money.fromAmount(0),
            null,
        );

        // Assert
        expect(account.iban?.getCountryCode()).toBe('DE');
    });

    test('should format IBAN with spaces', () => {
        // Arrange
        const iban = IBAN.create('NL91ABNA0417164300');
        const account = new Account(
            '789',
            'Checking',
            'asset',
            iban,
            false,
            Money.fromAmount(0),
            Money.fromAmount(0),
            null,
        );

        // Assert
        expect(account.iban?.format()).toBe('NL91 ABNA 0417 1643 00');
    });

    test('should support different shift directions for payment due date', () => {
        // Arrange

        // Assert
    });
});