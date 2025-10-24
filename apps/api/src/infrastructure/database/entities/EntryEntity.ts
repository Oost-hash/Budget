import { 
  Entity, 
  PrimaryColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { TransactionEntity } from './TransactionEntity';
import { AccountEntity } from './AccountEntity';

@Entity('entries')
export class EntryEntity {
  @PrimaryColumn('text')
  id!: string;

  @Column('text')
  transaction_id!: string;

  @Column('text')
  account_id!: string;

  @Column('real') // SQLite doesn't have DECIMAL, use REAL (floating point)
  amount!: number;

  @Column('text', { default: 'EUR' })
  currency!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => TransactionEntity, transaction => transaction.entries, { 
    onDelete: 'CASCADE' 
  })
  @JoinColumn({ name: 'transaction_id' })
  transaction!: TransactionEntity;

  @ManyToOne(() => AccountEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: AccountEntity;
}