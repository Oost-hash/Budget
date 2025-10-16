import { describe, test, expect } from 'vitest';
import { Transaction } from './Transaction';

describe('Transaction', () => {
    const now = new Date();

    describe('Transfer', () => {
        test('should create a valid transfer transaction', () => {
            // Act
            const transaction = Transaction.createTransfer(
                '1',
                now,
                'Transfer to savings',
                'checking-123',
                'savings-456',
                200,
            );

            // Assert
            expect(transaction.type).toBe('transfer');
            expect(transaction.payeeId).toBeNull();
            expect(transaction.categoryId).toBeNull();
            expect(transaction.entries).toHaveLength(2);
            expect(transaction.entries[0]!.amount).toBe(-200);
            expect(transaction.entries[1]!.amount).toBe(200);
        });

        test('should have balanced entries (sum = 0)', () => {
            // Act
            const transaction = Transaction.createTransfer(
                '1',
                now,
                null,
                'checking-123',
                'savings-456',
                200,
            );

            // Assert
            const sum = transaction.entries.reduce((acc, e) => acc + e.amount, 0);
            expect(sum).toBe(0);
        });

        test('should throw error when transfer amount is negative', () => {
            // Act & Assert
            expect(() => {
                Transaction.createTransfer(
                    '1',
                    now,
                    null,
                    'checking-123',
                    'savings-456',
                    -200
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
            // Act
            const transaction = Transaction.createIncome(
                '2',
                now,
                'Salary payment',
                'employer-123',
                'salary-456',
                'checking-789',
                2000
            );

            // Assert
            expect(transaction.type).toBe('income');
            expect(transaction.payeeId).toBe('employer-123');
            expect(transaction.categoryId).toBe('salary-456');
            expect(transaction.entries).toHaveLength(1);
            expect(transaction.entries[0]!.amount).toBe(2000);
        });

        test('should throw error when income amount is negative', () => {
            // Act & Assert
            expect(() => {
                Transaction.createIncome(
                    '2',
                    now,
                    null,
                    'employer-123',
                    'salary-456',
                    'checking-789',
                    -2000
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
            // Act
            const transaction = Transaction.createExpense(
                '3',
                now,
                'Groceries',
                'albert-heijn-123',
                'groceries-456',
                'checking-789',
                50
            );

            // Assert
            expect(transaction.type).toBe('expense');
            expect(transaction.payeeId).toBe('albert-heijn-123');
            expect(transaction.categoryId).toBe('groceries-456');
            expect(transaction.entries).toHaveLength(1);
            expect(transaction.entries[0]!.amount).toBe(-50);
        });

        test('should throw error when expense amount is negative', () => {
            // Act & Assert
            expect(() => {
                Transaction.createExpense(
                    '3',
                    now,
                    null,
                    'payee-123',
                    'category-456',
                    'checking-789',
                    -50
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

            // Act & Assert
            expect(() => {
                Transaction.createExpense(
                    '3',
                    futureDate,
                    null,
                    'payee-123',
                    'category-456',
                    'checking-789',
                    50
                );
            }).toThrow('Transaction date cannot be in the future');
        });

        test('should update date successfully', () => {
            // Arrange
            const transaction = Transaction.createExpense(
                '3',
                now,
                null,
                'payee-123',
                'category-456',
                'checking-789',
                50
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
            const transaction = Transaction.createExpense(
                '3',
                now,
                'Original description',
                'payee-123',
                'category-456',
                'checking-789',
                50
            );

            // Act
            transaction.updateDescription('New description');

            // Assert
            expect(transaction.description).toBe('New description');
        });
    });
});