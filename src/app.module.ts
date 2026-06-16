import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ComplaintsModule } from './modules/complaints/complaints.module';
import { CoursesModule } from './modules/courses/courses.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SettingsModule } from './modules/settings/settings.module';
import { TimetableModule } from './modules/timetable/timetable.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    DepartmentsModule,
    CoursesModule,
    TimetableModule,
    ComplaintsModule,
    NotificationsModule,
    DashboardModule,
    SettingsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
=======
import { AuthModule } from './modules/auth/auth.module';
import { CourseModule } from './modules/course/course.module';
import { LecturersModule } from './modules/lecturers/lecturers.module';
import { StudentsModule } from './modules/students/students.module';
import { ExamsModule } from './modules/exams/exams.module';

@Module({
  imports: [
    AuthModule,
    CourseModule,
    LecturersModule,
    StudentsModule,
    ExamsModule,
>>>>>>> 01baa886891db1263d9ee5b1ee826fbf9abdf4b9
  ],
})
export class AppModule {}
