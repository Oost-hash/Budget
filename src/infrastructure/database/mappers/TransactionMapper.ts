import { Transaction } from '@domain/entities/Transaction';
import { TransactionEntity } from '../entities/TransactionEntity';
import { EntryMapper } from './EntryMapper';

export class TransactionMapper {
  // Database → Domain
  static toDomain(entity: TransactionEntity): Transaction {
    // Create transaction without entries first
    const transaction = new Transaction(
      entity.id,
      entity.type as 'income' | 'expense' | 'transfer',
      entity.date,
      entity.description,
      entity.payee_id,
      entity.category_id
    );

    // Add entries (they're loaded via eager: true)
    if (entity.entries && entity.entries.length > 0) {
      entity.entries.forEach(entryEntity => {
        const entry = EntryMapper.toDomain(entryEntity);
        transaction.addEntry(entry);
      });
    }

    return transaction;
  }

  // Domain → Database
  static toEntity(transaction: Transaction): TransactionEntity {
    const entity = new TransactionEntity();
    entity.id = transaction.id;
    entity.type = transaction.type;
    entity.date = transaction.date;
    entity.description = transaction.description;
    entity.payee_id = transaction.payeeId;
    entity.category_id = transaction.categoryId;

    // Map entries
    entity.entries = transaction.entries.map(entry => 
      EntryMapper.toEntity(entry)
    );

    return entity;
  }
}