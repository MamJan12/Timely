import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AssignLecturerDto {
  @ApiProperty({ example: 'clx456def', description: 'Lecturer ID to assign to the course' })
  @IsString()
  lecturerId: string;
}
