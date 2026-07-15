import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Level } from '@prisma/client';

export class RegisterStudentDto {
  @ApiProperty({ example: 'Alice', description: 'First name' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Smith', description: 'Last name' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'STU099', description: 'Your institutional student ID' })
  @IsString()
  studentId: string;

  @ApiProperty({ example: 'alice.smith@student.buib.edu', description: 'Email address (will be your login)' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securepassword', description: 'Password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'L400', enum: Level, description: 'Current academic level' })
  @IsEnum(Level)
  level: Level;

  @ApiProperty({ example: 'clxyz123', description: 'Department ID' })
  @IsString()
  departmentId: string;
}
