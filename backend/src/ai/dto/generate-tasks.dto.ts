import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class GenerateTasksDto {
  @ApiProperty({ example: 'Planejar uma viagem' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(400)
  goal: string;

  @ApiProperty({
    example: 'sk-...',
    description: 'OpenAI API key used only for this request.',
  })
  @IsString()
  @IsNotEmpty()
  apiKey: string;
}
