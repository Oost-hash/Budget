import { Payee } from '@domain/entities/Payee';

export interface IPayeeRepository {
  // Basic CRUD
  save(payee: Payee): Promise<void>;
  findById(id: string): Promise<Payee | null>;
  findAll(): Promise<Payee[]>;
  delete(id: string): Promise<void>;
  
  // Validation helpers
  existsByName(name: string): Promise<boolean>;
  existsByIban(iban: string): Promise<boolean>;
  
  // Search by IBAN (for bank import matching)
  findByIban(iban: string): Promise<Payee | null>;
}