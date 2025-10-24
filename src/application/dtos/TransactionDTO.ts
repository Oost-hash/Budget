import { Transaction } from '@domain/entities/Transaction';

export interface EntryDTO {
  id: string;
  transactionId: string;
  accountId: string;
  amount: number;
  currency: string;
}

export interface TransactionDTO {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  date: string; // ISO date string
  description: string | null;
  payeeId: string | null;
  categoryId: string | null;
  entries: EntryDTO[];
  createdAt: string;
  updatedAt: string;
}

export class TransactionDTO {
  static fromDomain(transaction: Transaction): TransactionDTO {
    return {
      id: transaction.id,
      type: transaction.type,
      date: transaction.date.toISOString(),
      description: transaction.description,
      payeeId: transaction.payeeId,
      categoryId: transaction.categoryId,
      entries: transaction.entries.map(entry => ({
        id: entry.id,
        transactionId: entry.transactionId,
        accountId: entry.accountId,
        amount: entry.amount.amount,
        currency: entry.amount.currency
      })),
      createdAt: new Date().toISOString(), // These will come from DB in real scenario
      updatedAt: new Date().toISOString()
    };
  }
}