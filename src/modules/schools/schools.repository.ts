import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SchoolsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.school.findMany({
      select: {
        id: true,
        name: true,
        abbreviation: true,
        createdAt: true,
        _count: { select: { departments: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.school.findUnique({
      where: { id },
      select: { id: true, name: true, abbreviation: true, createdAt: true },
    });
  }

  create(name: string, abbreviation: string) {
    return this.prisma.school.create({
      data: { name, abbreviation },
      select: { id: true, name: true, abbreviation: true, createdAt: true },
    });
  }

  update(id: string, data: { name?: string; abbreviation?: string }) {
    return this.prisma.school.update({
      where: { id },
      data,
      select: { id: true, name: true, abbreviation: true, createdAt: true },
    });
  }

  delete(id: string) {
    return this.prisma.school.delete({ where: { id } });
  }
}
