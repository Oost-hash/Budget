import { IPayeeRepository } from '@domain/repositories/IPayeeRepository';
import { PayeeDTO } from '@application/dtos/PayeeDTO';
import { IBAN } from '@domain/value-objects/IBAN';

export interface UpdatePayeeInput {
  id: string;
  name?: string;
  iban?: string | null;
}

export class UpdatePayee {
  constructor(
    private payeeRepo: IPayeeRepository
  ) {}

  async execute(input: UpdatePayeeInput): Promise<PayeeDTO> {
    // 1. Find existing payee
    const payee = await this.payeeRepo.findById(input.id);
    if (!payee) {
      throw new Error('Payee not found');
    }

    // 2. Update name if provided
    if (input.name !== undefined) {
      // Check if new name already exists (on different payee)
      const nameExists = await this.payeeRepo.existsByName(input.name);
      if (nameExists && payee.name !== input.name) {
        throw new Error('Payee name already exists');
      }
      payee.rename(input.name);
    }

    // 3. Update IBAN if provided
    if (input.iban !== undefined) {
      if (input.iban === null) {
        payee.changeIban(null);
      } else {
        // Check if new IBAN already exists
        const ibanExists = await this.payeeRepo.existsByIban(input.iban);
        if (ibanExists && payee.iban?.toString() !== input.iban) {
          throw new Error('IBAN already exists');
        }
        payee.changeIban(IBAN.create(input.iban));
      }
    }

    // 4. Persist
    await this.payeeRepo.save(payee);

    // 5. Return DTO
    return PayeeDTO.fromDomain(payee);
  }
}