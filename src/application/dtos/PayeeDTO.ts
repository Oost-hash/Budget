import { Payee } from '@domain/entities/Payee';

export interface PayeeDTO {
  id: string;
  name: string;
  iban: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export class PayeeDTO {
  static fromDomain(payee: Payee): PayeeDTO {
    return {
      id: payee.id,
      name: payee.name,
      iban: payee.iban?.toString() ?? null,
    };
  }
}