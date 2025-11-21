import { IPayeeRepository } from '@domain/repositories/IPayeeRepository';
import { PayeeDTO } from '@application/dtos/PayeeDTO';
import { NotFoundError } from '@application/errors';

export interface GetPayeeInput {
  id: string;
}

export class GetPayee {
  constructor(
    private payeeRepo: IPayeeRepository
  ) {}

  async execute(input: GetPayeeInput): Promise<PayeeDTO> {
    // 1. Find payee by ID
    const payee = await this.payeeRepo.findById(input.id);

    // 2. Check if exists
    if (!payee) {
      throw new NotFoundError('Payee not found');
    }

    // 3. Return DTO
    return PayeeDTO.fromDomain(payee);
  }
}