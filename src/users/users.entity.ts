import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { TasksEntity } from 'tasks/tasks.entity';
@Entity()
export class UsersEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => TasksEntity, (task) => task.user)
  tasks: TasksEntity[];
}
