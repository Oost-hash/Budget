import { Rule } from '@domain/entities/Rule';

export interface IRuleRepository {
  // Basic CRUD
  save(rule: Rule): Promise<void>;
  findById(id: string): Promise<Rule | null>;
  findAll(): Promise<Rule[]>;
  delete(id: string): Promise<void>;
  
  // Query methods
  findByPayeeId(payeeId: string): Promise<Rule[]>;
  findActiveByPayeeId(payeeId: string): Promise<Rule[]>;
  findRecurring(): Promise<Rule[]>;
  
  // Validation helper
  exists(id: string): Promise<boolean>;
}