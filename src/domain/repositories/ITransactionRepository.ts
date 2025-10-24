import { Transaction } from '@domain/entities/Transaction';

export interface ITransactionRepository {
  // Basic CRUD
  save(transaction: Transaction): Promise<void>;
  findById(id: string): Promise<Transaction | null>;
  findAll(): Promise<Transaction[]>;
  delete(id: string): Promise<void>;
  
  // Query methods
  findByAccountId(accountId: string): Promise<Transaction[]>;
  findByPayeeId(payeeId: string): Promise<Transaction[]>;
  findByCategoryId(categoryId: string): Promise<Transaction[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]>;
  
  // Validation helpers
  exists(id: string): Promise<boolean>;
  hasTransactionsForPayee(payeeId: string): Promise<boolean>;
}