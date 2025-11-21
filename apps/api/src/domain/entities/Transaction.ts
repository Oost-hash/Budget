import { Entry } from './Entry';
import { Money } from '@domain/value-objects/Money';
import { DomainError } from '@domain/errors';

export type TransactionType = 'income' | 'expense' | 'transfer';

export class Transaction {
    private _entries: Entry[] = [];

    constructor(
        public readonly id: string,
        private _type: TransactionType,
        private _date: Date,
        private _description: string | null,
        private _payeeId: string | null,
        private _categoryId: string | null,
    ) {
        this.validateDate(_date);
        this.validateTypeRules(_type, _payeeId, _categoryId);
    }

    get type(): TransactionType {
        return this._type;
    }

    get date(): Date {
        return this._date;
    }

    get description(): string | null {
        return this._description;
    }

    get payeeId(): string | null {
        return this._payeeId;
    }

    get categoryId(): string | null {
        return this._categoryId;
    }

    get entries(): ReadonlyArray<Entry> {
        return this._entries;
    }

    // Factory methods voor correcte transacties
    static createTransfer(
        id: string,
        date: Date,
        description: string | null,
        fromAccountId: string,
        toAccountId: string,
        amount: Money,
    ): Transaction {
        if (amount.isNegative() || amount.isZero()) {
            throw new DomainError('Transfer amount must be positive');
        }

        const transaction = new Transaction(
            id,
            'transfer',
            date,
            description,
            null,
            null,
        );

        // Create 2 entries
        const entryIdFrom = `${id}-from`;
        const entryIdTo = `${id}-to`;

        transaction.addEntry(
            new Entry(entryIdFrom, id, fromAccountId, amount.negate())
        );
        transaction.addEntry(
            new Entry(entryIdTo, id, toAccountId, amount)
        );

        return transaction;
    }

    static createIncome(
        id: string,
        date: Date,
        description: string | null,
        payeeId: string,
        categoryId: string,
        accountId: string,
        amount: Money
    ): Transaction {
        if (amount.isNegative() || amount.isZero()) {
            throw new DomainError('Income amount must be positive');
        }

        const transaction = new Transaction(
            id,
            'income',
            date,
            description,
            payeeId,
            categoryId,
        );

        const entryId = `${id}-entry`;
        transaction.addEntry(
            new Entry(entryId, id, accountId, amount)
        );

        return transaction;
    }

    static createExpense(
        id: string,
        date: Date,
        description: string | null,
        payeeId: string,
        categoryId: string,
        accountId: string,
        amount: Money
    ): Transaction {
        if (amount.isNegative() || amount.isZero()) {
            throw new DomainError('Expense amount must be positive');
        }

        const transaction = new Transaction(
            id,
            'expense',
            date,
            description,
            payeeId,
            categoryId,
        );

        const entryId = `${id}-entry`;
        transaction.addEntry(
            new Entry(entryId, id, accountId, amount.negate())
        );

        return transaction;
    }

    addEntry(entry: Entry): void {
        if (entry.transactionId !== this.id) {
            throw new DomainError('Entry must belong to this transaction');
        }

        this._entries.push(entry);
        this.validateEntriesForType();
    }

    updateDescription(description: string | null): void {
        this._description = description;
    }

    updateDate(date: Date): void {
        this.validateDate(date);
        this._date = date;
    }

    private validateDate(date: Date): void {
        const now = new Date();
        if (date > now) {
            throw new DomainError('Transaction date cannot be in the future');
        }
    }

    private validateTypeRules(
        type: TransactionType,
        payeeId: string | null,
        categoryId: string | null
    ): void {
        if (type === 'transfer') {
            if (payeeId !== null) {
                throw new DomainError('Transfer cannot have a payee');
            }
            if (categoryId !== null) {
                throw new DomainError('Transfer cannot have a category');
            }
        }

        if (type === 'income' || type === 'expense') {
            if (!payeeId) {
                throw new DomainError(`${type} must have a payee`);
            }
            if (!categoryId) {
                throw new DomainError(`${type} must have a category`);
            }
        }
    }

    private validateEntriesForType(): void {
        const entryCount = this._entries.length;

        if (this._type === 'transfer') {
            if (entryCount > 2) {
                throw new DomainError('Transfer must have exactly 2 entries');
            }
            if (entryCount === 2) {
                const firstEntry = this._entries[0];
                if (!firstEntry) {
                    throw new DomainError('Entry not found');
                }

                // Start accumulator with 0 in the same currency as entries
                let sum = Money.fromAmount(0, firstEntry.amount.currency);

                for (const entry of this._entries) {
                    sum = sum.add(entry.amount);
                }

                if (!sum.isZero()) {
                    throw new DomainError('Transfer entries must be balanced (sum = 0)');
                }
            }
        }

        if (this._type === 'income' || this._type === 'expense') {
            if (this._entries.length !== 1) {
                throw new DomainError(`${this._type} must have exactly 1 entry`);
            }

            const entry = this._entries[0];
            if (!entry) {
                throw new DomainError('Entry not found');
            }

            if (this._type === 'income' && !entry.amount.isPositive()) {
                throw new DomainError('Income entry must have positive amount');
            }
            if (this._type === 'expense' && !entry.amount.isNegative()) {
                throw new DomainError('Expense entry must have negative amount');
            }
        }
    }
}