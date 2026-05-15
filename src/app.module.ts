import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CourseModule } from './course/course.module';
import { LecturersModule } from './lecturers/lecturers.module';
import { StudentsModule } from './students/students.module';
import { ExamsModule } from './exams/exams.module';

@Module({
  imports: [AuthModule, CourseModule, LecturersModule, StudentsModule, ExamsModule],
})
export class AppModule {}
