import { DataSource, Repository } from 'typeorm';
import { IPayeeRepository } from '@domain/repositories/IPayeeRepository';
import { Payee } from '@domain/entities/Payee';
import { PayeeEntity } from '../database/entities/PayeeEntity';
import { PayeeMapper } from '../database/mappers/PayeeMapper';

export class PayeeRepository implements IPayeeRepository {
  private repository: Repository<PayeeEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(PayeeEntity);
  }

  async save(payee: Payee): Promise<void> {
    const entity = PayeeMapper.toEntity(payee);
    await this.repository.save(entity);
  }

  async findById(id: string): Promise<Payee | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? PayeeMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Payee[]> {
    const entities = await this.repository.find({
      order: { name: 'ASC' }
    });
    return entities.map(PayeeMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.repository.count({ where: { name } });
    return count > 0;
  }

  async existsByIban(iban: string): Promise<boolean> {
    const count = await this.repository.count({ where: { iban } });
    return count > 0;
  }

  async findByIban(iban: string): Promise<Payee | null> {
    const entity = await this.repository.findOne({ where: { iban } });
    return entity ? PayeeMapper.toDomain(entity) : null;
  }
}