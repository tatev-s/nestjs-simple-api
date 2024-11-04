import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TasksEntity, TaskStatus } from './tasks.entity';
import { UsersEntity } from 'users/users.entity';
import { CreateTaskDto } from './dto/create-task';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TasksEntity)
    private tasksRepository: Repository<TasksEntity>,
  ) {}

  /**
   * Creates a new task.
   * @param user The user associated with the task.
   * @param createTaskDto
   * @returns The created task entity.
   */
  async createTask(
    user: UsersEntity,
    createTaskDto: CreateTaskDto,
  ): Promise<TasksEntity> {
    const { title, description } = createTaskDto;
    const task = this.tasksRepository.create({
      user,
      title,
      description,
      status: TaskStatus.OPEN,
    });
    return await this.tasksRepository.save(task);
  }

  /**
   * Retrieves all tasks.
   * @returns An array of task entities.
   */
  async getAllTasks(): Promise<TasksEntity[]> {
    return await this.tasksRepository.find({ relations: ['user'] });
  }

  /**
   * Retrieves a task by its ID.
   * @param id The ID of the task to retrieve.
   * @returns The task entity, or null if not found.
   */
  async getTaskById(id: number): Promise<TasksEntity> {
    return await this.tasksRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  /**
   * Updates the status of a task.
   * @param id The ID of the task to update.
   * @param status The new status of the task.
   * @returns The updated task entity, or null if not found.
   */
  async updateTaskStatus(id: number, status: TaskStatus): Promise<TasksEntity> {
    const task = await this.getTaskById(id);
    if (task) {
      task.status = status;
      return await this.tasksRepository.save(task);
    }
    return null;
  }

  /**
   * Deletes a task by its ID.
   * @param id The ID of the task to delete.
   */
  async deleteTask(id: number): Promise<void> {
    await this.tasksRepository.delete(id);
  }
}
