import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Computer Science' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'CS' })
  @IsString()
  @MaxLength(10)
  code: string;
}
