import { IRuleRepository } from '@domain/repositories/IRuleRepository';
import { ICategoryRepository } from '@domain/repositories/ICategoryRepository';
import { RuleDTO } from '@application/dtos/RuleDTO';
import { Money } from '@domain/value-objects/Money';
import { Frequency } from '@domain/value-objects/Frequency';
import { NotFoundError } from '@application/errors';

export interface UpdateRuleInput {
  id: string;
  category_id?: string | null;
  amount?: number | null;
  currency?: string;
  description_template?: string | null;
  is_recurring?: boolean;
  frequency?: string | null;
  is_active?: boolean;
}

export class UpdateRule {
  constructor(
    private ruleRepo: IRuleRepository,
    private categoryRepo: ICategoryRepository
  ) {}

  async execute(input: UpdateRuleInput): Promise<RuleDTO> {
    // 1. Find existing rule
    const rule = await this.ruleRepo.findById(input.id);
    if (!rule) {
      throw new NotFoundError('Rule not found');
    }

    // 2. Validate category if provided
    if (input.category_id !== undefined && input.category_id !== null) {
      const category = await this.categoryRepo.findById(input.category_id);
      if (!category) {
        throw new NotFoundError('Category not found');
      }
    }

    // 3. Update category
    if (input.category_id !== undefined) {
      if (input.category_id === null) {
        rule.clearCategory();
      } else {
        rule.setCategory(input.category_id);
      }
    }

    // 4. Update amount
    if (input.amount !== undefined) {
      const amount = input.amount !== null
        ? Money.fromAmount(input.amount, input.currency || 'EUR')
        : null;
      rule.setAmount(amount);
    }

    // 5. Update description template
    if (input.description_template !== undefined) {
      rule.setDescriptionTemplate(input.description_template);
    }

    // 6. Update recurring status and frequency
    if (input.is_recurring !== undefined || input.frequency !== undefined) {
      const isRecurring = input.is_recurring !== undefined 
        ? input.is_recurring 
        : rule.isRecurring;
      
      const frequency = input.frequency !== undefined
        ? (input.frequency !== null ? Frequency.create(input.frequency as 'monthly' | 'weekly' | 'yearly') : null)
        : rule.frequency;
      
      rule.setRecurring(isRecurring, frequency);
    }

    // 7. Update active status
    if (input.is_active !== undefined) {
      if (input.is_active) {
        rule.activate();
      } else {
        rule.deactivate();
      }
    }

    // 8. Persist
    await this.ruleRepo.save(rule);

    // 9. Return DTO
    return RuleDTO.fromDomain(rule);
  }
}