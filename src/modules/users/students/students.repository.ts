import { Injectable } from '@nestjs/common';
import { Level } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

const studentSelect = {
  id: true,
  studentId: true,
  firstName: true,
  lastName: true,
  level: true,
  createdAt: true,
  user: { select: { id: true, email: true, role: true } },
  department: { select: { id: true, name: true, code: true } },
};

@Injectable()
export class StudentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(departmentId?: string, level?: Level) {
    return this.prisma.student.findMany({
      where: {
        ...(departmentId && { departmentId }),
        ...(level && { level }),
      },
      select: studentSelect,
    });
  }

  async findById(id: string) {
    return this.prisma.student.findUnique({ where: { id }, select: studentSelect });
  }

  async create(
    email: string,
    hashedPassword: string,
    firstName: string,
    lastName: string,
    studentId: string,
    departmentId: string,
    level: Level,
  ) {
    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'STUDENT',
        student: { create: { firstName, lastName, studentId, departmentId, level } },
      },
      select: {
        id: true,
        email: true,
        role: true,
        student: { select: { id: true, firstName: true, lastName: true, studentId: true, level: true } },
      },
    });
  }

  async update(
    id: string,
    data: { email?: string; password?: string; firstName?: string; lastName?: string; studentId?: string; departmentId?: string; level?: Level },
  ) {
    const { firstName, lastName, studentId, departmentId, level, ...userData } = data;

    if (Object.keys(userData).length > 0) {
      const student = await this.prisma.student.findUnique({ where: { id }, select: { userId: true } });
      if (student) {
        await this.prisma.user.update({ where: { id: student.userId }, data: userData });
      }
    }

    return this.prisma.student.update({
      where: { id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(studentId && { studentId }),
        ...(departmentId && { departmentId }),
        ...(level && { level }),
      },
      select: studentSelect,
    });
  }

  async delete(id: string) {
    const student = await this.prisma.student.findUnique({ where: { id }, select: { userId: true } });
    if (!student) return null;
    return this.prisma.user.delete({ where: { id: student.userId } });
  }
}
