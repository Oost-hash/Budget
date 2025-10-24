import { Entry } from '@domain/entities/Entry';
import { EntryEntity } from '../entities/EntryEntity';
import { Money } from '@domain/value-objects/Money';

export class EntryMapper {
  // Database → Domain
  static toDomain(entity: EntryEntity): Entry {
    const amount = Money.fromAmount(entity.amount, entity.currency);

    return new Entry(
      entity.id,
      entity.transaction_id,
      entity.account_id,
      amount
    );
  }

  // Domain → Database
  static toEntity(entry: Entry): EntryEntity {
    const entity = new EntryEntity();
    entity.id = entry.id;
    entity.transaction_id = entry.transactionId;
    entity.account_id = entry.accountId;
    entity.amount = entry.amount.amount;
    entity.currency = entry.amount.currency;
    return entity;
  }
}