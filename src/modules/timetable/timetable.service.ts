import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Day, Level, Semester, TimetableStatus } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ConflictDetectionService } from './conflict-detection.service';
import { GenerationService } from './generation.service';
import { TimetableRepository } from './timetable.repository';
import { CreateSlotDto } from './dto/create-slot.dto';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { UpdateTimetableStatusDto } from './dto/update-timetable-status.dto';

@Injectable()
export class TimetableService {
  constructor(
    private readonly timetableRepository: TimetableRepository,
    private readonly conflictDetectionService: ConflictDetectionService,
    private readonly generationService: GenerationService,
  ) {}

  findAll(filters: { departmentId?: string; level?: Level; semester?: Semester; status?: TimetableStatus }) {
    return this.timetableRepository.findAll(filters);
  }

  async findOne(id: string) {
    const timetable = await this.timetableRepository.findById(id);
    if (!timetable) throw new NotFoundException(`Timetable ${id} not found`);
    return timetable;
  }

  async create(dto: CreateTimetableDto) {
    try {
      return await this.timetableRepository.create(dto);
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('A timetable for this department, level, semester and academic year already exists');
      }
      throw err;
    }
  }

  async updateStatus(id: string, dto: UpdateTimetableStatusDto) {
    await this.findOne(id);
    return this.timetableRepository.updateStatus(id, dto.status);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.timetableRepository.delete(id);
    return { message: 'Timetable deleted successfully' };
  }

  // Slots
  async getSlots(timetableId: string) {
    await this.findOne(timetableId);
    return this.timetableRepository.findSlotsByTimetable(timetableId);
  }

  async addSlot(timetableId: string, dto: CreateSlotDto) {
    const timetable = await this.findOne(timetableId);

    const conflicts = await this.conflictDetectionService.checkConflicts(
      timetableId,
      dto.day,
      dto.startTime,
      dto.endTime,
      dto.lecturerId,
      timetable.department.id,
      timetable.level,
      dto.venue,
    );

    if (conflicts.length > 0) {
      throw new BadRequestException({ message: 'Slot conflicts detected', conflicts });
    }

    return this.timetableRepository.createSlot(timetableId, dto);
  }

  async updateSlot(timetableId: string, slotId: string, dto: UpdateSlotDto) {
    const timetable = await this.findOne(timetableId);
    const slot = await this.timetableRepository.findSlotById(slotId);
    if (!slot || slot.timetable.id !== timetableId) {
      throw new NotFoundException('Slot not found in this timetable');
    }

    const day = dto.day ?? slot.day;
    const startTime = dto.startTime ?? slot.startTime;
    const endTime = dto.endTime ?? slot.endTime;
    const lecturerId = dto.lecturerId ?? slot.lecturer.id;
    const venue = dto.venue ?? slot.venue ?? undefined;

    const conflicts = await this.conflictDetectionService.checkConflicts(
      timetableId,
      day,
      startTime,
      endTime,
      lecturerId,
      timetable.department.id,
      timetable.level,
      venue,
      slotId,
    );

    if (conflicts.length > 0) {
      throw new BadRequestException({ message: 'Slot conflicts detected', conflicts });
    }

    return this.timetableRepository.updateSlot(slotId, dto);
  }

  async removeSlot(timetableId: string, slotId: string) {
    await this.findOne(timetableId);
    const slot = await this.timetableRepository.findSlotById(slotId);
    if (!slot || slot.timetable.id !== timetableId) {
      throw new NotFoundException('Slot not found in this timetable');
    }
    await this.timetableRepository.deleteSlot(slotId);
    return { message: 'Slot deleted successfully' };
  }

  // Timetable views
  async getStudentTimetable(userId: string, semester: Semester) {
    const student = await this.timetableRepository.findStudentByUserId(userId);
    if (!student) throw new NotFoundException('Student record not found');
    const timetable = await this.timetableRepository.findStudentTimetable(
      student.departmentId, student.level, semester,
    );
    if (!timetable) throw new NotFoundException('No published timetable found for your department and level');
    return timetable;
  }

  getLecturerTimetable(userId: string) {
    return this.timetableRepository.findLecturerTimetable(userId);
  }

  // Auto-generation
  async generate(timetableId: string) {
    const timetable = await this.findOne(timetableId);
    if (timetable.status === TimetableStatus.PUBLISHED) {
      throw new ForbiddenException('Cannot regenerate a published timetable');
    }
    return this.generationService.generate(timetableId, timetable.department.id, timetable.level, timetable.semester);
  }
}
