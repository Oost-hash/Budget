import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CategoryEntity } from './CategoryEntity';

@Entity('groups')
export class GroupEntity {
  @PrimaryColumn('text')
  id!: string;

  @Column('text', { unique: true })
  name!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relatie (optioneel, voor queries)
  @OneToMany(() => CategoryEntity, category => category.group)
  categories?: CategoryEntity[];
}