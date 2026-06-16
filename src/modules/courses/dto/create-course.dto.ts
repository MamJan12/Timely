import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Level } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({ example: 'CS101' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Introduction to Computer Science' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  credits?: number;

  @ApiProperty({ example: 'clx123abc' })
  @IsString()
  departmentId: string;

  @ApiProperty({ enum: Level, example: Level.L100 })
  @IsEnum(Level)
  level: Level;

  @ApiPropertyOptional({ example: false, description: 'True if the course is shared across departments' })
  @IsOptional()
  @IsBoolean()
  isShared?: boolean;
}
