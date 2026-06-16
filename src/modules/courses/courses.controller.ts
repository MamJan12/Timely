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
import { Roles } from '../../common/decorators/roles.decorator';
import { CoursesService } from './courses.service';
import { AssignLecturerDto } from './dto/assign-lecturer.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@ApiTags('Courses')
@ApiBearerAuth()
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'level', required: false, enum: Level })
  findAll(
    @Query('department') departmentId?: string,
    @Query('level') level?: Level,
  ) {
    return this.coursesService.findAll(departmentId, level);
  }

  @Get('lecturer/:lecturerId')
  @Roles(Role.ADMIN, Role.LECTURER)
  @ApiOperation({ summary: 'Get all courses taught by a specific lecturer' })
  findByLecturer(@Param('lecturerId') lecturerId: string) {
    return this.coursesService.findByLecturer(lecturerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create course' })
  create(@Body() dto: CreateCourseDto) {
    return this.coursesService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update course' })
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete course' })
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }

  @Post(':id/lecturers')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Assign a lecturer to a course' })
  assignLecturer(@Param('id') courseId: string, @Body() dto: AssignLecturerDto) {
    return this.coursesService.assignLecturer(courseId, dto.lecturerId);
  }

  @Delete(':id/lecturers/:lecturerId')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a lecturer from a course' })
  removeLecturer(@Param('id') courseId: string, @Param('lecturerId') lecturerId: string) {
    return this.coursesService.removeLecturer(courseId, lecturerId);
  }
}
