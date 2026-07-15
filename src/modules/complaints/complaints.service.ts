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

  async getMyComplaints(userId: string, role: Role) {
    if (role === Role.LECTURER) {
      const lecturer = await this.complaintsRepository.findLecturerByUserId(userId);
      if (!lecturer) return [];
      return this.complaintsRepository.findBySubmitter(lecturer.id, undefined);
    }
    const student = await this.complaintsRepository.findStudentByUserId(userId);
    if (!student) return [];
    return this.complaintsRepository.findBySubmitter(undefined, student.id);
  }

  async submit(dto: CreateComplaintDto, userId: string, role: Role) {
    let lecturerId: string | undefined;
    let studentId: string | undefined;

    if (role === Role.LECTURER) {
      const lecturer = await this.complaintsRepository.findLecturerByUserId(userId);
      lecturerId = lecturer?.id;
    } else if (role === Role.STUDENT) {
      const student = await this.complaintsRepository.findStudentByUserId(userId);
      studentId = student?.id;
    }

    const complaint = await this.complaintsRepository.create({
      submitterRole: role,
      description:        dto.description,
      courseId:           dto.courseId,
      level:              dto.level,
      lecturerId,
      studentId,
      requestedDay:       dto.requestedDay,
      requestedStartTime: dto.requestedStartTime,
      requestedEndTime:   dto.requestedEndTime,
    });

    await this.notificationsService.createForAdmin(
      'COMPLAINT_SUBMITTED',
      `New ${role.toLowerCase()} complaint: ${dto.description.slice(0, 80)}`,
    );

    return complaint;
  }

  async respond(id: string, adminId: string, adminResponse: string) {
    const complaint = await this.findOne(id);
    const updated = await this.complaintsRepository.respond(id, adminId, adminResponse);

    const msg = `Response from admin: "${adminResponse}"`;
    if (complaint.lecturer) {
      await this.notificationsService.createForLecturer(complaint.lecturer.id, 'COMPLAINT_RESOLVED', msg);
    } else if (complaint.student) {
      await this.notificationsService.createForStudent(complaint.student.id, 'COMPLAINT_RESOLVED', msg);
    }

    return updated;
  }

  async resolve(id: string, adminId: string) {
    await this.findOne(id);
    return this.complaintsRepository.resolve(id, adminId);
  }
}
