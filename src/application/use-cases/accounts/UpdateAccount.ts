import { IAccountRepository } from '@domain/repositories/IAccountRepository';
import { AccountDTO } from '@application/dtos/AccountDTO';
import { Money } from '@domain/value-objects/Money';
import { IBAN } from '@domain/value-objects/IBAN';
import { ExpectedPaymentDueDate } from '@domain/value-objects/ExpectedPaymentDueDate';

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
      throw new Error('Account not found');
    }

    // 2. Update name if provided
    if (input.name !== undefined) {
      // Check if new name already exists (on different account)
      const nameExists = await this.accountRepo.existsByName(input.name);
      if (nameExists && account.name !== input.name) {
        throw new Error('Account name already exists');
      }
      account.rename(input.name);
    }

    // 3. Update type if provided
    if (input.type !== undefined) {
      account.changeType(input.type);
    }

    // 4. Update IBAN if provided
    if (input.iban !== undefined) {
      if (input.iban === null) {
        account.changeIban(null);
      } else {
        // Check if new IBAN already exists
        const ibanExists = await this.accountRepo.existsByIban(input.iban);
        if (ibanExists && account.iban?.toString() !== input.iban) {
          throw new Error('IBAN already exists');
        }
        account.changeIban(IBAN.create(input.iban));
      }
    }

    // 5. Update isSavings if provided
    if (input.isSavings !== undefined && account.isSavings !== input.isSavings) {
      account.toggleSavings();
    }

    // 6. Update overdraftLimit if provided
    if (input.overdraftLimit !== undefined) {
      const newLimit = Money.fromAmount(
        input.overdraftLimit.amount,
        input.overdraftLimit.currency
      );
      account.setOverdraftLimit(newLimit);
    }

    // 7. Update creditLimit if provided
    if (input.creditLimit !== undefined) {
      const newLimit = Money.fromAmount(
        input.creditLimit.amount,
        input.creditLimit.currency
      );
      account.setCreditLimit(newLimit);
    }

    // 8. Update paymentDueDate if provided
    if (input.paymentDueDate !== undefined) {
      if (input.paymentDueDate === null) {
        account.setPaymentDueDate(null);
      } else {
        const newDueDate = ExpectedPaymentDueDate.create(
          input.paymentDueDate.dayOfMonth,
          input.paymentDueDate.shiftDirection
        );
        account.setPaymentDueDate(newDueDate);
      }
    }

    // 9. Persist
    await this.accountRepo.save(account);

    // 10. Return DTO
    return AccountDTO.fromDomain(account);
  }
}