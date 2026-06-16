import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DepartmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.department.findMany({
      select: { id: true, name: true, code: true, createdAt: true, _count: { select: { lecturers: true, students: true, courses: true } } },
    });
  }

  findById(id: string) {
    return this.prisma.department.findUnique({
      where: { id },
      select: { id: true, name: true, code: true, createdAt: true },
    });
  }

  create(name: string, code: string) {
    return this.prisma.department.create({
      data: { name, code },
      select: { id: true, name: true, code: true, createdAt: true },
    });
  }

  update(id: string, data: { name?: string; code?: string }) {
    return this.prisma.department.update({
      where: { id },
      data,
      select: { id: true, name: true, code: true, createdAt: true },
    });
  }

  delete(id: string) {
    return this.prisma.department.delete({ where: { id } });
  }
}
