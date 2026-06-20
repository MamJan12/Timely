import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { SchoolsRepository } from './schools.repository';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class SchoolsService {
  constructor(private readonly schoolsRepository: SchoolsRepository) {}

  findAll() {
    return this.schoolsRepository.findAll();
  }

  async findOne(id: string) {
    const school = await this.schoolsRepository.findById(id);
    if (!school) throw new NotFoundException(`School ${id} not found`);
    return school;
  }

  async create(dto: CreateSchoolDto) {
    try {
      return await this.schoolsRepository.create(dto.name, dto.abbreviation);
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('School name or abbreviation already exists');
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateSchoolDto) {
    await this.findOne(id);
    try {
      return await this.schoolsRepository.update(id, dto);
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('School name or abbreviation already exists');
      }
      throw err;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.schoolsRepository.delete(id);
    return { message: 'School deleted successfully' };
  }
}
