import { Rule } from '@domain/entities/Rule';
import { RuleEntity } from '../entities/RuleEntity';
import { Money } from '@domain/value-objects/Money';
import { Frequency } from '@domain/value-objects/Frequency';

export class RuleMapper {
  // Database → Domain
  static toDomain(entity: RuleEntity): Rule {
    const amount = entity.amount !== null 
      ? Money.fromAmount(entity.amount, entity.currency)
      : null;

    const frequency = entity.frequency !== null
      ? Frequency.create(entity.frequency as 'monthly' | 'weekly' | 'yearly')
      : null;

    return new Rule(
      entity.id,
      entity.payee_id,
      entity.category_id,
      amount,
      entity.description_template,
      entity.is_recurring,
      frequency,
      entity.is_active
    );
  }

  // Domain → Database
  static toEntity(rule: Rule): RuleEntity {
    const entity = new RuleEntity();
    entity.id = rule.id;
    entity.payee_id = rule.payeeId;
    entity.category_id = rule.categoryId;
    entity.amount = rule.amount?.amount ?? null;
    entity.currency = rule.amount?.currency ?? 'EUR';
    entity.description_template = rule.descriptionTemplate;
    entity.is_recurring = rule.isRecurring;
    entity.frequency = rule.frequency?.toString() ?? null;
    entity.is_active = rule.isActive;
    return entity;
  }
}