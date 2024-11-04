import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { UsersEntity } from 'users/users.entity';
export enum TaskStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}
@Entity()
export class TasksEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UsersEntity, (user) => user.tasks, { eager: true })
  user: UsersEntity;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.OPEN,
  })
  status: TaskStatus;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ default: true })
  isActive: boolean;
}
