import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreate() {
    const existing = await this.prisma.systemSettings.findFirst();
    if (existing) return existing;
    return this.prisma.systemSettings.create({ data: {} });
  }

  async update(id: string, data: any) {
    return this.prisma.systemSettings.update({ where: { id }, data });
  }
}
