import { ApiPropertyOptional } from '@nestjs/swagger';
import { Semester } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ example: '2024/2025' })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiPropertyOptional({ enum: Semester })
  @IsOptional()
  @IsEnum(Semester)
  currentSemester?: Semester;

  @ApiPropertyOptional({ example: '2024-09-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  semesterStartDate?: string;

  @ApiPropertyOptional({ example: '2025-01-31T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  semesterEndDate?: string;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(180)
  slotDuration?: number;

  @ApiPropertyOptional({ example: '07:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  slotStartTime?: string;

  @ApiPropertyOptional({ example: '19:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  slotEndTime?: string;
}
