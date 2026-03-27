import { Module } from '@nestjs/common';
import { TasksModule } from '../tasks/tasks.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { TASK_GENERATION_PROVIDER } from './contracts/task-generation.provider';
import { OpenAiTaskGenerationProvider } from './providers/openai-task-generation.provider';

@Module({
  imports: [TasksModule],
  controllers: [AiController],
  providers: [
    AiService,
    {
      provide: TASK_GENERATION_PROVIDER,
      useClass: OpenAiTaskGenerationProvider,
    },
  ],
})
export class AiModule {}
