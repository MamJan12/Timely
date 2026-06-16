import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

const lecturerSelect = {
  id: true,
  staffId: true,
  firstName: true,
  lastName: true,
  departmentId: true,
  createdAt: true,
  user: { select: { id: true, email: true, role: true } },
  department: { select: { id: true, name: true, code: true } },
};

@Injectable()
export class LecturersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.lecturer.findMany({ select: lecturerSelect });
  }

  async findById(id: string) {
    return this.prisma.lecturer.findUnique({ where: { id }, select: lecturerSelect });
  }

  async findByUserId(userId: string) {
    return this.prisma.lecturer.findUnique({ where: { userId }, select: lecturerSelect });
  }

  async create(
    email: string,
    hashedPassword: string,
    firstName: string,
    lastName: string,
    staffId: string,
    departmentId?: string,
  ) {
    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'LECTURER',
        lecturer: {
          create: { firstName, lastName, staffId, ...(departmentId && { departmentId }) },
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        lecturer: { select: { id: true, firstName: true, lastName: true, staffId: true } },
      },
    });
  }

  async update(
    id: string,
    data: { email?: string; password?: string; firstName?: string; lastName?: string; staffId?: string; departmentId?: string },
  ) {
    const { firstName, lastName, staffId, departmentId, ...userData } = data;

    if (Object.keys(userData).length > 0) {
      const lecturer = await this.prisma.lecturer.findUnique({ where: { id }, select: { userId: true } });
      if (lecturer) {
        await this.prisma.user.update({ where: { id: lecturer.userId }, data: userData });
      }
    }

    return this.prisma.lecturer.update({
      where: { id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(staffId && { staffId }),
        ...(departmentId !== undefined && { departmentId }),
      },
      select: lecturerSelect,
    });
  }

  async delete(id: string) {
    const lecturer = await this.prisma.lecturer.findUnique({ where: { id }, select: { userId: true } });
    if (!lecturer) return null;
    return this.prisma.user.delete({ where: { id: lecturer.userId } });
  }

  async findCourses(lecturerId: string) {
    return this.prisma.lecturerCourse.findMany({
      where: { lecturerId },
      select: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            credits: true,
            level: true,
            department: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });
  }

  async findAvailability(lecturerId: string) {
    return this.prisma.timetableSlot.findMany({
      where: { lecturerId },
      select: {
        id: true,
        day: true,
        startTime: true,
        endTime: true,
        venue: true,
        timetable: { select: { id: true, semester: true, academicYear: true, department: { select: { name: true } }, level: true } },
        course: { select: { code: true, name: true } },
      },
    });
  }
}
