import { IRuleRepository } from '@domain/repositories/IRuleRepository';
import { RuleDTO } from '@application/dtos/RuleDTO';
import { NotFoundError } from '@application/errors';

export interface GetRuleInput {
  id: string;
}

export class GetRule {
  constructor(
    private ruleRepo: IRuleRepository
  ) {}

  async execute(input: GetRuleInput): Promise<RuleDTO> {
    // 1. Find rule by ID
    const rule = await this.ruleRepo.findById(input.id);

    // 2. Check if exists
    if (!rule) {
      throw new NotFoundError('Rule not found');
    }

    // 3. Return DTO
    return RuleDTO.fromDomain(rule);
  }
}