import { DataSource, Repository } from 'typeorm';
import { IAccountRepository } from '@domain/repositories/IAccountRepository';
import { Account } from '@domain/entities/Account';
import { AccountEntity } from '../database/entities/AccountEntity';
import { AccountMapper } from '../database/mappers/AccountMapper';

export class AccountRepository implements IAccountRepository {
  private repository: Repository<AccountEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(AccountEntity);
  }

  async save(account: Account): Promise<void> {
    const entity = AccountMapper.toEntity(account);
    await this.repository.save(entity);
  }

  async findById(id: string): Promise<Account | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? AccountMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Account[]> {
    const entities = await this.repository.find({
      order: { name: 'ASC' }
    });
    return entities.map(AccountMapper.toDomain);
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
}