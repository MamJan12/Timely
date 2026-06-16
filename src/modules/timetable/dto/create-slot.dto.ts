import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Day } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class CreateSlotDto {
  @ApiProperty({ enum: Day, example: Day.MONDAY })
  @IsEnum(Day)
  day: Day;

  @ApiProperty({ example: '08:00', description: 'Start time in HH:MM format' })
  @IsString()
  @Matches(TIME_REGEX, { message: 'startTime must be in HH:MM format (e.g. 08:00)' })
  startTime: string;

  @ApiProperty({ example: '10:00', description: 'End time in HH:MM format' })
  @IsString()
  @Matches(TIME_REGEX, { message: 'endTime must be in HH:MM format (e.g. 10:00)' })
  endTime: string;

  @ApiProperty({ example: 'clx789ghi' })
  @IsString()
  courseId: string;

  @ApiProperty({ example: 'clx456def' })
  @IsString()
  lecturerId: string;

  @ApiPropertyOptional({ example: 'LT1' })
  @IsOptional()
  @IsString()
  venue?: string;
}
