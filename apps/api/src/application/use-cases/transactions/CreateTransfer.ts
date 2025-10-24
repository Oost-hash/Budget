import { ITransactionRepository } from '@domain/repositories/ITransactionRepository';
import { IAccountRepository } from '@domain/repositories/IAccountRepository';
import { Transaction } from '@domain/entities/Transaction';
import { Money } from '@domain/value-objects/Money';
import { TransactionDTO } from '@application/dtos/TransactionDTO';
import { randomUUID } from 'crypto';

export interface CreateTransferInput {
  date: string; // ISO date string
  description?: string | null;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency?: string;
}

export class CreateTransfer {
  constructor(
    private transactionRepo: ITransactionRepository,
    private accountRepo: IAccountRepository
  ) {}

  async execute(input: CreateTransferInput): Promise<TransactionDTO> {
    // 1. Validate accounts exist
    const fromAccount = await this.accountRepo.findById(input.fromAccountId);
    if (!fromAccount) {
      throw new Error('From account not found');
    }

    const toAccount = await this.accountRepo.findById(input.toAccountId);
    if (!toAccount) {
      throw new Error('To account not found');
    }

    // 2. Validate same account transfer
    if (input.fromAccountId === input.toAccountId) {
      throw new Error('Cannot transfer to the same account');
    }

    // 3. Create money value object
    const amount = Money.fromAmount(input.amount, input.currency);

    // 4. Create transaction
    const transaction = Transaction.createTransfer(
      randomUUID(),
      new Date(input.date),
      input.description ?? null,
      input.fromAccountId,
      input.toAccountId,
      amount
    );

    // 5. Persist
    await this.transactionRepo.save(transaction);

    // 6. Return DTO
    return TransactionDTO.fromDomain(transaction);
  }
}