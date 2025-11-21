import { IPayeeRepository } from '@domain/repositories/IPayeeRepository';
import { Payee } from '@domain/entities/Payee';
import { IBAN } from '@domain/value-objects/IBAN';
import { PayeeDTO } from '@application/dtos/PayeeDTO';
import { ConflictError } from '@application/errors';
import { v4 as uuid } from 'uuid';

export interface CreatePayeeInput {
  name: string;
  iban?: string;
}

export class CreatePayee {
  constructor(
    private payeeRepo: IPayeeRepository
  ) {}

  async execute(input: CreatePayeeInput): Promise<PayeeDTO> {
    // 1. Validation: Check if name already exists
    const nameExists = await this.payeeRepo.existsByName(input.name);
    if (nameExists) {
      throw new ConflictError('Payee name already exists');
    }

    // 2. Validation: Check if IBAN already exists (if provided)
    if (input.iban) {
      const ibanExists = await this.payeeRepo.existsByIban(input.iban);
      if (ibanExists) {
        throw new ConflictError('IBAN already exists');
      }
    }

    // 3. Create IBAN value object
    const iban = input.iban ? IBAN.create(input.iban) : null;

    // 4. Create domain entity using constructor
    const payee = new Payee(
      uuid(),
      input.name,
      iban
    );

    // 5. Persist
    await this.payeeRepo.save(payee);

    // 6. Return DTO
    return PayeeDTO.fromDomain(payee);
  }
}