// tasks.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from '../tasks.service';
import { TasksEntity } from '../tasks.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('TasksService', () => {
  let service: TasksService;
  let repository: Repository<TasksEntity>;

  const mockTask = {
    id: 1,
    title: 'Test Task',
    description: 'Task description',
    status: 'OPEN',
  };

  const mockRepository = {
    find: jest.fn().mockResolvedValue([mockTask]),
    findOne: jest.fn().mockResolvedValue(mockTask),
    save: jest.fn().mockResolvedValue(mockTask),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(TasksEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get<Repository<TasksEntity>>(
      getRepositoryToken(TasksEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all tasks', async () => {
    const tasks = await service.getAllTasks();
    expect(tasks).toEqual([mockTask]);
    expect(repository.find).toHaveBeenCalled();
  });

  it('should return a task by id', async () => {
    const task = await service.getTaskById(1);
    expect(task).toEqual(mockTask);
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ['user'],
    });
  });

  // it('should create a new task', async () => {
  //   const newTask = {
  //     title: 'New Task',
  //     description: 'Description',
  //     status: 'OPEN',
  //   };
  //   const createdTask = await service.createTask(newTask);
  //   expect(createdTask).toEqual(mockTask);
  //   expect(repository.save).toHaveBeenCalledWith(newTask);
  // });
});
