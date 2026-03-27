import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Task } from '../tasks/entities/task.entity';
import { AiService } from './ai.service';
import { GenerateTasksDto } from './dto/generate-tasks.dto';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-tasks')
  @ApiOperation({ summary: 'Generate and persist tasks from a goal' })
  @ApiResponse({ status: 201, type: [Task] })
  generateTasks(@Body() generateTasksDto: GenerateTasksDto): Promise<Task[]> {
    return this.aiService.generateTasks(generateTasksDto);
  }
}
