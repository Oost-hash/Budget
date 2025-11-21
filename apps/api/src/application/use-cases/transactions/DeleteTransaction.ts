import { ITransactionRepository } from '@domain/repositories/ITransactionRepository';
import { NotFoundError } from '@application/errors';

export interface DeleteTransactionInput {
  id: string;
}

export class DeleteTransaction {
  constructor(
    private transactionRepo: ITransactionRepository
  ) {}

  async execute(input: DeleteTransactionInput): Promise<void> {
    // 1. Check if transaction exists
    const transaction = await this.transactionRepo.findById(input.id);
    if (!transaction) {
      throw new NotFoundError('Transaction not found');
    }

    // 2. Delete transaction
    // Note: Entries will be CASCADE deleted by database
    await this.transactionRepo.delete(input.id);

    // No return value for delete operations
  }
}