import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Level } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as bcrypt from 'bcrypt';
import { StudentsRepository } from './students.repository';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly studentsRepository: StudentsRepository) {}

  findAll(departmentId?: string, level?: Level) {
    return this.studentsRepository.findAll(departmentId, level);
  }

  async findOne(id: string) {
    const student = await this.studentsRepository.findById(id);
    if (!student) throw new NotFoundException(`Student ${id} not found`);
    return student;
  }

  async create(dto: CreateStudentDto) {
    const hashed = await bcrypt.hash(dto.password, 10);
    try {
      return await this.studentsRepository.create(
        dto.email,
        hashed,
        dto.firstName,
        dto.lastName,
        dto.studentId,
        dto.departmentId,
        dto.level,
      );
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Email or student ID already in use');
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateStudentDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);
    return this.studentsRepository.update(id, data);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.studentsRepository.delete(id);
    return { message: 'Student deleted successfully' };
  }
}
