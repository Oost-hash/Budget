import { IAccountRepository } from '@domain/repositories/IAccountRepository';

export interface DeleteAccountInput {
  id: string;
}

export class DeleteAccount {
  constructor(
    private accountRepo: IAccountRepository
  ) {}

  async execute(input: DeleteAccountInput): Promise<void> {
    // 1. Check if account exists
    const account = await this.accountRepo.findById(input.id);
    if (!account) {
      throw new Error('Account not found');
    }

    // 2. Delete account
    // Note: Entries will be CASCADE deleted by database
    await this.accountRepo.delete(input.id);

    // No return value for delete operations
  }
}