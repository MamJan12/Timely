import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { DepartmentsRepository } from './departments.repository';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly departmentsRepository: DepartmentsRepository) {}

  findAll() {
    return this.departmentsRepository.findAll();
  }

  async findOne(id: string) {
    const dept = await this.departmentsRepository.findById(id);
    if (!dept) throw new NotFoundException(`Department ${id} not found`);
    return dept;
  }

  async create(dto: CreateDepartmentDto) {
    try {
      return await this.departmentsRepository.create(dto.name, dto.code);
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Department name or code already exists');
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    await this.findOne(id);
    try {
      return await this.departmentsRepository.update(id, dto);
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Department name or code already exists');
      }
      throw err;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.departmentsRepository.delete(id);
    return { message: 'Department deleted successfully' };
  }
}
