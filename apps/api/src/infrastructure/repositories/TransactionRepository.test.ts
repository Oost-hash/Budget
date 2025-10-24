import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { DataSource } from 'typeorm';
import { TransactionRepository } from './TransactionRepository';
import { Transaction } from '@domain/entities/Transaction';
import { Money } from '@domain/value-objects/Money';
import { TransactionEntity } from '../database/entities/TransactionEntity';
import { EntryEntity } from '../database/entities/EntryEntity';
import { AccountEntity } from '../database/entities/AccountEntity';
import { PayeeEntity } from '../database/entities/PayeeEntity';
import { CategoryEntity } from '../database/entities/CategoryEntity';
import { GroupEntity } from '@infrastructure/database/entities/GroupEntity';

describe('TransactionRepository', () => {
    let dataSource: DataSource;
    let repository: TransactionRepository;

    beforeEach(async () => {
        dataSource = new DataSource({
            type: 'better-sqlite3',
            database: ':memory:',
            synchronize: true,
            entities: [TransactionEntity, EntryEntity, AccountEntity, PayeeEntity, CategoryEntity, GroupEntity],
        });

        await dataSource.initialize();
        repository = new TransactionRepository(dataSource);
    });

    afterEach(async () => {
        await dataSource.destroy();
    });

    describe('save and findById', () => {
        test('should save and retrieve a transfer transaction', async () => {
            // Arrange - create accounts
            const accountRepo = dataSource.getRepository(AccountEntity);
            await accountRepo.save({
                id: 'checking-1',
                name: 'Checking',
                type: 'asset',
                iban: null,
                is_savings: false,
                overdraft_limit_amount: 0,
                overdraft_limit_currency: 'EUR',
                credit_limit_amount: 0,
                credit_limit_currency: 'EUR',
                payment_due_day: null,
                payment_due_shift: null
            });
            await accountRepo.save({
                id: 'savings-1',
                name: 'Savings',
                type: 'asset',
                iban: null,
                is_savings: true,
                overdraft_limit_amount: 0,
                overdraft_limit_currency: 'EUR',
                credit_limit_amount: 0,
                credit_limit_currency: 'EUR',
                payment_due_day: null,
                payment_due_shift: null
            });

            const transaction = Transaction.createTransfer(
                'trans-1',
                new Date('2024-01-15'),
                'Transfer to savings',
                'checking-1',
                'savings-1',
                Money.fromAmount(200)
            );

            // Act
            await repository.save(transaction);
            const found = await repository.findById('trans-1');

            // Assert
            expect(found).not.toBeNull();
            expect(found!.id).toBe('trans-1');
            expect(found!.type).toBe('transfer');
            expect(found!.description).toBe('Transfer to savings');
            expect(found!.payeeId).toBeNull();
            expect(found!.categoryId).toBeNull();
            expect(found!.entries).toHaveLength(2);

            // Check entries
            const fromEntry = found!.entries.find(e => e.amount.isNegative());
            const toEntry = found!.entries.find(e => e.amount.isPositive());

            expect(fromEntry?.accountId).toBe('checking-1');
            expect(fromEntry?.amount.amount).toBe(-200);
            expect(toEntry?.accountId).toBe('savings-1');
            expect(toEntry?.amount.amount).toBe(200);
        });

        test('should save and retrieve an income transaction', async () => {
            // Arrange - create dependencies
            const accountRepo = dataSource.getRepository(AccountEntity);
            await accountRepo.save({
                id: 'checking-1',
                name: 'Checking',
                type: 'asset',
                iban: null,
                is_savings: false,
                overdraft_limit_amount: 0,
                overdraft_limit_currency: 'EUR',
                credit_limit_amount: 0,
                credit_limit_currency: 'EUR',
                payment_due_day: null,
                payment_due_shift: null
            });

            const payeeRepo = dataSource.getRepository(PayeeEntity);
            await payeeRepo.save({
                id: 'employer-1',
                name: 'Employer',
                iban: null
            });

            const categoryRepo = dataSource.getRepository(CategoryEntity);
            await categoryRepo.save({
                id: 'salary-1',
                name: 'Salary',
                group_id: null,
                position: 1
            });

            const transaction = Transaction.createIncome(
                'trans-2',
                new Date('2024-01-31'),
                'Monthly salary',
                'employer-1',
                'salary-1',
                'checking-1',
                Money.fromAmount(3000)
            );

            // Act
            await repository.save(transaction);
            const found = await repository.findById('trans-2');

            // Assert
            expect(found).not.toBeNull();
            expect(found!.type).toBe('income');
            expect(found!.payeeId).toBe('employer-1');
            expect(found!.categoryId).toBe('salary-1');
            expect(found!.entries).toHaveLength(1);
            expect(found!.entries[0]!.amount.amount).toBe(3000);
            expect(found!.entries[0]!.accountId).toBe('checking-1');
        });

        test('should save and retrieve an expense transaction', async () => {
            // Arrange - create dependencies
            const accountRepo = dataSource.getRepository(AccountEntity);
            await accountRepo.save({
                id: 'checking-1',
                name: 'Checking',
                type: 'asset',
                iban: null,
                is_savings: false,
                overdraft_limit_amount: 0,
                overdraft_limit_currency: 'EUR',
                credit_limit_amount: 0,
                credit_limit_currency: 'EUR',
                payment_due_day: null,
                payment_due_shift: null
            });

            const payeeRepo = dataSource.getRepository(PayeeEntity);
            await payeeRepo.save({
                id: 'ah-1',
                name: 'Albert Heijn',
                iban: null
            });

            const categoryRepo = dataSource.getRepository(CategoryEntity);
            await categoryRepo.save({
                id: 'groceries-1',
                name: 'Groceries',
                group_id: null,
                position: 1
            });

            const transaction = Transaction.createExpense(
                'trans-3',
                new Date('2024-01-20'),
                'Weekly groceries',
                'ah-1',
                'groceries-1',
                'checking-1',
                Money.fromAmount(75)
            );

            // Act
            await repository.save(transaction);
            const found = await repository.findById('trans-3');

            // Assert
            expect(found).not.toBeNull();
            expect(found!.type).toBe('expense');
            expect(found!.payeeId).toBe('ah-1');
            expect(found!.categoryId).toBe('groceries-1');
            expect(found!.entries).toHaveLength(1);
            expect(found!.entries[0]!.amount.amount).toBe(-75);
            expect(found!.entries[0]!.accountId).toBe('checking-1');
        });
    });

    describe('findAll', () => {
        test('should return all transactions ordered by date desc', async () => {
            // Arrange - create test data
            const accountRepo = dataSource.getRepository(AccountEntity);
            await accountRepo.save({
                id: 'checking-1',
                name: 'Checking',
                type: 'asset',
                iban: null,
                is_savings: false,
                overdraft_limit_amount: 0,
                overdraft_limit_currency: 'EUR',
                credit_limit_amount: 0,
                credit_limit_currency: 'EUR',
                payment_due_day: null,
                payment_due_shift: null
            });
            await accountRepo.save({
                id: 'savings-1',
                name: 'Savings',
                type: 'asset',
                iban: null,
                is_savings: true,
                overdraft_limit_amount: 0,
                overdraft_limit_currency: 'EUR',
                credit_limit_amount: 0,
                credit_limit_currency: 'EUR',
                payment_due_day: null,
                payment_due_shift: null
            });

            const trans1 = Transaction.createTransfer(
                'trans-1',
                new Date('2024-01-15'),
                null,
                'checking-1',
                'savings-1',
                Money.fromAmount(100)
            );

            const trans2 = Transaction.createTransfer(
                'trans-2',
                new Date('2024-01-20'),
                null,
                'checking-1',
                'savings-1',
                Money.fromAmount(200)
            );

            await repository.save(trans1);
            await repository.save(trans2);

            // Act
            const all = await repository.findAll();

            // Assert
            expect(all).toHaveLength(2);
            expect(all[0]!.id).toBe('trans-2'); // Most recent first
            expect(all[1]!.id).toBe('trans-1');
        });
    });

    describe('delete', () => {
        test('should delete transaction and cascade delete entries', async () => {
            // Arrange
            const accountRepo = dataSource.getRepository(AccountEntity);
            await accountRepo.save({
                id: 'checking-1',
                name: 'Checking',
                type: 'asset',
                iban: null,
                is_savings: false,
                overdraft_limit_amount: 0,
                overdraft_limit_currency: 'EUR',
                credit_limit_amount: 0,
                credit_limit_currency: 'EUR',
                payment_due_day: null,
                payment_due_shift: null
            });
            await accountRepo.save({
                id: 'savings-1',
                name: 'Savings',
                type: 'asset',
                iban: null,
                is_savings: true,
                overdraft_limit_amount: 0,
                overdraft_limit_currency: 'EUR',
                credit_limit_amount: 0,
                credit_limit_currency: 'EUR',
                payment_due_day: null,
                payment_due_shift: null
            });

            const transaction = Transaction.createTransfer(
                'trans-1',
                new Date('2024-01-15'),
                null,
                'checking-1',
                'savings-1',
                Money.fromAmount(200)
            );

            await repository.save(transaction);

            // Act
            await repository.delete('trans-1');

            // Assert
            const found = await repository.findById('trans-1');
            expect(found).toBeNull();

            // Verify entries are also deleted
            const entryRepo = dataSource.getRepository(EntryEntity);
            const entries = await entryRepo.find({ where: { transaction_id: 'trans-1' } });
            expect(entries).toHaveLength(0);
        });
    });

    describe('findByAccountId', () => {
        test('should find all transactions for a specific account', async () => {
            // Arrange
            const accountRepo = dataSource.getRepository(AccountEntity);
            await accountRepo.save({
                id: 'checking-1',
                name: 'Checking',
                type: 'asset',
                iban: null,
                is_savings: false,
                overdraft_limit_amount: 0,
                overdraft_limit_currency: 'EUR',
                credit_limit_amount: 0,
                credit_limit_currency: 'EUR',
                payment_due_day: null,
                payment_due_shift: null
            });
            await accountRepo.save({
                id: 'savings-1',
                name: 'Savings',
                type: 'asset',
                iban: null,
                is_savings: true,
                overdraft_limit_amount: 0,
                overdraft_limit_currency: 'EUR',
                credit_limit_amount: 0,
                credit_limit_currency: 'EUR',
                payment_due_day: null,
                payment_due_shift: null
            });
            await accountRepo.save({
                id: 'other-1',
                name: 'Other',
                type: 'asset',
                iban: null,
                is_savings: false,
                overdraft_limit_amount: 0,
                overdraft_limit_currency: 'EUR',
                credit_limit_amount: 0,
                credit_limit_currency: 'EUR',
                payment_due_day: null,
                payment_due_shift: null
            });

            const trans1 = Transaction.createTransfer(
                'trans-1',
                new Date('2024-01-15'),
                null,
                'checking-1',
                'savings-1',
                Money.fromAmount(100)
            );

            const trans2 = Transaction.createTransfer(
                'trans-2',
                new Date('2024-01-20'),
                null,
                'checking-1',
                'other-1',
                Money.fromAmount(50)
            );

            await repository.save(trans1);
            await repository.save(trans2);

            // Act
            const transactions = await repository.findByAccountId('checking-1');

            // Assert
            expect(transactions).toHaveLength(2);
            expect(transactions.every(t =>
                t.entries.some(e => e.accountId === 'checking-1')
            )).toBe(true);
        });
    });

    describe('findByPayeeId', () => {
        test('should find all transactions for a specific payee', async () => {
            // Arrange
            const accountRepo = dataSource.getRepository(AccountEntity);
            await accountRepo.save({
                id: 'checking-1',
                name: 'Checking',
                type: 'asset',
                iban: null,
                is_savings: false,
                overdraft_limit_amount: 0,
                overdraft_limit_currency: 'EUR',
                credit_limit_amount: 0,
                credit_limit_currency: 'EUR',
                payment_due_day: null,
                payment_due_shift: null
            });

            const payeeRepo = dataSource.getRepository(PayeeEntity);
            await payeeRepo.save({ id: 'ah-1', name: 'Albert Heijn', iban: null });

            const categoryRepo = dataSource.getRepository(CategoryEntity);
            await categoryRepo.save({
                id: 'groceries-1',
                name: 'Groceries',
                group_id: null,
                position: 1
            });

            const trans1 = Transaction.createExpense(
                'trans-1',
                new Date('2024-01-15'),
                null,
                'ah-1',
                'groceries-1',
                'checking-1',
                Money.fromAmount(50)
            );

            const trans2 = Transaction.createExpense(
                'trans-2',
                new Date('2024-01-20'),
                null,
                'ah-1',
                'groceries-1',
                'checking-1',
                Money.fromAmount(75)
            );

            await repository.save(trans1);
            await repository.save(trans2);

            // Act
            const transactions = await repository.findByPayeeId('ah-1');

            // Assert
            expect(transactions).toHaveLength(2);
            expect(transactions.every(t => t.payeeId === 'ah-1')).toBe(true);
        });
    });

    describe('findByCategoryId', () => {
        test('should find all transactions for a specific category', async () => {
            // Arrange
            const accountRepo = dataSource.getRepository(AccountEntity);
            await accountRepo.save({
                id: 'checking-1',
                name: 'Checking',
                type: 'asset',
                iban: null,
                is_savings: false,
                overdraft_limit_amount: 0,
                overdraft_limit_currency: 'EUR',
                credit_limit_amount: 0,
                credit_limit_currency: 'EUR',
                payment_due_day: null,
                payment_due_shift: null
            });

            const payeeRepo = dataSource.getRepository(PayeeEntity);
            await payeeRepo.save({ id: 'ah-1', name: 'Albert Heijn', iban: null });

            const categoryRepo = dataSource.getRepository(CategoryEntity);
            await categoryRepo.save({
                id: 'groceries-1',
                name: 'Groceries',
                group_id: null,
                position: 1
            });

            const trans1 = Transaction.createExpense(
                'trans-1',
                new Date('2024-01-15'),
                null,
                'ah-1',
                'groceries-1',
                'checking-1',
                Money.fromAmount(50)
            );

            await repository.save(trans1);

            // Act
            const transactions = await repository.findByCategoryId('groceries-1');

            // Assert
            expect(transactions).toHaveLength(1);
            expect(transactions[0]!.categoryId).toBe('groceries-1');
        });
    });

    describe('findByDateRange', () => {
        test('should find transactions within date range', async () => {
            // Arrange
            const accountRepo = dataSource.getRepository(AccountEntity);
            await accountRepo.save({
                id: 'checking-1',
                name: 'Checking',
                type: 'asset',
                iban: null,
                is_savings: false,
                overdraft_limit_amount: 0,
                overdraft_limit_currency: 'EUR',
                credit_limit_amount: 0,
                credit_limit_currency: 'EUR',
                payment_due_day: null,
                payment_due_shift: null
            });
            await accountRepo.save({
                id: 'savings-1',
                name: 'Savings',
                type: 'asset',
                iban: null,
                is_savings: true,
                overdraft_limit_amount: 0,
                overdraft_limit_currency: 'EUR',
                credit_limit_amount: 0,
                credit_limit_currency: 'EUR',
                payment_due_day: null,
                payment_due_shift: null
            });

            const trans1 = Transaction.createTransfer(
                'trans-1',
                new Date('2024-01-10'),
                null,
                'checking-1',
                'savings-1',
                Money.fromAmount(100)
            );

            const trans2 = Transaction.createTransfer(
                'trans-2',
                new Date('2024-01-20'),
                null,
                'checking-1',
                'savings-1',
                Money.fromAmount(200)
            );

            const trans3 = Transaction.createTransfer(
                'trans-3',
                new Date('2024-02-05'),
                null,
                'checking-1',
                'savings-1',
                Money.fromAmount(300)
            );

            await repository.save(trans1);
            await repository.save(trans2);
            await repository.save(trans3);

            // Act
            const transactions = await repository.findByDateRange(
                new Date('2024-01-15'),
                new Date('2024-01-31')
            );

            // Assert
            expect(transactions).toHaveLength(1);
            expect(transactions[0]!.id).toBe('trans-2');
        });
    });

    describe('exists', () => {
        test('should return true for existing transaction', async () => {
            // Arrange
            const accountRepo = dataSource.getRepository(AccountEntity);
            await accountRepo.save({
                id: 'checking-1',
                name: 'Checking',
                type: 'asset',
                iban: null,
                is_savings: false,
                overdraft_limit_amount: 0,
                overdraft_limit_currency: 'EUR',
                credit_limit_amount: 0,
                credit_limit_currency: 'EUR',
                payment_due_day: null,
                payment_due_shift: null
            });
            await accountRepo.save({
                id: 'savings-1',
                name: 'Savings',
                type: 'asset',
                iban: null,
                is_savings: true,
                overdraft_limit_amount: 0,
                overdraft_limit_currency: 'EUR',
                credit_limit_amount: 0,
                credit_limit_currency: 'EUR',
                payment_due_day: null,
                payment_due_shift: null
            });

            const transaction = Transaction.createTransfer(
                'trans-1',
                new Date(),
                null,
                'checking-1',
                'savings-1',
                Money.fromAmount(100)
            );
            await repository.save(transaction);

            // Act
            const exists = await repository.exists('trans-1');

            // Assert
            expect(exists).toBe(true);
        });

        test('should return false for non-existent transaction', async () => {
            // Act
            const exists = await repository.exists('non-existent');

            // Assert
            expect(exists).toBe(false);
        });
    });

    describe('hasTransactionsForPayee', () => {
        test('should return true when payee has transactions', async () => {
            // Arrange
            const accountRepo = dataSource.getRepository(AccountEntity);
            await accountRepo.save({
                id: 'checking-1',
                name: 'Checking',
                type: 'asset',
                iban: null,
                is_savings: false,
                overdraft_limit_amount: 0,
                overdraft_limit_currency: 'EUR',
                credit_limit_amount: 0,
                credit_limit_currency: 'EUR',
                payment_due_day: null,
                payment_due_shift: null
            });

            const payeeRepo = dataSource.getRepository(PayeeEntity);
            await payeeRepo.save({ id: 'ah-1', name: 'Albert Heijn', iban: null });

            const categoryRepo = dataSource.getRepository(CategoryEntity);
            await categoryRepo.save({
                id: 'groceries-1',
                name: 'Groceries',
                group_id: null,
                position: 1
            });

            const transaction = Transaction.createExpense(
                'trans-1',
                new Date(),
                null,
                'ah-1',
                'groceries-1',
                'checking-1',
                Money.fromAmount(50)
            );
            await repository.save(transaction);

            // Act
            const hasTransactions = await repository.hasTransactionsForPayee('ah-1');

            // Assert
            expect(hasTransactions).toBe(true);
        });

        test('should return false when payee has no transactions', async () => {
            // Arrange
            const payeeRepo = dataSource.getRepository(PayeeEntity);
            await payeeRepo.save({ id: 'ah-1', name: 'Albert Heijn', iban: null });

            // Act
            const hasTransactions = await repository.hasTransactionsForPayee('ah-1');

            // Assert
            expect(hasTransactions).toBe(false);
        });
    });

    describe('cascade behavior', () => {
        test('should set transaction.payee_id to null when payee is deleted', async () => {
            // Arrange
            const accountRepo = dataSource.getRepository(AccountEntity);
            await accountRepo.save({
                id: 'checking-1',
                name: 'Checking',
                type: 'asset',
                iban: null,
                is_savings: false,
                overdraft_limit_amount: 0,
                overdraft_limit_currency: 'EUR',
                credit_limit_amount: 0,
                credit_limit_currency: 'EUR',
                payment_due_day: null,
                payment_due_shift: null
            });

            const payeeRepo = dataSource.getRepository(PayeeEntity);
            await payeeRepo.save({ id: 'ah-1', name: 'Albert Heijn', iban: null });

            const categoryRepo = dataSource.getRepository(CategoryEntity);
            await categoryRepo.save({
                id: 'groceries-1',
                name: 'Groceries',
                group_id: null,
                position: 1
            });

            const transaction = Transaction.createExpense(
                'trans-1',
                new Date(),
                null,
                'ah-1',
                'groceries-1',
                'checking-1',
                Money.fromAmount(50)
            );
            await repository.save(transaction);

            // Act - delete payee
            await payeeRepo.delete('ah-1');

            // Assert - Check raw database to verify payee_id was set to null
            const transactionRepo = dataSource.getRepository(TransactionEntity);
            const rawTransaction = await transactionRepo.findOne({
                where: { id: 'trans-1' }
            });

            expect(rawTransaction).not.toBeNull();
            expect(rawTransaction!.payee_id).toBeNull(); // Database level check

            // Note: We can't use repository.findById() here because the domain entity
            // would fail validation (expense must have payee). This is correct behavior!
            // The transaction is now in an invalid state according to our domain rules.
        });

        test('should set transaction.category_id to null when category is deleted', async () => {
            // Arrange
            const accountRepo = dataSource.getRepository(AccountEntity);
            await accountRepo.save({
                id: 'checking-1',
                name: 'Checking',
                type: 'asset',
                iban: null,
                is_savings: false,
                overdraft_limit_amount: 0,
                overdraft_limit_currency: 'EUR',
                credit_limit_amount: 0,
                credit_limit_currency: 'EUR',
                payment_due_day: null,
                payment_due_shift: null
            });

            const payeeRepo = dataSource.getRepository(PayeeEntity);
            await payeeRepo.save({ id: 'ah-1', name: 'Albert Heijn', iban: null });

            const categoryRepo = dataSource.getRepository(CategoryEntity);
            await categoryRepo.save({
                id: 'groceries-1',
                name: 'Groceries',
                group_id: null,
                position: 1
            });

            const transaction = Transaction.createExpense(
                'trans-1',
                new Date(),
                null,
                'ah-1',
                'groceries-1',
                'checking-1',
                Money.fromAmount(50)
            );
            await repository.save(transaction);

            // Act - delete category
            await categoryRepo.delete('groceries-1');

            // Assert - Check raw database to verify category_id was set to null
            const transactionRepo = dataSource.getRepository(TransactionEntity);
            const rawTransaction = await transactionRepo.findOne({
                where: { id: 'trans-1' }
            });

            expect(rawTransaction).not.toBeNull();
            expect(rawTransaction!.category_id).toBeNull(); // Database level check

            // Note: We can't use repository.findById() here because the domain entity
            // would fail validation (expense must have category). This is correct behavior!
            // The transaction is now in an invalid state according to our domain rules.
        });
    });
});