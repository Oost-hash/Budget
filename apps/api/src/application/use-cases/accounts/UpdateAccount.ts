import { IAccountRepository } from '@domain/repositories/IAccountRepository';
import { AccountDTO } from '@application/dtos/AccountDTO';
import { Money } from '@domain/value-objects/Money';
import { IBAN } from '@domain/value-objects/IBAN';
import { ExpectedPaymentDueDate } from '@domain/value-objects/ExpectedPaymentDueDate';
import { NotFoundError, ConflictError } from '@application/errors';

export interface UpdateAccountInput {
  id: string;
  name?: string;
  type?: 'asset' | 'liability';
  iban?: string | null;
  isSavings?: boolean;
  overdraftLimit?: { amount: number; currency?: string };
  creditLimit?: { amount: number; currency?: string };
  paymentDueDate?: { dayOfMonth: number; shiftDirection: 'before' | 'after' | 'none' } | null;
}

export class UpdateAccount {
  constructor(
    private accountRepo: IAccountRepository
  ) {}

  async execute(input: UpdateAccountInput): Promise<AccountDTO> {
    // 1. Find existing account
    const account = await this.accountRepo.findById(input.id);
    if (!account) {
      throw new NotFoundError('Account not found');
    }

    // 2. Validation: Check if new name already exists (on different account)
    if (input.name && input.name !== account.name) {
      const nameExists = await this.accountRepo.existsByName(input.name);
      if (nameExists) {
        throw new ConflictError('Account name already exists');
      }
    }

    // 3. Validation: Check if new IBAN already exists (on different account)
    if (input.iban !== undefined) {
      const currentIban = account.iban?.toString() ?? null;
      if (input.iban && input.iban !== currentIban) {
        const ibanExists = await this.accountRepo.existsByIban(input.iban);
        if (ibanExists) {
          throw new ConflictError('IBAN already exists');
        }
      }
    }

    // 4. Update domain entity using correct method names
    if (input.name) {
      account.rename(input.name); 
    }

    if (input.type) {
      account.changeType(input.type); 
    }

    if (input.iban !== undefined) {
      const iban = input.iban ? IBAN.create(input.iban) : null;
      account.changeIban(iban); 
    }

    if (input.isSavings !== undefined) {
      // Special case: toggleSavings() is a toggle, not a setter
      // Only toggle if different from current value
      if (input.isSavings !== account.isSavings) {
        account.toggleSavings(); 
      }
    }

    if (input.overdraftLimit) {
      const limit = Money.fromAmount(
        input.overdraftLimit.amount,
        input.overdraftLimit.currency
      );
      account.setOverdraftLimit(limit); 
    }

    if (input.creditLimit) {
      const limit = Money.fromAmount(
        input.creditLimit.amount,
        input.creditLimit.currency
      );
      account.setCreditLimit(limit); 
    }

    if (input.paymentDueDate !== undefined) {
      const dueDate = input.paymentDueDate
        ? ExpectedPaymentDueDate.create(
            input.paymentDueDate.dayOfMonth,
            input.paymentDueDate.shiftDirection
          )
        : null;
      account.setPaymentDueDate(dueDate);
    }

    // 5. Persist
    await this.accountRepo.save(account);

    // 6. Return DTO
    return AccountDTO.fromDomain(account);
  }
}