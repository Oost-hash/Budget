import { IPayeeRepository } from '@domain/repositories/IPayeeRepository';
import { PayeeDTO } from '@application/dtos/PayeeDTO';

export class GetAllPayees {
  constructor(
    private payeeRepo: IPayeeRepository
  ) {}

  async execute(): Promise<PayeeDTO[]> {
    // 1. Get all payees from repository (sorted by name)
    const payees = await this.payeeRepo.findAll();

    // 2. Convert to DTOs
    return payees.map(PayeeDTO.fromDomain);
  }
}