import { Account } from '@domain/entities/Account';

export interface IAccountRepository {
  // Basic CRUD
  save(account: Account): Promise<void>;
  findById(id: string): Promise<Account | null>;
  findAll(): Promise<Account[]>;
  delete(id: string): Promise<void>;
  
  // Validation helpers
  existsByName(name: string): Promise<boolean>;
  existsByIban(iban: string): Promise<boolean>;
}