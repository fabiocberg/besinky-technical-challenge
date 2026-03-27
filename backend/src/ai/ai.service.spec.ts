import { BadGatewayException, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Task } from '../tasks/entities/task.entity';
import { TasksService } from '../tasks/tasks.service';
import { AiService } from './ai.service';
import {
  TASK_GENERATION_PROVIDER,
  TaskGenerationProvider,
} from './contracts/task-generation.provider';

describe('AiService', () => {
  let service: AiService;
  let tasksService: jest.Mocked<Pick<TasksService, 'createMany'>>;
  let provider: jest.Mocked<TaskGenerationProvider>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: TasksService,
          useValue: {
            createMany: jest.fn(),
          },
        },
        {
          provide: TASK_GENERATION_PROVIDER,
          useValue: {
            generateTasks: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    tasksService = module.get(TasksService);
    provider = module.get(TASK_GENERATION_PROVIDER);
  });

  it('generates tasks through the provider and persists them', async () => {
    const persistedTasks = [
      {
        id: 1,
        title: 'Escolher destino',
        isCompleted: false,
        isAiGenerated: true,
        createdAt: new Date(),
      },
    ] as Task[];

    provider.generateTasks.mockResolvedValue({
      tasks: [{ title: 'Escolher destino' }, { title: ' Reservar hotel ' }],
    });
    tasksService.createMany.mockResolvedValue(persistedTasks);

    const result = await service.generateTasks({
      goal: 'Planejar uma viagem',
      apiKey: 'sk-test',
    });

    expect(provider.generateTasks.mock.calls[0][0]).toEqual({
      goal: 'Planejar uma viagem',
      apiKey: 'sk-test',
    });
    expect(tasksService.createMany.mock.calls[0][0]).toEqual([
      'Escolher destino',
      'Reservar hotel',
    ]);
    expect(result).toEqual(persistedTasks);
  });

  it('rejects empty apiKey', async () => {
    await expect(
      service.generateTasks({
        goal: 'Planejar uma viagem',
        apiKey: '   ',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects invalid provider payload', async () => {
    provider.generateTasks.mockResolvedValue({ tasks: [] });

    await expect(
      service.generateTasks({
        goal: 'Planejar uma viagem',
        apiKey: 'sk-test',
      }),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});
