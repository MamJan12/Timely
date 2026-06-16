import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as bcrypt from 'bcrypt';
import { AdminRepository } from './admin.repository';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  findAll() {
    return this.adminRepository.findAll();
  }

  async findOne(id: string) {
    const admin = await this.adminRepository.findById(id);
    if (!admin) throw new NotFoundException(`Admin ${id} not found`);
    return admin;
  }

  async create(dto: CreateAdminDto) {
    const hashed = await bcrypt.hash(dto.password, 10);
    try {
      return await this.adminRepository.create(dto.email, hashed, dto.firstName, dto.lastName);
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Email already in use');
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateAdminDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);
    return this.adminRepository.update(id, data);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.adminRepository.delete(id);
    return { message: 'Admin deleted successfully' };
  }
}
