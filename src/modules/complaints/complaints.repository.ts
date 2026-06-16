import { Injectable } from '@nestjs/common';
import { ComplaintStatus, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ComplaintsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters: { status?: ComplaintStatus; role?: Role; departmentId?: string; date?: string }) {
    return this.prisma.complaint.findMany({
      where: {
        ...(filters.status && { status: filters.status }),
        ...(filters.role && { submitterRole: filters.role }),
        ...(filters.date && { createdAt: { gte: new Date(filters.date) } }),
      },
      select: {
        id: true,
        submitterRole: true,
        description: true,
        level: true,
        status: true,
        resolvedById: true,
        resolvedAt: true,
        createdAt: true,
        course: { select: { code: true, name: true } },
        lecturer: { select: { id: true, firstName: true, lastName: true } },
        student: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.complaint.findUnique({
      where: { id },
      select: {
        id: true,
        submitterRole: true,
        description: true,
        level: true,
        status: true,
        resolvedById: true,
        resolvedAt: true,
        createdAt: true,
        updatedAt: true,
        course: { select: { code: true, name: true } },
        lecturer: { select: { id: true, firstName: true, lastName: true } },
        student: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  findBySubmitter(lecturerId?: string, studentId?: string) {
    return this.prisma.complaint.findMany({
      where: {
        ...(lecturerId && { lecturerId }),
        ...(studentId && { studentId }),
      },
      select: {
        id: true,
        submitterRole: true,
        description: true,
        status: true,
        createdAt: true,
        course: { select: { code: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: {
    submitterRole: Role;
    description: string;
    courseId?: string;
    level?: any;
    lecturerId?: string;
    studentId?: string;
  }) {
    return this.prisma.complaint.create({
      data,
      select: { id: true, submitterRole: true, description: true, status: true, createdAt: true },
    });
  }

  resolve(id: string, resolvedById: string) {
    return this.prisma.complaint.update({
      where: { id },
      data: { status: 'RESOLVED', resolvedById, resolvedAt: new Date() },
      select: { id: true, status: true, resolvedById: true, resolvedAt: true },
    });
  }
}
