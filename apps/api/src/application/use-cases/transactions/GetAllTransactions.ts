import { ITransactionRepository } from '@domain/repositories/ITransactionRepository';
import { TransactionDTO } from '@application/dtos/TransactionDTO';

export class GetAllTransactions {
  constructor(
    private transactionRepo: ITransactionRepository
  ) {}

  async execute(): Promise<TransactionDTO[]> {
    // 1. Get all transactions from repository (sorted by date DESC)
    const transactions = await this.transactionRepo.findAll();

    // 2. Convert to DTOs
    return transactions.map(TransactionDTO.fromDomain);
  }
}