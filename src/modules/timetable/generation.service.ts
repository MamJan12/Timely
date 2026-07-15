import { Injectable, BadRequestException } from '@nestjs/common';
import { Day, Level, Semester } from '@prisma/client';
import { ConflictDetectionService } from './conflict-detection.service';
import { TimetableRepository } from './timetable.repository';

// Match the 5 days the frontend timetable shows (Tue–Sat)
const DAYS: Day[] = [Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY, Day.SATURDAY];

// 2-hour single periods
const SINGLE_SLOTS = [
  { startTime: '07:00', endTime: '09:00' },
  { startTime: '09:00', endTime: '11:00' },
  { startTime: '11:00', endTime: '13:00' },
  { startTime: '13:00', endTime: '15:00' },
  { startTime: '15:00', endTime: '17:00' },
  { startTime: '17:00', endTime: '19:00' },
];

// 4-hour double periods
const DOUBLE_SLOTS = [
  { startTime: '07:00', endTime: '11:00' },
  { startTime: '09:00', endTime: '13:00' },
  { startTime: '11:00', endTime: '15:00' },
  { startTime: '13:00', endTime: '17:00' },
  { startTime: '15:00', endTime: '19:00' },
];

function needsDoublePeriod(name: string, credits: number): boolean {
  if (credits >= 4) return true;
  const lower = name.toLowerCase();
  return ['laboratory', 'lab', 'practical', 'practice', 'workshop', 'project'].some(kw =>
    lower.includes(kw),
  );
}

function timesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart < bEnd && aEnd > bStart;
}

@Injectable()
export class GenerationService {
  constructor(
    private readonly timetableRepository: TimetableRepository,
    private readonly conflictDetectionService: ConflictDetectionService,
  ) {}

  async generate(timetableId: string, departmentId: string, level: Level, semester: Semester) {
    const allCourses = await this.timetableRepository.findCoursesByDeptLevel(departmentId, level);

    if (!allCourses.length) {
      throw new BadRequestException(
        'No courses found for this department and level. Please add courses first.',
      );
    }

    // Soft constraint: FIRST semester → odd last digit; SECOND semester → even last digit
    const semesterCourses = allCourses.filter(course => {
      const lastDigit = parseInt(course.code.charAt(course.code.length - 1), 10);
      if (isNaN(lastDigit)) return true;
      return semester === Semester.FIRST ? lastDigit % 2 !== 0 : lastDigit % 2 === 0;
    });
    // If filtering leaves nothing, fall back to all courses
    const courses = semesterCourses.length > 0 ? semesterCourses : allCourses;

    const allLecturers = await this.timetableRepository.findAllLecturerIds();
    if (!allLecturers.length) {
      throw new BadRequestException(
        'No lecturers found in the system. Please add lecturers before generating.',
      );
    }

    const lecturerPool = [...allLecturers].sort(() => Math.random() - 0.5);
    let poolIndex = 0;

    const scheduled: Array<{
      courseId: string;
      lecturerId: string;
      day: Day;
      startTime: string;
      endTime: string;
    }> = [];

    for (const course of courses) {
      const lecturerId = course.lecturers.length
        ? course.lecturers[0].lecturerId
        : lecturerPool[poolIndex++ % lecturerPool.length].id;

      const double = needsDoublePeriod(course.name, course.credits);
      let placed = false;

      // Try preferred slot type first; fall back to single-period if double can't fit
      for (const slotList of double ? [DOUBLE_SLOTS, SINGLE_SLOTS] : [SINGLE_SLOTS]) {
        if (placed) break;
        for (const day of DAYS) {
          if (placed) break;
          for (const timeSlot of slotList) {
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
              s =>
                s.day === day &&
                timesOverlap(s.startTime, s.endTime, timeSlot.startTime, timeSlot.endTime),
            );

            if (!conflicts.length && !alreadyScheduled) {
              scheduled.push({ courseId: course.id, lecturerId, day, ...timeSlot });
              placed = true;
              break;
            }
          }
        }
      }
    }

    const created = await this.timetableRepository.bulkCreateSlots(timetableId, scheduled);

    return { generated: created.length, total: courses.length, slots: created };
  }
}
