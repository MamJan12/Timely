import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Level } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateComplaintDto {
  @ApiProperty({ example: 'This time slot clashes with another class I have on the same day.' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'cld_abc123' })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({ enum: Level })
  @IsOptional()
  @IsEnum(Level)
  level?: Level;

  // Lecturer-only: time change request
  @ApiPropertyOptional({ example: 'THURSDAY' })
  @IsOptional()
  @IsString()
  requestedDay?: string;

  @ApiPropertyOptional({ example: '09:00' })
  @IsOptional()
  @IsString()
  requestedStartTime?: string;

  @ApiPropertyOptional({ example: '11:00' })
  @IsOptional()
  @IsString()
  requestedEndTime?: string;
}
