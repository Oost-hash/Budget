import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PayeeEntity } from './PayeeEntity';
import { CategoryEntity } from './CategoryEntity';

@Entity('rules')
export class RuleEntity {
  @PrimaryColumn('text')
  id!: string;

  @Column('text')
  payee_id!: string;

  @Column('text', { nullable: true })
  category_id!: string | null;

  @Column('real', { nullable: true })
  amount!: number | null;

  @Column('text', { default: 'EUR' })
  currency!: string;

  @Column('text', { nullable: true })
  description_template!: string | null;

  @Column('boolean', { default: false })
  is_recurring!: boolean;

  @Column('text', { nullable: true })
  frequency!: string | null;

  @Column('boolean', { default: true })
  is_active!: boolean;

  @ManyToOne(() => PayeeEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payee_id' })
  payee?: PayeeEntity;

  @ManyToOne(() => CategoryEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category?: CategoryEntity;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}