import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as bcrypt from 'bcrypt';
import { LecturersRepository } from './lecturers.repository';
import { CreateLecturerDto } from './dto/create-lecturer.dto';
import { UpdateLecturerDto } from './dto/update-lecturer.dto';

@Injectable()
export class LecturersService {
  constructor(private readonly lecturersRepository: LecturersRepository) {}

  findAll() {
    return this.lecturersRepository.findAll();
  }

  async findOne(id: string) {
    const lecturer = await this.lecturersRepository.findById(id);
    if (!lecturer) throw new NotFoundException(`Lecturer ${id} not found`);
    return lecturer;
  }

  async create(dto: CreateLecturerDto) {
    const hashed = await bcrypt.hash(dto.password, 10);
    try {
      return await this.lecturersRepository.create(
        dto.email,
        hashed,
        dto.firstName,
        dto.lastName,
        dto.staffId,
        dto.departmentId,
      );
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Email or staff ID already in use');
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateLecturerDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);
    return this.lecturersRepository.update(id, data);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.lecturersRepository.delete(id);
    return { message: 'Lecturer deleted successfully' };
  }

  getCourses(id: string) {
    return this.lecturersRepository.findCourses(id);
  }

  getAvailability(id: string) {
    return this.lecturersRepository.findAvailability(id);
  }
}
