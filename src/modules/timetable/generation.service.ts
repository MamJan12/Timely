import { Injectable, BadRequestException } from '@nestjs/common';
import { Day, Level, Semester } from '@prisma/client';
import { ConflictDetectionService } from './conflict-detection.service';
import { TimetableRepository } from './timetable.repository';
import { PrismaService } from '../../prisma/prisma.service';

const DAYS: Day[] = [Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY];

const DEFAULT_SLOTS = [
  { startTime: '07:00', endTime: '09:00' },
  { startTime: '09:00', endTime: '11:00' },
  { startTime: '11:00', endTime: '13:00' },
  { startTime: '13:00', endTime: '15:00' },
  { startTime: '15:00', endTime: '17:00' },
  { startTime: '17:00', endTime: '19:00' },
];

@Injectable()
export class GenerationService {
  constructor(
    private readonly timetableRepository: TimetableRepository,
    private readonly conflictDetectionService: ConflictDetectionService,
    private readonly prisma: PrismaService,
  ) {}

  async generate(timetableId: string, departmentId: string, level: Level) {
    const courses = await this.timetableRepository.findCoursesByDeptLevel(departmentId, level);

    if (!courses.length) {
      throw new BadRequestException('No courses found for this department and level');
    }

    const scheduled: Array<{ courseId: string; lecturerId: string; day: Day; startTime: string; endTime: string }> = [];

    for (const course of courses) {
      if (!course.lecturers.length) continue;
      const lecturerId = course.lecturers[0].lecturerId;
      let placed = false;

      for (const day of DAYS) {
        if (placed) break;
        for (const timeSlot of DEFAULT_SLOTS) {
          const conflicts = await this.conflictDetectionService.checkConflicts(
            timetableId,
            day,
            timeSlot.startTime,
            timeSlot.endTime,
            lecturerId,
            departmentId,
            level,
          );

          const alreadyScheduled = scheduled.some(
            (s) =>
              s.day === day &&
              s.startTime === timeSlot.startTime &&
              (s.lecturerId === lecturerId ||
                courses.find((c) => c.id === s.courseId)?.id !== course.id),
          );

          if (!conflicts.length && !alreadyScheduled) {
            scheduled.push({ courseId: course.id, lecturerId, day, startTime: timeSlot.startTime, endTime: timeSlot.endTime });
            placed = true;
            break;
          }
        }
      }
    }

    // Persist proposed slots
    const created = await this.prisma.$transaction(
      scheduled.map((slot) =>
        this.prisma.timetableSlot.create({
          data: { timetableId, ...slot },
          select: { id: true, day: true, startTime: true, endTime: true, courseId: true, lecturerId: true },
        }),
      ),
    );

    return { generated: created.length, total: courses.length, slots: created };
  }
}
