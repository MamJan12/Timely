import { Injectable, NotFoundException } from '@nestjs/common';
import { ComplaintStatus, Role } from '@prisma/client';
import { ComplaintsRepository } from './complaints.repository';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ComplaintsService {
  constructor(
    private readonly complaintsRepository: ComplaintsRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  findAll(filters: { status?: ComplaintStatus; role?: Role; departmentId?: string; date?: string }) {
    return this.complaintsRepository.findAll(filters);
  }

  async findOne(id: string) {
    const complaint = await this.complaintsRepository.findById(id);
    if (!complaint) throw new NotFoundException(`Complaint ${id} not found`);
    return complaint;
  }

  getMyComplaints(role: Role, lecturerId?: string, studentId?: string) {
    return this.complaintsRepository.findBySubmitter(
      role === Role.LECTURER ? lecturerId : undefined,
      role === Role.STUDENT ? studentId : undefined,
    );
  }

  async submit(dto: CreateComplaintDto, role: Role, lecturerId?: string, studentId?: string) {
    const complaint = await this.complaintsRepository.create({
      submitterRole: role,
      description: dto.description,
      courseId: dto.courseId,
      level: dto.level,
      lecturerId: role === Role.LECTURER ? lecturerId : undefined,
      studentId: role === Role.STUDENT ? studentId : undefined,
    });

    // Notify admins — using a placeholder notification
    await this.notificationsService.createForAdmin('COMPLAINT_SUBMITTED', `New complaint submitted by ${role.toLowerCase()}: ${dto.description.slice(0, 80)}`);

    return complaint;
  }

  async resolve(id: string, adminId: string) {
    const complaint = await this.findOne(id);
    const updated = await this.complaintsRepository.resolve(id, adminId);

    // Notify the submitter
    const msg = `Your complaint (ID: ${id}) has been resolved.`;
    if (complaint.lecturer) {
      await this.notificationsService.createForLecturer(complaint.lecturer.id, 'COMPLAINT_RESOLVED', msg);
    } else if (complaint.student) {
      await this.notificationsService.createForStudent(complaint.student.id, 'COMPLAINT_RESOLVED', msg);
    }

    return updated;
  }
}
