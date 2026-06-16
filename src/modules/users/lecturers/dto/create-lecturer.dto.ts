import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateLecturerDto {
  @ApiProperty({ example: 'lecturer@school.edu' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'James' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Brown' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'STF001' })
  @IsString()
  staffId: string;

  @ApiPropertyOptional({ example: 'clx123abc' })
  @IsOptional()
  @IsString()
  departmentId?: string;
}
