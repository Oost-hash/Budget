import { ITransactionRepository } from '@domain/repositories/ITransactionRepository';
import { IPayeeRepository } from '@domain/repositories/IPayeeRepository';
import { ICategoryRepository } from '@domain/repositories/ICategoryRepository';
import { TransactionDTO } from '@application/dtos/TransactionDTO';
import { NotFoundError, ValidationError } from '@application/errors';

export interface UpdateTransactionInput {
  id: string;
  date?: string; // ISO date string
  description?: string | null;
  payeeId?: string | null;
  categoryId?: string | null;
}

export class UpdateTransaction {
  constructor(
    private transactionRepo: ITransactionRepository,
    private payeeRepo: IPayeeRepository,
    private categoryRepo: ICategoryRepository
  ) {}

  async execute(input: UpdateTransactionInput): Promise<TransactionDTO> {
    // 1. Find existing transaction
    const transaction = await this.transactionRepo.findById(input.id);
    if (!transaction) {
      throw new NotFoundError('Transaction not found');
    }

    // 2. Update date if provided
    if (input.date !== undefined) {
      transaction.updateDate(new Date(input.date));
    }

    // 3. Update description if provided
    if (input.description !== undefined) {
      transaction.updateDescription(input.description);
    }

    // 4. Update payeeId if provided (and validate business rules)
    if (input.payeeId !== undefined) {
      // Validate type-specific rules
      if (transaction.type === 'transfer' && input.payeeId !== null) {
        throw new ValidationError('Transfer cannot have a payee');
      }

      if ((transaction.type === 'income' || transaction.type === 'expense') && input.payeeId === null) {
        throw new ValidationError(`${transaction.type} must have a payee`);
      }

      // Validate payee exists (if not null)
      if (input.payeeId !== null) {
        const payee = await this.payeeRepo.findById(input.payeeId);
        if (!payee) {
          throw new NotFoundError('Payee not found');
        }
      }

      // Note: We can't update payeeId directly on the transaction entity
      // This would require adding an updatePayee method or similar
      // For now, we'll throw an error suggesting to delete and recreate
      throw new ValidationError('Cannot update payee - delete and recreate transaction instead');
    }

    // 5. Update categoryId if provided (and validate business rules)
    if (input.categoryId !== undefined) {
      // Validate type-specific rules
      if (transaction.type === 'transfer' && input.categoryId !== null) {
        throw new ValidationError('Transfer cannot have a category');
      }

      if ((transaction.type === 'income' || transaction.type === 'expense') && input.categoryId === null) {
        throw new ValidationError(`${transaction.type} must have a category`);
      }

      // Validate category exists (if not null)
      if (input.categoryId !== null) {
        const category = await this.categoryRepo.findById(input.categoryId);
        if (!category) {
          throw new NotFoundError('Category not found');
        }
      }

      // Note: Same issue as payeeId - we'd need to add updateCategory method
      // For now, throw an error
      throw new ValidationError('Cannot update category - delete and recreate transaction instead');
    }

    // 6. Persist
    await this.transactionRepo.save(transaction);

    // 7. Return DTO
    return TransactionDTO.fromDomain(transaction);
  }
}