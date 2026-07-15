import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterLecturerDto {
  @ApiProperty({ example: 'Basil', description: 'First name' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Wirnkar', description: 'Last name' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'basil.wirnkar@buib.edu', description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securepassword', description: 'Password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ description: 'ID of an existing Lecturer record to claim (link this account to it)' })
  @IsOptional()
  @IsString()
  claimLecturerId?: string;
}
