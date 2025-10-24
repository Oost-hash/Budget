import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('payees')
export class PayeeEntity {
  @PrimaryColumn('text')
  id!: string;

  @Column('text', { unique: true })
  name!: string;

  @Column('text', { nullable: true, unique: true })
  iban!: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}