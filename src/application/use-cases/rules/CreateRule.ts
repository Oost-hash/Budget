import { IRuleRepository } from '@domain/repositories/IRuleRepository';
import { IPayeeRepository } from '@domain/repositories/IPayeeRepository';
import { ICategoryRepository } from '@domain/repositories/ICategoryRepository';
import { Rule } from '@domain/entities/Rule';
import { RuleDTO } from '@application/dtos/RuleDTO';
import { Money } from '@domain/value-objects/Money';
import { Frequency } from '@domain/value-objects/Frequency';
import { v4 as uuid } from 'uuid';

export interface CreateRuleInput {
  payee_id: string;
  category_id?: string | null;
  amount?: number | null;
  currency?: string;
  description_template?: string | null;
  is_recurring?: boolean;
  frequency?: string | null;
  is_active?: boolean;
}

export class CreateRule {
  constructor(
    private ruleRepo: IRuleRepository,
    private payeeRepo: IPayeeRepository,
    private categoryRepo: ICategoryRepository
  ) {}

  async execute(input: CreateRuleInput): Promise<RuleDTO> {
    // 1. Validation: Check if payee exists
    const payeeExists = await this.payeeRepo.findById(input.payee_id);
    if (!payeeExists) {
      throw new Error('Payee not found');
    }

    // 2. Validation: Check if category exists (if provided)
    if (input.category_id) {
      const categoryExists = await this.categoryRepo.findById(input.category_id);
      if (!categoryExists) {
        throw new Error('Category not found');
      }
    }

    // 3. Create amount if provided
    const amount = input.amount !== null && input.amount !== undefined
      ? Money.fromAmount(input.amount, input.currency || 'EUR')
      : null;

    // 4. Create frequency if provided
    const frequency = input.frequency
      ? Frequency.create(input.frequency as 'monthly' | 'weekly' | 'yearly')
      : null;

    // 5. Create domain entity (will validate recurring/frequency rules)
    const rule = new Rule(
      uuid(),
      input.payee_id,
      input.category_id ?? null,
      amount,
      input.description_template ?? null,
      input.is_recurring ?? false,
      frequency,
      input.is_active ?? true
    );

    // 6. Persist
    await this.ruleRepo.save(rule);

    // 7. Return DTO
    return RuleDTO.fromDomain(rule);
  }
}