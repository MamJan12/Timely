import { ApiProperty } from '@nestjs/swagger';
import { Level, Semester } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class CreateTimetableDto {
  @ApiProperty({ example: 'clx123abc' })
  @IsString()
  departmentId: string;

  @ApiProperty({ enum: Level, example: Level.L100 })
  @IsEnum(Level)
  level: Level;

  @ApiProperty({ enum: Semester, example: Semester.FIRST })
  @IsEnum(Semester)
  semester: Semester;

  @ApiProperty({ example: '2024/2025' })
  @IsString()
  academicYear: string;
}
