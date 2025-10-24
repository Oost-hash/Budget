import { DataSource, Repository } from 'typeorm';
import { IRuleRepository } from '@domain/repositories/IRuleRepository';
import { Rule } from '@domain/entities/Rule';
import { RuleEntity } from '../database/entities/RuleEntity';
import { RuleMapper } from '../database/mappers/RuleMapper';

export class RuleRepository implements IRuleRepository {
  private repository: Repository<RuleEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(RuleEntity);
  }

  async save(rule: Rule): Promise<void> {
    const entity = RuleMapper.toEntity(rule);
    await this.repository.save(entity);
  }

  async findById(id: string): Promise<Rule | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? RuleMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Rule[]> {
    const entities = await this.repository.find({
      order: { created_at: 'DESC' }
    });
    return entities.map(RuleMapper.toDomain);
  }

  async findByPayeeId(payeeId: string): Promise<Rule[]> {
    const entities = await this.repository.find({
      where: { payee_id: payeeId },
      order: { created_at: 'DESC' }
    });
    return entities.map(RuleMapper.toDomain);
  }

  async findActiveByPayeeId(payeeId: string): Promise<Rule[]> {
    const entities = await this.repository.find({
      where: { 
        payee_id: payeeId,
        is_active: true
      },
      order: { created_at: 'DESC' }
    });
    return entities.map(RuleMapper.toDomain);
  }

  async findRecurring(): Promise<Rule[]> {
    const entities = await this.repository.find({
      where: { 
        is_recurring: true,
        is_active: true
      },
      order: { created_at: 'DESC' }
    });
    return entities.map(RuleMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }
}