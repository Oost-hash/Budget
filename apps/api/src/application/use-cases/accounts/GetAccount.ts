import { IAccountRepository } from '@domain/repositories/IAccountRepository';
import { AccountDTO } from '@application/dtos/AccountDTO';
import { NotFoundError } from '@application/errors';

export interface GetAccountInput {
  id: string;
}

export class GetAccount {
  constructor(
    private accountRepo: IAccountRepository
  ) {}

  async execute(input: GetAccountInput): Promise<AccountDTO> {
    // 1. Find account by ID
    const account = await this.accountRepo.findById(input.id);

    // 2. Check if exists
    if (!account) {
      throw new NotFoundError('Account not found');
    }

    // 3. Return DTO
    return AccountDTO.fromDomain(account);
  }
}