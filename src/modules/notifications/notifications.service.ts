import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { NotificationsRepository } from './notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  getMyNotifications(lecturerId?: string, studentId?: string) {
    return this.notificationsRepository.findForUser(lecturerId, studentId);
  }

  async markRead(id: string) {
    const notification = await this.notificationsRepository.findById(id);
    if (!notification) throw new NotFoundException('Notification not found');
    return this.notificationsRepository.markRead(id);
  }

  createForLecturer(lecturerId: string, type: NotificationType, message: string) {
    return this.notificationsRepository.create({ type, message, lecturerId });
  }

  createForStudent(studentId: string, type: NotificationType, message: string) {
    return this.notificationsRepository.create({ type, message, studentId });
  }

  async createForAdmin(type: NotificationType, message: string) {
    // Stored as system-level; admins see it via dashboard
    return this.notificationsRepository.create({ type, message });
  }

  async notifyTimetablePublished(lecturerIds: string[], studentIds: string[], message: string) {
    const promises = [
      ...lecturerIds.map((id) => this.createForLecturer(id, 'TIMETABLE_PUBLISHED', message)),
      ...studentIds.map((id) => this.createForStudent(id, 'TIMETABLE_PUBLISHED', message)),
    ];
    await Promise.all(promises);
  }
}
