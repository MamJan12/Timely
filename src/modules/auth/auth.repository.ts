import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        admin: { select: { id: true, firstName: true, lastName: true } },
        lecturer: { select: { id: true, firstName: true, lastName: true, staffId: true } },
        student: { select: { id: true, firstName: true, lastName: true, studentId: true } },
      },
    });
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        admin: { select: { id: true, firstName: true, lastName: true } },
        lecturer: { select: { id: true, firstName: true, lastName: true, staffId: true, departmentId: true } },
        student: { select: { id: true, firstName: true, lastName: true, studentId: true, departmentId: true, level: true } },
      },
    });
  }

  async saveRefreshToken(data: Prisma.RefreshTokenCreateInput) {
    return this.prisma.refreshToken.create({ data });
  }

  async findRefreshToken(token: string) {
    return this.prisma.refreshToken.findUnique({ where: { token } });
  }

  async deleteRefreshToken(token: string) {
    return this.prisma.refreshToken.delete({ where: { token } });
  }

  async deleteAllUserRefreshTokens(userId: string) {
    return this.prisma.refreshToken.deleteMany({ where: { userId } });
  }
}
