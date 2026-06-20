import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateSchoolDto {
  @ApiProperty({ example: 'School of Engineering and Technology' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'SET' })
  @IsString()
  @MaxLength(10)
  abbreviation: string;
}
