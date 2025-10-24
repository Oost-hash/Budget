import { ITransactionRepository } from '@domain/repositories/ITransactionRepository';
import { TransactionDTO } from '@application/dtos/TransactionDTO';

export interface GetTransactionByIdInput {
  id: string;
}

export class GetTransactionById {
  constructor(
    private transactionRepo: ITransactionRepository
  ) {}

  async execute(input: GetTransactionByIdInput): Promise<TransactionDTO> {
    // 1. Find transaction
    const transaction = await this.transactionRepo.findById(input.id);
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // 2. Convert to DTO
    return TransactionDTO.fromDomain(transaction);
  }
}