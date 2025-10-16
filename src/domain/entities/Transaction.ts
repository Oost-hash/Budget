import { Entry } from './Entry';

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
        amount: number,

    ): Transaction {
        if (amount <= 0) {
            throw new Error('Transfer amount must be positive');
        }

        const transaction = new Transaction(
            id,
            'transfer',
            date,
            description,
            null, // geen payee bij transfer
            null, // geen category bij transfer
        );

        // Create 2 entries
        const entryIdFrom = `${id}-from`;
        const entryIdTo = `${id}-to`;

        transaction.addEntry(
            new Entry(entryIdFrom, id, fromAccountId, -amount)
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
        amount: number
    ): Transaction {
        if (amount <= 0) {
            throw new Error('Income amount must be positive');
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
        amount: number
    ): Transaction {
        if (amount <= 0) {
            throw new Error('Expense amount must be positive');
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
            new Entry(entryId, id, accountId, -amount)
        );

        return transaction;
    }

    addEntry(entry: Entry): void {
        if (entry.transactionId !== this.id) {
            throw new Error('Entry must belong to this transaction');
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
            throw new Error('Transaction date cannot be in the future');
        }
    }

    private validateTypeRules(
        type: TransactionType,
        payeeId: string | null,
        categoryId: string | null
    ): void {
        if (type === 'transfer') {
            if (payeeId !== null) {
                throw new Error('Transfer cannot have a payee');
            }
            if (categoryId !== null) {
                throw new Error('Transfer cannot have a category');
            }
        }

        if (type === 'income' || type === 'expense') {
            if (!payeeId) {
                throw new Error(`${type} must have a payee`);
            }
            if (!categoryId) {
                throw new Error(`${type} must have a category`);
            }
        }
    }

    private validateEntriesForType(): void {
        const entryCount = this._entries.length;

        if (this._type === 'transfer') {
            if (entryCount > 2) {
                throw new Error('Transfer must have exactly 2 entries');
            }
            if (entryCount === 2) {
                const sum = this._entries.reduce((acc, e) => acc + e.amount, 0);
                if (Math.abs(sum) > 0.001) {
                    // floating point tolerance
                    throw new Error('Transfer entries must be balanced (sum = 0)');
                }
            }
        }

        if (this._type === 'income' || this._type === 'expense') {
            // Check entries
            if (this._entries.length !== 1) {
                throw new Error(`${this._type} must have exactly 1 entry`);
            }

            const entry = this._entries[0];
            if (!entry) {
                throw new Error('Entry not found');
            }

            // Validate amount
            if (this._type === 'income' && entry.amount <= 0) {
                throw new Error('Income entry must have positive amount');
            }
            if (this._type === 'expense' && entry.amount >= 0) {
                throw new Error('Expense entry must have negative amount');
            }
        }
    }
}