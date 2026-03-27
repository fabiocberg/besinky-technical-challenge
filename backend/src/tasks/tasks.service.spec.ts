import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  let repository: jest.Mocked<Repository<Task>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get(getRepositoryToken(Task));
  });

  it('creates a manual task', async () => {
    const task = {
      id: 1,
      title: 'Comprar passagens',
      isCompleted: false,
      isAiGenerated: false,
      createdAt: new Date(),
    } as Task;

    repository.create.mockReturnValue(task);
    repository.save.mockResolvedValue(task);

    const result = await service.create({ title: 'Comprar passagens' });

    expect(repository.create.mock.calls[0][0]).toEqual({
      title: 'Comprar passagens',
      isAiGenerated: false,
      isCompleted: false,
    });
    expect(result).toEqual(task);
  });

  it('updates task status', async () => {
    const task = {
      id: 1,
      title: 'Reservar hotel',
      isCompleted: false,
      isAiGenerated: false,
      createdAt: new Date(),
    } as Task;

    repository.findOne.mockResolvedValue(task);
    repository.save.mockResolvedValue({ ...task, isCompleted: true });

    const result = await service.updateStatus(1, true);

    expect(result.isCompleted).toBe(true);
    expect(repository.save.mock.calls[0][0]).toEqual({
      ...task,
      isCompleted: true,
    });
  });

  it('throws when updating a missing task', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.updateStatus(99, true)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('wraps repository errors on createMany', async () => {
    repository.create.mockReturnValue([]);
    repository.save.mockRejectedValue(new Error('db failure'));

    await expect(
      service.createMany(['Escolher destino']),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
