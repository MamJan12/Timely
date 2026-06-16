import { ApiProperty } from '@nestjs/swagger';
import { TimetableStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateTimetableStatusDto {
  @ApiProperty({ enum: TimetableStatus, example: TimetableStatus.PUBLISHED })
  @IsEnum(TimetableStatus)
  status: TimetableStatus;
}
