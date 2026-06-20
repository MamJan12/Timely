import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ProgramType } from '@prisma/client';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Computer Science' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'CS' })
  @IsString()
  @MaxLength(10)
  code: string;

  @ApiPropertyOptional({ description: 'School ID this department belongs to' })
  @IsOptional()
  @IsString()
  schoolId?: string;

  @ApiProperty({ enum: ProgramType, default: ProgramType.UNDERGRADUATE })
  @IsEnum(ProgramType)
  programType: ProgramType;
}
