import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Patch,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { TasksEntity, TaskStatus } from './tasks.entity';
import { UsersEntity } from 'users/users.entity';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task';

@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Creates a new task.
   * @returns The created task entity.
   * @param createTaskDto
   * @param req
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req,
  ): Promise<TasksEntity> {
    const user = new UsersEntity();
    user.id = req.user.id;
    return await this.tasksService.createTask(user, createTaskDto);
  }

  /**
   * Retrieves all tasks.
   * @returns An array of task entities.
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllTasks(): Promise<TasksEntity[]> {
    return await this.tasksService.getAllTasks();
  }

  /**
   * Retrieves a single task by ID.
   * @param id The ID of the task to retrieve.
   * @returns The task entity.
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getTaskById(@Param('id') id: number): Promise<TasksEntity> {
    return await this.tasksService.getTaskById(id);
  }

  /**
   * Updates the status of a task.
   * @param id The ID of the task to update.
   * @param status The new status of the task.
   * @returns The updated task entity.
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateTaskStatus(
    @Param('id') id: number,
    @Body('status') status: TaskStatus,
  ): Promise<TasksEntity> {
    return await this.tasksService.updateTaskStatus(id, status);
  }

  /**
   * Deletes a task by ID.
   * @param id The ID of the task to delete.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteTask(@Param('id') id: number): Promise<void> {
    await this.tasksService.deleteTask(id);
  }
}
