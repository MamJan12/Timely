import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ComplaintStatus, Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';

@ApiTags('Complaints')
@ApiBearerAuth()
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all complaints (Admin only)' })
  @ApiQuery({ name: 'status', required: false, enum: ComplaintStatus })
  @ApiQuery({ name: 'role', required: false, enum: Role })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'date', required: false, description: 'Filter from date (ISO string)' })
  findAll(
    @Query('status') status?: ComplaintStatus,
    @Query('role') role?: Role,
    @Query('department') departmentId?: string,
    @Query('date') date?: string,
  ) {
    return this.complaintsService.findAll({ status, role, departmentId, date });
  }

  @Get('my')
  @Roles(Role.LECTURER, Role.STUDENT)
  @ApiOperation({ summary: 'Get my submitted complaints' })
  getMyComplaints(@CurrentUser() user: any) {
    return this.complaintsService.getMyComplaints(
      user.role,
      user.lecturer?.id,
      user.student?.id,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get complaint by ID' })
  findOne(@Param('id') id: string) {
    return this.complaintsService.findOne(id);
  }

  @Post()
  @Roles(Role.LECTURER, Role.STUDENT)
  @ApiOperation({ summary: 'Submit a complaint' })
  submit(@Body() dto: CreateComplaintDto, @CurrentUser() user: any) {
    return this.complaintsService.submit(dto, user.role, user.lecturer?.id, user.student?.id);
  }

  @Patch(':id/resolve')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark complaint as resolved (Admin only)' })
  resolve(@Param('id') id: string, @CurrentUser('userId') adminId: string) {
    return this.complaintsService.resolve(id, adminId);
  }
}
