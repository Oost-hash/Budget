import { IRuleRepository } from '@domain/repositories/IRuleRepository';
import { RuleDTO } from '@application/dtos/RuleDTO';

export class GetAllRules {
  constructor(
    private ruleRepo: IRuleRepository
  ) {}

  async execute(): Promise<RuleDTO[]> {
    const rules = await this.ruleRepo.findAll();
    return rules.map(RuleDTO.fromDomain);
  }
}