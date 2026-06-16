import { ApiProperty } from '@nestjs/swagger';
import { Level } from '@prisma/client';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ example: 'student@school.edu' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Alice' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Smith' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'STU001' })
  @IsString()
  studentId: string;

  @ApiProperty({ example: 'clx123abc' })
  @IsString()
  departmentId: string;

  @ApiProperty({ enum: Level, example: Level.L100 })
  @IsEnum(Level)
  level: Level;
}
