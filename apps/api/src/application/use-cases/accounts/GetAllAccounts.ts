import { IAccountRepository } from '@domain/repositories/IAccountRepository';
import { AccountDTO } from '@application/dtos/AccountDTO';

export class GetAllAccounts {
  constructor(
    private accountRepo: IAccountRepository
  ) {}

  async execute(): Promise<AccountDTO[]> {
    // 1. Get all accounts from repository (sorted by name)
    const accounts = await this.accountRepo.findAll();

    // 2. Convert to DTOs
    return accounts.map(AccountDTO.fromDomain);
  }
}