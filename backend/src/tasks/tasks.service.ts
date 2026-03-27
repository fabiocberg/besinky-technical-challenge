import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task } from './entities/task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async create(
    createTaskDto: CreateTaskDto,
    isAiGenerated = false,
  ): Promise<Task> {
    try {
      const task = this.taskRepository.create({
        title: createTaskDto.title.trim(),
        isAiGenerated,
        isCompleted: false,
      });

      return await this.taskRepository.save(task);
    } catch {
      throw new InternalServerErrorException('Failed to create task.');
    }
  }

  async createMany(titles: string[]): Promise<Task[]> {
    try {
      const tasks = this.taskRepository.create(
        titles.map((title) => ({
          title: title.trim(),
          isAiGenerated: true,
          isCompleted: false,
        })),
      );

      return await this.taskRepository.save(tasks);
    } catch {
      throw new InternalServerErrorException(
        'Failed to persist AI-generated tasks.',
      );
    }
  }

  async findAll(): Promise<Task[]> {
    try {
      return await this.taskRepository.find({
        order: {
          createdAt: 'DESC',
          id: 'DESC',
        },
      });
    } catch {
      throw new InternalServerErrorException('Failed to fetch tasks.');
    }
  }

  async updateStatus(id: number, isCompleted: boolean): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task ${id} not found.`);
    }

    task.isCompleted = isCompleted;

    try {
      return await this.taskRepository.save(task);
    } catch {
      throw new InternalServerErrorException('Failed to update task status.');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.taskRepository.delete(id);

      if (!result.affected) {
        throw new NotFoundException(`Task ${id} not found.`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to delete task.');
    }
  }
}
