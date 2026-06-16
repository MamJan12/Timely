import { Module } from '@nestjs/common';
import { ConflictDetectionService } from './conflict-detection.service';
import { GenerationService } from './generation.service';
import { TimetableController } from './timetable.controller';
import { TimetableRepository } from './timetable.repository';
import { TimetableService } from './timetable.service';

@Module({
  controllers: [TimetableController],
  providers: [
    TimetableService,
    TimetableRepository,
    ConflictDetectionService,
    GenerationService,
  ],
  exports: [TimetableService],
})
export class TimetableModule {}
