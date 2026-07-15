import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RespondComplaintDto {
  @ApiProperty({ example: 'Please see me during office hours this week for further clarification.' })
  @IsString()
  @MinLength(1)
  adminResponse: string;
}
