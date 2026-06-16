import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Level } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CoursesRepository } from './courses.repository';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly coursesRepository: CoursesRepository) {}

  findAll(departmentId?: string, level?: Level) {
    return this.coursesRepository.findAll(departmentId, level);
  }

  async findOne(id: string) {
    const course = await this.coursesRepository.findById(id);
    if (!course) throw new NotFoundException(`Course ${id} not found`);
    return course;
  }

  findByLecturer(lecturerId: string) {
    return this.coursesRepository.findByLecturer(lecturerId);
  }

  async create(dto: CreateCourseDto) {
    try {
      return await this.coursesRepository.create(dto);
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Course code already exists');
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateCourseDto) {
    await this.findOne(id);
    try {
      return await this.coursesRepository.update(id, dto);
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Course code already exists');
      }
      throw err;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.coursesRepository.delete(id);
    return { message: 'Course deleted successfully' };
  }

  async assignLecturer(courseId: string, lecturerId: string) {
    await this.findOne(courseId);
    const existing = await this.coursesRepository.findAssignment(courseId, lecturerId);
    if (existing) throw new ConflictException('Lecturer already assigned to this course');
    return this.coursesRepository.assignLecturer(courseId, lecturerId);
  }

  async removeLecturer(courseId: string, lecturerId: string) {
    await this.findOne(courseId);
    const existing = await this.coursesRepository.findAssignment(courseId, lecturerId);
    if (!existing) throw new NotFoundException('Assignment not found');
    await this.coursesRepository.removeLecturer(courseId, lecturerId);
    return { message: 'Lecturer removed from course' };
  }
}
