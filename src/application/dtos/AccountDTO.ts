import { Account } from '@domain/entities/Account';

export interface AccountDTO {
  id: string;
  name: string;
  type: 'asset' | 'liability';
  iban: string | null;
  isSavings: boolean;
  overdraftLimit: {
    amount: number;
    currency: string;
  };
  creditLimit: {
    amount: number;
    currency: string;
  };
  paymentDueDate: {
    dayOfMonth: number;
    shiftDirection: 'before' | 'after' | 'none';
  } | null;
  created_at?: Date;
  updated_at?: Date;
}

export class AccountDTO {
  static fromDomain(account: Account): AccountDTO {
    return {
      id: account.id,
      name: account.name,
      type: account.type,
      iban: account.iban?.toString() ?? null,
      isSavings: account.isSavings,
      overdraftLimit: {
        amount: account.overdraftLimit.amount,
        currency: account.overdraftLimit.currency,
      },
      creditLimit: {
        amount: account.creditLimit.amount,
        currency: account.creditLimit.currency,
      },
      paymentDueDate: account.paymentDueDate
        ? {
            dayOfMonth: account.paymentDueDate.getDayOfMonth(),
            shiftDirection: account.paymentDueDate.getShiftDirection(),
          }
        : null,
    };
  }
}