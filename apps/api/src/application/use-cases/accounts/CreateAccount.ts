import { IAccountRepository } from '@domain/repositories/IAccountRepository';
import { Account } from '@domain/entities/Account';
import { AccountDTO } from '@application/dtos/AccountDTO';
import { Money } from '@domain/value-objects/Money';
import { IBAN } from '@domain/value-objects/IBAN';
import { ExpectedPaymentDueDate } from '@domain/value-objects/ExpectedPaymentDueDate';
import { ConflictError } from '@application/errors';
import { v4 as uuid } from 'uuid';

export interface CreateAccountInput {
  name: string;
  type: 'asset' | 'liability';
  iban?: string | null;
  isSavings?: boolean;
  overdraftLimit?: { amount: number; currency?: string };
  creditLimit?: { amount: number; currency?: string };
  paymentDueDate?: { dayOfMonth: number; shiftDirection: 'before' | 'after' | 'none' } | null;
}

export class CreateAccount {
  constructor(
    private accountRepo: IAccountRepository
  ) {}

  async execute(input: CreateAccountInput): Promise<AccountDTO> {
    // 1. Validation: Check if name already exists
    const nameExists = await this.accountRepo.existsByName(input.name);
    if (nameExists) {
      throw new ConflictError('Account name already exists');
    }

    // 2. Validation: Check if IBAN already exists (if provided)
    if (input.iban) {
      const ibanExists = await this.accountRepo.existsByIban(input.iban);
      if (ibanExists) {
        throw new ConflictError('IBAN already exists');
      }
    }

    // 3. Create value objects
    const iban = input.iban ? IBAN.create(input.iban) : null;
    
    const overdraftLimit = input.overdraftLimit
      ? Money.fromAmount(input.overdraftLimit.amount, input.overdraftLimit.currency)
      : Money.fromAmount(0);
    
    const creditLimit = input.creditLimit
      ? Money.fromAmount(input.creditLimit.amount, input.creditLimit.currency)
      : Money.fromAmount(0);
    
    const paymentDueDate = input.paymentDueDate
      ? ExpectedPaymentDueDate.create(input.paymentDueDate.dayOfMonth, input.paymentDueDate.shiftDirection)
      : null;

    // 4. Create domain entity
    const account = new Account(
      uuid(),
      input.name,
      input.type,
      iban,
      input.isSavings ?? false,
      overdraftLimit,
      creditLimit,
      paymentDueDate
    );

    // 5. Persist
    await this.accountRepo.save(account);

    // 6. Return DTO
    return AccountDTO.fromDomain(account);
  }
}