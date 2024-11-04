import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from 'tasks/tasks.controller';
import { TasksService } from 'tasks/tasks.service';
import { TaskStatus } from 'tasks/tasks.entity';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';
import { CreateTaskDto } from 'tasks/dto/create-task';
import { UsersEntity } from 'users/users.entity';
import { UnauthorizedException } from '@nestjs/common';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  const mockTask = {
    id: 1,
    title: 'Test Task',
    description: 'This is a test task',
    status: TaskStatus.OPEN,
  };

  const mockTasksService = {
    createTask: jest.fn(),
    getAllTasks: jest.fn(),
    getTaskById: jest.fn(),
    updateTaskStatus: jest.fn(),
    deleteTask: jest.fn(),
  };

  const mockRequest = {
    user: {
      id: 1,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) }) // Mocking JwtAuthGuard
      .compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'Create a new task',
      };
      const mockUser = new UsersEntity();
      mockUser.id = mockRequest.user.id;

      mockTasksService.createTask.mockResolvedValue(mockTask);

      const result = await controller.createTask(createTaskDto, mockRequest);
      expect(result).toEqual(mockTask);
      expect(service.createTask).toHaveBeenCalledWith(mockUser, createTaskDto);
    });

    it('should throw UnauthorizedException when JwtAuthGuard fails', async () => {
      // Simulating an unauthorized request scenario by throwing UnauthorizedException
      mockTasksService.createTask.mockRejectedValue(
        new UnauthorizedException('Unauthorized'),
      );
      await expect(
        controller.createTask({ title: '', description: '' }, mockRequest),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getAllTasks', () => {
    it('should return an array of tasks', async () => {
      mockTasksService.getAllTasks.mockResolvedValue([mockTask]);

      const result = await controller.getAllTasks();
      expect(result).toEqual([mockTask]);
      expect(service.getAllTasks).toHaveBeenCalled();
    });
  });

  describe('getTaskById', () => {
    it('should return a task by ID', async () => {
      mockTasksService.getTaskById.mockResolvedValue(mockTask);

      const result = await controller.getTaskById(1);
      expect(result).toEqual(mockTask);
      expect(service.getTaskById).toHaveBeenCalledWith(1);
    });
  });

  describe('updateTaskStatus', () => {
    it('should update the status of a task', async () => {
      const updatedTask = { ...mockTask, status: TaskStatus.DONE };
      mockTasksService.updateTaskStatus.mockResolvedValue(updatedTask);

      const result = await controller.updateTaskStatus(1, TaskStatus.DONE);
      expect(result).toEqual(updatedTask);
      expect(service.updateTaskStatus).toHaveBeenCalledWith(1, TaskStatus.DONE);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task by ID', async () => {
      mockTasksService.deleteTask.mockResolvedValue(undefined);

      const result = await controller.deleteTask(1);
      expect(result).toBeUndefined();
      expect(service.deleteTask).toHaveBeenCalledWith(1);
    });
  });
});
