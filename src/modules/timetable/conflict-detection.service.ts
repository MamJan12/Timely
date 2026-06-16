import { Injectable } from '@nestjs/common';
import { Day, Level } from '@prisma/client';
import { TimetableRepository } from './timetable.repository';

export interface ConflictResult {
  type: 'LECTURER_DOUBLE_BOOKED' | 'LEVEL_CLASH' | 'VENUE_CLASH';
  conflictingSlotIds: string[];
  details: string;
}

function timesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string,
): boolean {
  return start1 < end2 && start2 < end1;
}

@Injectable()
export class ConflictDetectionService {
  constructor(private readonly timetableRepository: TimetableRepository) {}

  async checkConflicts(
    timetableId: string,
    day: Day,
    startTime: string,
    endTime: string,
    lecturerId: string,
    departmentId: string,
    level: Level,
    venue?: string,
    excludeSlotId?: string,
  ): Promise<ConflictResult[]> {
    const conflicts: ConflictResult[] = [];

    const [lecturerSlots, deptSlots] = await Promise.all([
      this.timetableRepository.findLecturerSlotsOnDay(lecturerId, day, excludeSlotId),
      this.timetableRepository.findDeptLevelSlotsOnDay(departmentId, level, day, excludeSlotId),
    ]);

    for (const slot of lecturerSlots) {
      if (timesOverlap(startTime, endTime, slot.startTime, slot.endTime)) {
        conflicts.push({
          type: 'LECTURER_DOUBLE_BOOKED',
          conflictingSlotIds: [slot.id],
          details: `Lecturer is already scheduled for ${slot.course.code} (${slot.startTime}–${slot.endTime}) on ${day}`,
        });
      }
    }

    for (const slot of deptSlots) {
      if (timesOverlap(startTime, endTime, slot.startTime, slot.endTime)) {
        conflicts.push({
          type: 'LEVEL_CLASH',
          conflictingSlotIds: [slot.id],
          details: `${level} already has ${slot.course.code} scheduled at (${slot.startTime}–${slot.endTime}) on ${day}`,
        });
      }
    }

    if (venue) {
      const venueSlots = await this.timetableRepository.findVenueSlotsOnDay(venue, day, excludeSlotId);
      for (const slot of venueSlots) {
        if (timesOverlap(startTime, endTime, slot.startTime, slot.endTime)) {
          conflicts.push({
            type: 'VENUE_CLASH',
            conflictingSlotIds: [slot.id],
            details: `Venue ${venue} is already in use for ${slot.course.code} at (${slot.startTime}–${slot.endTime}) on ${day}`,
          });
        }
      }
    }

    return conflicts;
  }
}
