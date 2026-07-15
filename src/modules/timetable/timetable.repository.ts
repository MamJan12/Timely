import { Injectable } from '@nestjs/common';
import { Day, Level, Semester, TimetableStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const slotSelect = {
  id: true,
  day: true,
  startTime: true,
  endTime: true,
  venue: true,
  createdAt: true,
  course: { select: { id: true, code: true, name: true, level: true } },
  lecturer: { select: { id: true, firstName: true, lastName: true, staffId: true } },
  timetable: { select: { id: true, departmentId: true, level: true, semester: true } },
};

@Injectable()
export class TimetableRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters: { departmentId?: string; level?: Level; semester?: Semester; status?: TimetableStatus }) {
    return this.prisma.timetable.findMany({
      where: {
        ...(filters.departmentId && { departmentId: filters.departmentId }),
        ...(filters.level && { level: filters.level }),
        ...(filters.semester && { semester: filters.semester }),
        ...(filters.status && { status: filters.status }),
      },
      select: {
        id: true,
        level: true,
        semester: true,
        academicYear: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        department: { select: { id: true, name: true, code: true } },
        _count: { select: { slots: true } },
      },
    });
  }

  findById(id: string) {
    return this.prisma.timetable.findUnique({
      where: { id },
      select: {
        id: true,
        level: true,
        semester: true,
        academicYear: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        department: { select: { id: true, name: true, code: true } },
        slots: { select: slotSelect },
      },
    });
  }

  findByDeptLevelSemester(departmentId: string, level: Level, semester: Semester, academicYear: string) {
    return this.prisma.timetable.findUnique({
      where: { departmentId_level_semester_academicYear: { departmentId, level, semester, academicYear } },
    });
  }

  create(data: { departmentId: string; level: Level; semester: Semester; academicYear: string }) {
    return this.prisma.timetable.create({
      data,
      select: { id: true, level: true, semester: true, academicYear: true, status: true, department: { select: { name: true } } },
    });
  }

  updateStatus(id: string, status: TimetableStatus) {
    return this.prisma.timetable.update({
      where: { id },
      data: { status },
      select: { id: true, status: true, updatedAt: true },
    });
  }

  delete(id: string) {
    return this.prisma.timetable.delete({ where: { id } });
  }

  // Slot operations
  findSlotsByTimetable(timetableId: string) {
    return this.prisma.timetableSlot.findMany({
      where: { timetableId },
      select: slotSelect,
    });
  }

  findSlotById(id: string) {
    return this.prisma.timetableSlot.findUnique({ where: { id }, select: slotSelect });
  }

  createSlot(timetableId: string, data: { day: any; startTime: string; endTime: string; courseId: string; lecturerId: string; venue?: string }) {
    return this.prisma.timetableSlot.create({
      data: { timetableId, ...data },
      select: slotSelect,
    });
  }

  updateSlot(id: string, data: { day?: any; startTime?: string; endTime?: string; courseId?: string; lecturerId?: string; venue?: string }) {
    return this.prisma.timetableSlot.update({ where: { id }, data, select: slotSelect });
  }

  deleteSlot(id: string) {
    return this.prisma.timetableSlot.delete({ where: { id } });
  }

  // Conflict detection queries
  findLecturerSlotsOnDay(lecturerId: string, day: any, excludeSlotId?: string) {
    return this.prisma.timetableSlot.findMany({
      where: {
        lecturerId,
        day,
        ...(excludeSlotId && { id: { not: excludeSlotId } }),
      },
      select: { id: true, startTime: true, endTime: true, day: true, timetableId: true, course: { select: { code: true, name: true } }, timetable: { select: { departmentId: true, level: true } } },
    });
  }

  findDeptLevelSlotsOnDay(departmentId: string, level: Level, day: any, excludeSlotId?: string) {
    return this.prisma.timetableSlot.findMany({
      where: {
        day,
        timetable: { departmentId, level },
        ...(excludeSlotId && { id: { not: excludeSlotId } }),
      },
      select: { id: true, startTime: true, endTime: true, day: true, courseId: true, lecturerId: true, course: { select: { code: true, name: true } } },
    });
  }

  findVenueSlotsOnDay(venue: string, day: any, excludeSlotId?: string) {
    return this.prisma.timetableSlot.findMany({
      where: {
        venue,
        day,
        ...(excludeSlotId && { id: { not: excludeSlotId } }),
      },
      select: { id: true, startTime: true, endTime: true, timetableId: true, course: { select: { code: true } } },
    });
  }

  findStudentByUserId(userId: string) {
    return this.prisma.student.findUnique({
      where: { userId },
      select: { departmentId: true, level: true },
    });
  }

  // Student timetable view — finds the most recent PUBLISHED timetable for the student's dept/level/semester
  findStudentTimetable(departmentId: string, level: Level, semester: Semester) {
    return this.prisma.timetable.findFirst({
      where: { departmentId, level, semester, status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        level: true,
        semester: true,
        academicYear: true,
        status: true,
        department: { select: { name: true, code: true } },
        slots: {
          select: {
            id: true,
            day: true,
            startTime: true,
            endTime: true,
            venue: true,
            course: { select: { id: true, code: true, name: true, level: true } },
            lecturer: { select: { id: true, firstName: true, lastName: true, staffId: true } },
          },
          orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
        },
      },
    });
  }

  // Lecturer timetable view — all slots assigned to this lecturer across all timetables
  findLecturerTimetable(userId: string) {
    return this.prisma.timetableSlot.findMany({
      where: {
        lecturer: { userId },
      },
      select: {
        id: true,
        day: true,
        startTime: true,
        endTime: true,
        venue: true,
        course: { select: { id: true, code: true, name: true, level: true } },
        timetable: {
          select: {
            id: true,
            level: true,
            semester: true,
            academicYear: true,
            status: true,
            department: { select: { id: true, name: true, code: true } },
          },
        },
      },
      orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
    });
  }

  // Generation helpers
  findCoursesByDeptLevel(departmentId: string, level: Level) {
    return this.prisma.course.findMany({
      where: { departmentId, level },
      select: {
        id: true,
        code: true,
        name: true,
        credits: true,
        isShared: true,
        lecturers: { select: { lecturerId: true } },
      },
    });
  }

  findAllLecturerIds() {
    return this.prisma.lecturer.findMany({ select: { id: true } });
  }

  bulkCreateSlots(
    timetableId: string,
    slots: Array<{ courseId: string; lecturerId: string; day: Day; startTime: string; endTime: string }>,
  ) {
    return this.prisma.$transaction(
      slots.map(slot =>
        this.prisma.timetableSlot.create({
          data: { timetableId, ...slot },
          select: { id: true, day: true, startTime: true, endTime: true, courseId: true, lecturerId: true },
        }),
      ),
    );
  }
}
