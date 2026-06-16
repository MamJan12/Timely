import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

const adminSelect = {
  id: true,
  firstName: true,
  lastName: true,
  createdAt: true,
  user: { select: { id: true, email: true, role: true } },
};

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.admin.findMany({ select: adminSelect });
  }

  async findById(id: string) {
    return this.prisma.admin.findUnique({ where: { id }, select: adminSelect });
  }

  async create(email: string, hashedPassword: string, firstName: string, lastName: string) {
    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ADMIN',
        admin: { create: { firstName, lastName } },
      },
      select: {
        id: true,
        email: true,
        role: true,
        admin: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async update(id: string, data: { email?: string; password?: string; firstName?: string; lastName?: string }) {
    const { firstName, lastName, ...userData } = data;
    return this.prisma.admin.update({
      where: { id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(Object.keys(userData).length > 0 && {
          user: { update: { ...userData } },
        }),
      },
      select: adminSelect,
    });
  }

  async delete(id: string) {
    const admin = await this.prisma.admin.findUnique({ where: { id }, select: { userId: true } });
    if (!admin) return null;
    return this.prisma.user.delete({ where: { id: admin.userId } });
  }
}
