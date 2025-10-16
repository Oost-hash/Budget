import { describe, test, expect } from 'vitest';
import { Entry } from './Entry';

describe('Entry', () => {
    test('should create an entry with valid data', () => {
        // Arrange
        const id = 'entry-1';
        const transactionId = 'trans-1';
        const accountId = 'account-1';
        const amount = -50;
        const now = new Date();

        // Act
        const entry = new Entry(id, transactionId, accountId, amount, now, now);

        // Assert
        expect(entry.id).toBe(id);
        expect(entry.transactionId).toBe(transactionId);
        expect(entry.accountId).toBe(accountId);
        expect(entry.amount).toBe(amount);
        expect(entry.createdAt).toBe(now);
        expect(entry.updatedAt).toBe(now);
    });

    test('should throw error when amount is zero', () => {
        // Arrange
        const now = new Date();

        // Act & Assert
        expect(() => {
            new Entry('entry-1', 'trans-1', 'account-1', 0, now, now);
        }).toThrow('Entry amount cannot be zero');
    });

    test('should change amount successfully', () => {
        // Arrange
        const entry = new Entry('entry-1', 'trans-1', 'account-1', -50, new Date(), new Date());
        const originalUpdatedAt = entry.updatedAt;

        // Act
        entry.changeAmount(-75);

        // Assert
        expect(entry.amount).toBe(-75);
        expect(entry.updatedAt).not.toBe(originalUpdatedAt);
    });

    test('should throw error when changing amount to zero', () => {
        // Arrange
        const entry = new Entry('entry-1', 'trans-1', 'account-1', -50, new Date(), new Date());

        // Act & Assert
        expect(() => {
            entry.changeAmount(0);
        }).toThrow('Entry amount cannot be zero');
    });
});