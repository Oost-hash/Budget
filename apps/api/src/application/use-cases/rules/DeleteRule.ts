import { IRuleRepository } from '@domain/repositories/IRuleRepository';
import { NotFoundError } from '@application/errors';

export interface DeleteRuleInput {
  id: string;
}

export class DeleteRule {
  constructor(
    private ruleRepo: IRuleRepository
  ) {}

  async execute(input: DeleteRuleInput): Promise<void> {
    // 1. Check if rule exists
    const rule = await this.ruleRepo.findById(input.id);
    if (!rule) {
      throw new NotFoundError('Rule not found');
    }

    // 2. Delete rule
    await this.ruleRepo.delete(input.id);

    // No return value for delete operations
  }
}