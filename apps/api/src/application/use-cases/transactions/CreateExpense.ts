import { ITransactionRepository } from '@domain/repositories/ITransactionRepository';
import { IAccountRepository } from '@domain/repositories/IAccountRepository';
import { IPayeeRepository } from '@domain/repositories/IPayeeRepository';
import { ICategoryRepository } from '@domain/repositories/ICategoryRepository';
import { Transaction } from '@domain/entities/Transaction';
import { Money } from '@domain/value-objects/Money';
import { TransactionDTO } from '@application/dtos/TransactionDTO';
import { randomUUID } from 'crypto';

export interface CreateExpenseInput {
  date: string; // ISO date string
  description?: string | null;
  payeeId: string;
  categoryId: string;
  accountId: string;
  amount: number;
  currency?: string;
}

export class CreateExpense {
  constructor(
    private transactionRepo: ITransactionRepository,
    private accountRepo: IAccountRepository,
    private payeeRepo: IPayeeRepository,
    private categoryRepo: ICategoryRepository
  ) {}

  async execute(input: CreateExpenseInput): Promise<TransactionDTO> {
    // 1. Validate account exists
    const account = await this.accountRepo.findById(input.accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    // 2. Validate payee exists
    const payee = await this.payeeRepo.findById(input.payeeId);
    if (!payee) {
      throw new Error('Payee not found');
    }

    // 3. Validate category exists
    const category = await this.categoryRepo.findById(input.categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    // 4. Create money value object
    const amount = Money.fromAmount(input.amount, input.currency);

    // 5. Create transaction
    const transaction = Transaction.createExpense(
      randomUUID(),
      new Date(input.date),
      input.description ?? null,
      input.payeeId,
      input.categoryId,
      input.accountId,
      amount
    );

    // 6. Persist
    await this.transactionRepo.save(transaction);

    // 7. Return DTO
    return TransactionDTO.fromDomain(transaction);
  }
}