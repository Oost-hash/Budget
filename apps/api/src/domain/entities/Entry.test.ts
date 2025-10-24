import { describe, test, expect } from 'vitest';
import { Entry } from './Entry';
import { Money } from '@domain/value-objects/Money';

describe('Entry', () => {
    test('should create an entry with valid data', () => {
        // Arrange
        const id = 'entry-1';
        const transactionId = 'trans-1';
        const accountId = 'account-1';
        const amount = Money.fromAmount(-50);

        // Act
        const entry = new Entry(id, transactionId, accountId, amount);

        // Assert
        expect(entry.id).toBe(id);
        expect(entry.transactionId).toBe(transactionId);
        expect(entry.accountId).toBe(accountId);
        expect(entry.amount).toBe(amount);
        expect(entry.amount.amount).toBe(-50);
        expect(entry.amount.currency).toBe('EUR');
    });

    test('should throw error when amount is zero', () => {
        // Arrange
        const zeroAmount = Money.fromAmount(0);

        // Act & Assert
        expect(() => {
            new Entry('entry-1', 'trans-1', 'account-1', zeroAmount);
        }).toThrow('Entry amount cannot be zero');
    });

    test('should change amount successfully', () => {
        // Arrange
        const entry = new Entry(
            'entry-1',
            'trans-1',
            'account-1',
            Money.fromAmount(-50)
        );

        // Act
        const newAmount = Money.fromAmount(-75);
        entry.changeAmount(newAmount);

        // Assert
        expect(entry.amount.amount).toBe(-75);
        expect(entry.amount.currency).toBe('EUR');
    });

    test('should throw error when changing amount to zero', () => {
        // Arrange
        const entry = new Entry(
            'entry-1',
            'trans-1',
            'account-1',
            Money.fromAmount(-50)
        );

        // Act & Assert
        expect(() => {
            entry.changeAmount(Money.fromAmount(0));
        }).toThrow('Entry amount cannot be zero');
    });

    test('should allow positive amounts', () => {
        // Arrange
        const positiveAmount = Money.fromAmount(100);

        // Act
        const entry = new Entry('entry-1', 'trans-1', 'account-1', positiveAmount);

        // Assert
        expect(entry.amount.isPositive()).toBe(true);
        expect(entry.amount.amount).toBe(100);
    });

    test('should allow negative amounts', () => {
        // Arrange
        const negativeAmount = Money.fromAmount(-100);

        // Act
        const entry = new Entry('entry-1', 'trans-1', 'account-1', negativeAmount);

        // Assert
        expect(entry.amount.isNegative()).toBe(true);
        expect(entry.amount.amount).toBe(-100);
    });

    test('should support different currencies', () => {
        // Arrange
        const usdAmount = Money.fromAmount(50, 'USD');

        // Act
        const entry = new Entry('entry-1', 'trans-1', 'account-1', usdAmount);

        // Assert
        expect(entry.amount.currency).toBe('USD');
        expect(entry.amount.amount).toBe(50);
    });
});