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
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { LecturersService } from './lecturers.service';
import { CreateLecturerDto } from './dto/create-lecturer.dto';
import { UpdateLecturerDto } from './dto/update-lecturer.dto';

@ApiTags('Lecturers')
@ApiBearerAuth()
@Controller('lecturers')
export class LecturersController {
  constructor(private readonly lecturersService: LecturersService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all lecturers' })
  findAll() {
    return this.lecturersService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.LECTURER)
  @ApiOperation({ summary: 'Get lecturer by ID' })
  findOne(@Param('id') id: string) {
    return this.lecturersService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create lecturer account' })
  create(@Body() dto: CreateLecturerDto) {
    return this.lecturersService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update lecturer account' })
  update(@Param('id') id: string, @Body() dto: UpdateLecturerDto) {
    return this.lecturersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete lecturer account' })
  remove(@Param('id') id: string) {
    return this.lecturersService.remove(id);
  }

  @Get(':id/courses')
  @Roles(Role.ADMIN, Role.LECTURER)
  @ApiOperation({ summary: 'Get all courses assigned to a lecturer' })
  getCourses(@Param('id') id: string) {
    return this.lecturersService.getCourses(id);
  }

  @Get(':id/availability')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get booked slots for a lecturer' })
  getAvailability(@Param('id') id: string) {
    return this.lecturersService.getAvailability(id);
  }
}
