import { Injectable } from '@nestjs/common';
import { Level } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const courseSelect = {
  id: true,
  code: true,
  name: true,
  credits: true,
  level: true,
  isShared: true,
  createdAt: true,
  department: { select: { id: true, name: true, code: true } },
  lecturers: {
    select: {
      lecturer: { select: { id: true, firstName: true, lastName: true, staffId: true } },
    },
  },
};

@Injectable()
export class CoursesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(departmentId?: string, level?: Level) {
    return this.prisma.course.findMany({
      where: {
        ...(departmentId && { departmentId }),
        ...(level && { level }),
      },
      select: courseSelect,
    });
  }

  findById(id: string) {
    return this.prisma.course.findUnique({ where: { id }, select: courseSelect });
  }

  findByCode(code: string) {
    return this.prisma.course.findUnique({ where: { code } });
  }

  findByLecturer(lecturerId: string) {
    return this.prisma.course.findMany({
      where: { lecturers: { some: { lecturerId } } },
      select: courseSelect,
    });
  }

  create(data: { code: string; name: string; credits?: number; departmentId: string; level: Level; isShared?: boolean }) {
    return this.prisma.course.create({ data, select: courseSelect });
  }

  update(id: string, data: { code?: string; name?: string; credits?: number; departmentId?: string; level?: Level; isShared?: boolean }) {
    return this.prisma.course.update({ where: { id }, data, select: courseSelect });
  }

  delete(id: string) {
    return this.prisma.course.delete({ where: { id } });
  }

  assignLecturer(courseId: string, lecturerId: string) {
    return this.prisma.lecturerCourse.create({ data: { courseId, lecturerId } });
  }

  removeLecturer(courseId: string, lecturerId: string) {
    return this.prisma.lecturerCourse.delete({
      where: { lecturerId_courseId: { courseId, lecturerId } },
    });
  }

  findAssignment(courseId: string, lecturerId: string) {
    return this.prisma.lecturerCourse.findUnique({
      where: { lecturerId_courseId: { courseId, lecturerId } },
    });
  }
}
