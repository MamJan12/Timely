import { Injectable } from '@nestjs/common';
import { ProgramType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DepartmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultSelect = {
    id: true,
    name: true,
    code: true,
    schoolId: true,
    programType: true,
    createdAt: true,
    school: { select: { id: true, name: true, abbreviation: true } },
    _count: { select: { lecturers: true, students: true, courses: true } },
  } as const;

  findAll() {
    return this.prisma.department.findMany({
      select: this.defaultSelect,
      orderBy: { name: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.department.findUnique({
      where: { id },
      select: this.defaultSelect,
    });
  }

  create(data: { name: string; code: string; schoolId?: string; programType: ProgramType }) {
    return this.prisma.department.create({
      data,
      select: this.defaultSelect,
    });
  }

  update(id: string, data: { name?: string; code?: string; schoolId?: string; programType?: ProgramType }) {
    return this.prisma.department.update({
      where: { id },
      data,
      select: this.defaultSelect,
    });
  }

  delete(id: string) {
    return this.prisma.department.delete({ where: { id } });
  }
}
