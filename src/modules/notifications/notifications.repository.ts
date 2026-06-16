import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findForUser(lecturerId?: string, studentId?: string) {
    return this.prisma.notification.findMany({
      where: {
        ...(lecturerId && { lecturerId }),
        ...(studentId && { studentId }),
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, type: true, message: true, isRead: true, createdAt: true },
    });
  }

  findById(id: string) {
    return this.prisma.notification.findUnique({ where: { id } });
  }

  create(data: { type: NotificationType; message: string; lecturerId?: string; studentId?: string }) {
    return this.prisma.notification.create({ data });
  }

  markRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
      select: { id: true, isRead: true },
    });
  }

  findAllAdmins() {
    return this.prisma.admin.findMany({ select: { userId: true } });
  }
}
