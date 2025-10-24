import { IRuleRepository } from '@domain/repositories/IRuleRepository';
import { RuleDTO } from '@application/dtos/RuleDTO';

export interface GetRulesByPayeeInput {
  payee_id: string;
  active_only?: boolean;
}

export class GetRulesByPayee {
  constructor(
    private ruleRepo: IRuleRepository
  ) {}

  async execute(input: GetRulesByPayeeInput): Promise<RuleDTO[]> {
    const rules = input.active_only
      ? await this.ruleRepo.findActiveByPayeeId(input.payee_id)
      : await this.ruleRepo.findByPayeeId(input.payee_id);

    return rules.map(RuleDTO.fromDomain);
  }
}