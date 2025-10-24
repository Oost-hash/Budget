import { 
  Entity, 
  PrimaryColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { EntryEntity } from './EntryEntity';
import { PayeeEntity } from './PayeeEntity';
import { CategoryEntity } from './CategoryEntity';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryColumn('text')
  id!: string;

  @Column('text') // 'income' | 'expense' | 'transfer'
  type!: string;

  @Column('datetime')
  date!: Date;

  @Column('text', { nullable: true })
  description!: string | null;

  @Column('text', { nullable: true })
  payee_id!: string | null;

  @Column('text', { nullable: true })
  category_id!: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @OneToMany(() => EntryEntity, entry => entry.transaction, { 
    cascade: true,
    eager: true // Always load entries with transaction
  })
  entries!: EntryEntity[];

  @ManyToOne(() => PayeeEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'payee_id' })
  payee?: PayeeEntity;

  @ManyToOne(() => CategoryEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category?: CategoryEntity;
}