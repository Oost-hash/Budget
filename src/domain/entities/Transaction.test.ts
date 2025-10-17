import { describe, test, expect } from 'vitest';
import { Transaction } from './Transaction';
import { Money } from '@domain/value-objects/Money';

describe('Transaction', () => {
    const now = new Date();

    describe('Transfer', () => {
        test('should create a valid transfer transaction', () => {
            // Arrange
            const amount = Money.fromAmount(200);

            // Act
            const transaction = Transaction.createTransfer(
                '1',
                now,
                'Transfer to savings',
                'checking-123',
                'savings-456',
                amount,
            );

            // Assert
            expect(transaction.type).toBe('transfer');
            expect(transaction.payeeId).toBeNull();
            expect(transaction.categoryId).toBeNull();
            expect(transaction.entries).toHaveLength(2);
            expect(transaction.entries[0]!.amount.amount).toBe(-200);
            expect(transaction.entries[1]!.amount.amount).toBe(200);
        });

        test('should have balanced entries (sum = 0)', () => {
            // Arrange
            const amount = Money.fromAmount(200);

            // Act
            const transaction = Transaction.createTransfer(
                '1',
                now,
                null,
                'checking-123',
                'savings-456',
                amount,
            );

            // Assert
            const sum = transaction.entries.reduce(
                (acc, e) => acc.add(e.amount),
                Money.fromAmount(0)
            );
            expect(sum.isZero()).toBe(true);
        });

        test('should throw error when transfer amount is not positive', () => {
            // Arrange
            const negativeAmount = Money.fromAmount(-200);

            // Act & Assert
            expect(() => {
                Transaction.createTransfer(
                    '1',
                    now,
                    null,
                    'checking-123',
                    'savings-456',
                    negativeAmount
                );
            }).toThrow('Transfer amount must be positive');
        });

        test('should throw error when transfer amount is zero', () => {
            // Arrange
            const zeroAmount = Money.fromAmount(0);

            // Act & Assert
            expect(() => {
                Transaction.createTransfer(
                    '1',
                    now,
                    null,
                    'checking-123',
                    'savings-456',
                    zeroAmount
                );
            }).toThrow('Transfer amount must be positive');
        });

        test('should throw error when transfer has payee', () => {
            // Act & Assert
            expect(() => {
                new Transaction('1', 'transfer', now, null, 'payee-123', null);
            }).toThrow('Transfer cannot have a payee');
        });

        test('should throw error when transfer has category', () => {
            // Act & Assert
            expect(() => {
                new Transaction('1', 'transfer', now, null, null, 'category-123');
            }).toThrow('Transfer cannot have a category');
        });
    });

    describe('Income', () => {
        test('should create a valid income transaction', () => {
            // Arrange
            const amount = Money.fromAmount(2000);

            // Act
            const transaction = Transaction.createIncome(
                '2',
                now,
                'Salary payment',
                'employer-123',
                'salary-456',
                'checking-789',
                amount
            );

            // Assert
            expect(transaction.type).toBe('income');
            expect(transaction.payeeId).toBe('employer-123');
            expect(transaction.categoryId).toBe('salary-456');
            expect(transaction.entries).toHaveLength(1);
            expect(transaction.entries[0]!.amount.amount).toBe(2000);
            expect(transaction.entries[0]!.amount.isPositive()).toBe(true);
        });

        test('should throw error when income amount is not positive', () => {
            // Arrange
            const negativeAmount = Money.fromAmount(-2000);

            // Act & Assert
            expect(() => {
                Transaction.createIncome(
                    '2',
                    now,
                    null,
                    'employer-123',
                    'salary-456',
                    'checking-789',
                    negativeAmount
                );
            }).toThrow('Income amount must be positive');
        });

        test('should throw error when income has no payee', () => {
            // Act & Assert
            expect(() => {
                new Transaction('2', 'income', now, null, null, 'category-123');
            }).toThrow('income must have a payee');
        });

        test('should throw error when income has no category', () => {
            // Act & Assert
            expect(() => {
                new Transaction('2', 'income', now, null, 'payee-123', null);
            }).toThrow('income must have a category');
        });
    });

    describe('Expense', () => {
        test('should create a valid expense transaction', () => {
            // Arrange
            const amount = Money.fromAmount(50);

            // Act
            const transaction = Transaction.createExpense(
                '3',
                now,
                'Groceries',
                'albert-heijn-123',
                'groceries-456',
                'checking-789',
                amount
            );

            // Assert
            expect(transaction.type).toBe('expense');
            expect(transaction.payeeId).toBe('albert-heijn-123');
            expect(transaction.categoryId).toBe('groceries-456');
            expect(transaction.entries).toHaveLength(1);
            expect(transaction.entries[0]!.amount.amount).toBe(-50);
            expect(transaction.entries[0]!.amount.isNegative()).toBe(true);
        });

        test('should throw error when expense amount is not positive', () => {
            // Arrange
            const negativeAmount = Money.fromAmount(-50);

            // Act & Assert
            expect(() => {
                Transaction.createExpense(
                    '3',
                    now,
                    null,
                    'payee-123',
                    'category-456',
                    'checking-789',
                    negativeAmount
                );
            }).toThrow('Expense amount must be positive');
        });

        test('should throw error when expense has no payee', () => {
            // Act & Assert
            expect(() => {
                new Transaction('3', 'expense', now, null, null, 'category-123');
            }).toThrow('expense must have a payee');
        });

        test('should throw error when expense has no category', () => {
            // Act & Assert
            expect(() => {
                new Transaction('3', 'expense', now, null, 'payee-123', null);
            }).toThrow('expense must have a category');
        });
    });

    describe('Date validation', () => {
        test('should throw error when date is in the future', () => {
            // Arrange
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);
            const amount = Money.fromAmount(50);

            // Act & Assert
            expect(() => {
                Transaction.createExpense(
                    '3',
                    futureDate,
                    null,
                    'payee-123',
                    'category-456',
                    'checking-789',
                    amount
                );
            }).toThrow('Transaction date cannot be in the future');
        });

        test('should update date successfully', () => {
            // Arrange
            const amount = Money.fromAmount(50);
            const transaction = Transaction.createExpense(
                '3',
                now,
                null,
                'payee-123',
                'category-456',
                'checking-789',
                amount
            );

            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);

            // Act
            transaction.updateDate(yesterday);

            // Assert
            expect(transaction.date).toBe(yesterday);
        });
    });

    describe('Description updates', () => {
        test('should update description', () => {
            // Arrange
            const amount = Money.fromAmount(50);
            const transaction = Transaction.createExpense(
                '3',
                now,
                'Original description',
                'payee-123',
                'category-456',
                'checking-789',
                amount
            );

            // Act
            transaction.updateDescription('New description');

            // Assert
            expect(transaction.description).toBe('New description');
        });
    });
});