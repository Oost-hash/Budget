import { DataSource, Repository, Between } from 'typeorm';
import { ITransactionRepository } from '@domain/repositories/ITransactionRepository';
import { Transaction } from '@domain/entities/Transaction';
import { TransactionEntity } from '../database/entities/TransactionEntity';
import { TransactionMapper } from '../database/mappers/TransactionMapper';

export class TransactionRepository implements ITransactionRepository {
  private repository: Repository<TransactionEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(TransactionEntity);
  }

  async save(transaction: Transaction): Promise<void> {
    const entity = TransactionMapper.toEntity(transaction);
    await this.repository.save(entity);
  }

  async findById(id: string): Promise<Transaction | null> {
    const entity = await this.repository.findOne({ 
      where: { id },
      relations: ['entries'] // Explicit load entries (though eager: true should do this)
    });
    return entity ? TransactionMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Transaction[]> {
    const entities = await this.repository.find({
      relations: ['entries'],
      order: { date: 'DESC', created_at: 'DESC' }
    });
    return entities.map(TransactionMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findByAccountId(accountId: string): Promise<Transaction[]> {
    // Find transactions that have entries for this account
    const entities = await this.repository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.entries', 'entry')
      .where('entry.account_id = :accountId', { accountId })
      .orderBy('transaction.date', 'DESC')
      .addOrderBy('transaction.created_at', 'DESC')
      .getMany();

    return entities.map(TransactionMapper.toDomain);
  }

  async findByPayeeId(payeeId: string): Promise<Transaction[]> {
    const entities = await this.repository.find({
      where: { payee_id: payeeId },
      relations: ['entries'],
      order: { date: 'DESC', created_at: 'DESC' }
    });
    return entities.map(TransactionMapper.toDomain);
  }

  async findByCategoryId(categoryId: string): Promise<Transaction[]> {
    const entities = await this.repository.find({
      where: { category_id: categoryId },
      relations: ['entries'],
      order: { date: 'DESC', created_at: 'DESC' }
    });
    return entities.map(TransactionMapper.toDomain);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    const entities = await this.repository.find({
      where: {
        date: Between(startDate, endDate)
      },
      relations: ['entries'],
      order: { date: 'DESC', created_at: 'DESC' }
    });
    return entities.map(TransactionMapper.toDomain);
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  async hasTransactionsForPayee(payeeId: string): Promise<boolean> {
    const count = await this.repository.count({ 
      where: { payee_id: payeeId } 
    });
    return count > 0;
  }
}