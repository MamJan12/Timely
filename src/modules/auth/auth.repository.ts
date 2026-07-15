import { Injectable } from '@nestjs/common';
import { Level, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const userSelect = {
  id: true,
  email: true,
  password: true,
  role: true,
  admin:    { select: { id: true, firstName: true, lastName: true } },
  lecturer: { select: { id: true, firstName: true, lastName: true, staffId: true } },
  student:  { select: { id: true, firstName: true, lastName: true, studentId: true } },
} as const;

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email }, select: userSelect });
  }

  async findUserByStaffId(staffId: string) {
    const lecturer = await this.prisma.lecturer.findFirst({
      where: { staffId: { equals: staffId, mode: 'insensitive' } },
      select: { user: { select: userSelect } },
    });
    return lecturer?.user ?? null;
  }

  async findUserByStudentId(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { studentId },
      select: { user: { select: userSelect } },
    });
    return student?.user ?? null;
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        admin:    { select: { id: true, firstName: true, lastName: true } },
        lecturer: { select: { id: true, firstName: true, lastName: true, staffId: true, departmentId: true } },
        student:  { select: { id: true, firstName: true, lastName: true, studentId: true, departmentId: true, level: true } },
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

  async isStudentIdTaken(studentId: string) {
    return this.prisma.student.findUnique({ where: { studentId }, select: { id: true } });
  }

  private async generateUniqueStaffId(): Promise<string> {
    let staffId: string;
    let exists: boolean;
    do {
      const num = Math.floor(Math.random() * 9000) + 1000;
      staffId = `STF${num}`;
      exists = !!(await this.prisma.lecturer.findUnique({ where: { staffId }, select: { id: true } }));
    } while (exists);
    return staffId;
  }

  async createAdminAccount(data: { email: string; password: string; firstName: string; lastName: string }) {
    return this.prisma.user.create({
      data: {
        email:    data.email,
        password: data.password,
        role:     'ADMIN',
        admin: { create: { firstName: data.firstName, lastName: data.lastName } },
      },
      select: { id: true, email: true, role: true },
    });
  }

  async createLecturerAccount(data: { email: string; password: string; firstName: string; lastName: string }) {
    const staffId = await this.generateUniqueStaffId();
    return this.prisma.user.create({
      data: {
        email:    data.email,
        password: data.password,
        role:     'LECTURER',
        lecturer: { create: { firstName: data.firstName, lastName: data.lastName, staffId } },
      },
      select: {
        id: true,
        email: true,
        role: true,
        lecturer: { select: { staffId: true } },
      },
    });
  }

  // ── Lecturer identity / claim ───────────────────────────────────────────────

  async searchLecturersByName(query: string) {
    return this.prisma.lecturer.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName:  { contains: query, mode: 'insensitive' } },
        ],
      },
      select: { id: true, firstName: true, lastName: true, staffId: true },
      take: 5,
    });
  }

  async findLecturerById(id: string) {
    return this.prisma.lecturer.findUnique({
      where: { id },
      select: { id: true, userId: true, staffId: true },
    });
  }

  async claimLecturerAccount(lecturerId: string, data: { email: string; password: string }) {
    const lecturer = await this.prisma.lecturer.findUniqueOrThrow({
      where: { id: lecturerId },
      select: { userId: true, staffId: true },
    });
    const user = await this.prisma.user.update({
      where: { id: lecturer.userId },
      data: { email: data.email, password: data.password },
      select: { id: true, email: true, role: true },
    });
    return { user, staffId: lecturer.staffId };
  }

  async createStudentAccount(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    studentId: string;
    departmentId: string;
    level: Level;
  }) {
    return this.prisma.user.create({
      data: {
        email:    data.email,
        password: data.password,
        role:     'STUDENT',
        student: {
          create: {
            firstName:    data.firstName,
            lastName:     data.lastName,
            studentId:    data.studentId,
            departmentId: data.departmentId,
            level:        data.level,
          },
        },
      },
      select: { id: true, email: true, role: true },
    });
  }
}
