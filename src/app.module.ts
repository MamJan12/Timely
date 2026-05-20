import { Module } from '@nestjs/common';
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
  ],
})
export class AppModule {}
