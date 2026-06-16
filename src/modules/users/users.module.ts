import { Module } from '@nestjs/common';
import { AdminController } from './admin/admin.controller';
import { AdminRepository } from './admin/admin.repository';
import { AdminService } from './admin/admin.service';
import { LecturersController } from './lecturers/lecturers.controller';
import { LecturersRepository } from './lecturers/lecturers.repository';
import { LecturersService } from './lecturers/lecturers.service';
import { StudentsController } from './students/students.controller';
import { StudentsRepository } from './students/students.repository';
import { StudentsService } from './students/students.service';

@Module({
  controllers: [AdminController, LecturersController, StudentsController],
  providers: [
    AdminService,
    AdminRepository,
    LecturersService,
    LecturersRepository,
    StudentsService,
    StudentsRepository,
  ],
  exports: [LecturersService, StudentsService],
})
export class UsersModule {}
