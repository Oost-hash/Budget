import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('accounts')
@Index(['name'], { unique: true })
@Index(['iban'], { unique: true, where: 'iban IS NOT NULL' })
export class AccountEntity {
  @PrimaryColumn('text')
  id!: string;

  @Column('text', { unique: true })
  name!: string;

  @Column('text')
  type!: 'asset' | 'liability';

  @Column('text', { nullable: true, unique: true })
  iban!: string | null;

  @Column('boolean', { default: false })
  is_savings!: boolean;

  @Column('real', { default: 0 })
  overdraft_limit_amount!: number;

  @Column('text', { default: 'EUR' })
  overdraft_limit_currency!: string;

  @Column('real', { default: 0 })
  credit_limit_amount!: number;

  @Column('text', { default: 'EUR' })
  credit_limit_currency!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}