import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { AiModule } from './ai/ai.module';
import { Task } from './tasks/entities/task.entity';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: (() => {
        const databasePath = resolve(
          process.cwd(),
          process.env.DATABASE_PATH || 'data/tasks.db',
        );
        const databaseDirectory = dirname(databasePath);

        if (!existsSync(databaseDirectory)) {
          mkdirSync(databaseDirectory, { recursive: true });
        }

        return databasePath;
      })(),
      entities: [Task],
      synchronize: true,
    }),
    TasksModule,
    AiModule,
  ],
})
export class AppModule {}
