import { Account } from '@domain/entities/Account';
import { AccountEntity } from '../entities/AccountEntity';
import { Money } from '@domain/value-objects/Money';
import { IBAN } from '@domain/value-objects/IBAN';

export class AccountMapper {
  // Database → Domain
  static toDomain(entity: AccountEntity): Account {
    const iban = entity.iban ? IBAN.create(entity.iban) : null;
    
    const overdraftLimit = Money.fromAmount(
      entity.overdraft_limit_amount,
      entity.overdraft_limit_currency
    );
    
    const creditLimit = Money.fromAmount(
      entity.credit_limit_amount,
      entity.credit_limit_currency
    );

    return new Account(
      entity.id,
      entity.name,
      entity.type,
      iban,
      entity.is_savings,
      overdraftLimit,
      creditLimit
    );
  }

  // Domain → Database
  static toEntity(account: Account): AccountEntity {
    const entity = new AccountEntity();
    entity.id = account.id;
    entity.name = account.name;
    entity.type = account.type;
    entity.iban = account.iban?.toString() ?? null;
    entity.is_savings = account.isSavings;
    entity.overdraft_limit_amount = account.overdraftLimit.amount;
    entity.overdraft_limit_currency = account.overdraftLimit.currency;
    entity.credit_limit_amount = account.creditLimit.amount;
    entity.credit_limit_currency = account.creditLimit.currency;
    return entity;
  }
}