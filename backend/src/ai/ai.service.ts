import {
  BadGatewayException,
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Task } from '../tasks/entities/task.entity';
import { TasksService } from '../tasks/tasks.service';
import {
  GeneratedTasksResult,
  TASK_GENERATION_PROVIDER,
} from './contracts/task-generation.provider';
import type { TaskGenerationProvider } from './contracts/task-generation.provider';
import { GenerateTasksDto } from './dto/generate-tasks.dto';

@Injectable()
export class AiService {
  constructor(
    private readonly tasksService: TasksService,
    @Inject(TASK_GENERATION_PROVIDER)
    private readonly taskGenerationProvider: TaskGenerationProvider,
  ) {}

  async generateTasks(generateTasksDto: GenerateTasksDto): Promise<Task[]> {
    const goal = generateTasksDto.goal.trim();
    const apiKey = generateTasksDto.apiKey.trim();

    if (!goal) {
      throw new BadRequestException('Goal is required.');
    }

    if (!apiKey) {
      throw new BadRequestException('API key is required.');
    }

    const providerResponse = await this.taskGenerationProvider.generateTasks({
      goal,
      apiKey,
    });

    const titles = this.extractTitles(providerResponse);

    if (!titles.length) {
      throw new BadGatewayException('OpenAI returned no valid tasks.');
    }

    return this.tasksService.createMany(titles);
  }

  private extractTitles(response: GeneratedTasksResult): string[] {
    if (!response || !Array.isArray(response.tasks)) {
      throw new BadGatewayException('OpenAI returned an invalid task payload.');
    }

    const titles = response.tasks
      .map((task) => task?.title?.trim())
      .filter((title): title is string => Boolean(title));

    if (!titles.length) {
      throw new BadGatewayException('OpenAI returned an empty task list.');
    }

    return titles;
  }
}
