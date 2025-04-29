import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class PriceAlert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string; // 'ethereum' or 'matic'

  @Column('decimal', { precision: 18, scale: 8 })
  targetPrice: number;

  @Column()
  email: string;

  @Column({ default: false })
  triggered: boolean;

  @CreateDateColumn()
  createdAt: Date;
}