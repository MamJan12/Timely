import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterAdminDto {
  @ApiProperty({ example: 'Jane', description: 'First name' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'jane.doe@timely.edu', description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securepassword', description: 'Password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  password: string;
}
