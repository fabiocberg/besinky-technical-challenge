import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateTaskStatusDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isCompleted: boolean;
}
