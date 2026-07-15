import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin@timely.edu or STF0042 or SENG22SE019',
    description: 'Email address, staff ID (lecturers), or student ID / matricule (students)',
  })
  @IsString()
  identifier: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsString()
  @MinLength(6)
  password: string;
}
