import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'Get all admins' })
  findAll() {
    return this.adminService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get admin by ID' })
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create admin account' })
  create(@Body() dto: CreateAdminDto) {
    return this.adminService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update admin account' })
  update(@Param('id') id: string, @Body() dto: UpdateAdminDto) {
    return this.adminService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete admin account' })
  remove(@Param('id') id: string) {
    return this.adminService.remove(id);
  }
}
