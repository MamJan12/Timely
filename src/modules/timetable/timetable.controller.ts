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
import { Level, Role, Semester, TimetableStatus } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { TimetableService } from './timetable.service';
import { CreateSlotDto } from './dto/create-slot.dto';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { UpdateTimetableStatusDto } from './dto/update-timetable-status.dto';

@ApiTags('Timetable')
@ApiBearerAuth()
@Controller('timetables')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  // --- Timetable Files ---

  @Get()
  @ApiOperation({ summary: 'Get all timetables with optional filters' })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'level', required: false, enum: Level })
  @ApiQuery({ name: 'semester', required: false, enum: Semester })
  @ApiQuery({ name: 'status', required: false, enum: TimetableStatus })
  findAll(
    @Query('department') departmentId?: string,
    @Query('level') level?: Level,
    @Query('semester') semester?: Semester,
    @Query('status') status?: TimetableStatus,
  ) {
    return this.timetableService.findAll({ departmentId, level, semester, status });
  }

  @Get('my/student')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get timetable for the current student' })
  @ApiQuery({ name: 'semester', required: true, enum: Semester })
  @ApiQuery({ name: 'academicYear', required: true })
  getStudentTimetable(
    @CurrentUser() user: any,
    @Query('semester') semester: Semester,
    @Query('academicYear') academicYear: string,
  ) {
    return this.timetableService.getStudentTimetable(
      user.student?.departmentId,
      user.student?.level,
      semester,
      academicYear,
    );
  }

  @Get('my/lecturer')
  @Roles(Role.LECTURER)
  @ApiOperation({ summary: 'Get all slots assigned to the current lecturer' })
  getLecturerTimetable(@CurrentUser() user: any) {
    return this.timetableService.getLecturerTimetable(user.lecturer?.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single timetable by ID' })
  findOne(@Param('id') id: string) {
    return this.timetableService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new timetable' })
  create(@Body() dto: CreateTimetableDto) {
    return this.timetableService.create(dto);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update timetable status (Draft → Published)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateTimetableStatusDto) {
    return this.timetableService.updateStatus(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete timetable' })
  remove(@Param('id') id: string) {
    return this.timetableService.remove(id);
  }

  // --- Slots ---

  @Get(':id/slots')
  @ApiOperation({ summary: 'Get all slots for a timetable' })
  getSlots(@Param('id') id: string) {
    return this.timetableService.getSlots(id);
  }

  @Post(':id/slots')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Add a course slot to a timetable (runs conflict detection)' })
  addSlot(@Param('id') timetableId: string, @Body() dto: CreateSlotDto) {
    return this.timetableService.addSlot(timetableId, dto);
  }

  @Patch(':id/slots/:slotId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a timetable slot (runs conflict detection)' })
  updateSlot(
    @Param('id') timetableId: string,
    @Param('slotId') slotId: string,
    @Body() dto: UpdateSlotDto,
  ) {
    return this.timetableService.updateSlot(timetableId, slotId, dto);
  }

  @Delete(':id/slots/:slotId')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a timetable slot' })
  removeSlot(@Param('id') timetableId: string, @Param('slotId') slotId: string) {
    return this.timetableService.removeSlot(timetableId, slotId);
  }

  // --- Auto-generation ---

  @Post(':id/generate')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Auto-generate timetable slots respecting all hard constraints' })
  generate(@Param('id') id: string) {
    return this.timetableService.generate(id);
  }
}
