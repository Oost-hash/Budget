import { IRuleRepository } from '@domain/repositories/IRuleRepository';
import { RuleDTO } from '@application/dtos/RuleDTO';

export class GetRecurringRules {
  constructor(
    private ruleRepo: IRuleRepository
  ) {}

  async execute(): Promise<RuleDTO[]> {
    const rules = await this.ruleRepo.findRecurring();
    return rules.map(RuleDTO.fromDomain);
  }
}