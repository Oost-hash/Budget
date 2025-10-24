import { Rule } from '@domain/entities/Rule';

export interface RuleDTO {
  id: string;
  payee_id: string;
  category_id: string | null;
  amount: number | null;
  currency: string | null;
  description_template: string | null;
  is_recurring: boolean;
  frequency: string | null;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export class RuleDTO {
  static fromDomain(rule: Rule): RuleDTO {
    return {
      id: rule.id,
      payee_id: rule.payeeId,
      category_id: rule.categoryId,
      amount: rule.amount?.amount ?? null,
      currency: rule.amount?.currency ?? null,
      description_template: rule.descriptionTemplate,
      is_recurring: rule.isRecurring,
      frequency: rule.frequency?.toString() ?? null,
      is_active: rule.isActive,
    };
  }
}