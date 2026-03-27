import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'tasks' })
export class Task {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Comprar passagens' })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({ example: false })
  @Column({ type: 'boolean', default: false })
  isCompleted: boolean;

  @ApiProperty({ example: '2026-03-27T21:00:00.000Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: true })
  @Column({ type: 'boolean', default: false })
  isAiGenerated: boolean;
}
