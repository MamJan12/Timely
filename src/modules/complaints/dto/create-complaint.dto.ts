import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Level } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateComplaintDto {
  @ApiProperty({ example: 'Timetable clash on Monday morning' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'CS101' })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({ enum: Level })
  @IsOptional()
  @IsEnum(Level)
  level?: Level;
}
