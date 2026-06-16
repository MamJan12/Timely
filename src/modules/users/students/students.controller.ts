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
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Level, Role } from '@prisma/client';
import { Roles } from '../../../common/decorators/roles.decorator';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@ApiTags('Students')
@ApiBearerAuth()
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all students' })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'level', required: false, enum: Level })
  findAll(
    @Query('department') departmentId?: string,
    @Query('level') level?: Level,
  ) {
    return this.studentsService.findAll(departmentId, level);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.STUDENT)
  @ApiOperation({ summary: 'Get student by ID' })
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create student account' })
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update student account' })
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete student account' })
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
