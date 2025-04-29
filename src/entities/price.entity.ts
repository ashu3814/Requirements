// src/entities/price.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('prices')
export class Price {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column('decimal', { precision: 18, scale: 8 })
  price: number;

  @CreateDateColumn()
  timestamp: Date;
}