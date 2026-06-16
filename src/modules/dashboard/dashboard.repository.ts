import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [
      totalLecturers,
      totalStudents,
      timetablesByStatus,
      pendingComplaints,
      recentComplaints,
      recentTimetables,
    ] = await Promise.all([
      this.prisma.lecturer.count(),
      this.prisma.student.count(),
      this.prisma.timetable.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.complaint.count({ where: { status: 'PENDING' } }),
      this.prisma.complaint.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, submitterRole: true, description: true, status: true, createdAt: true },
      }),
      this.prisma.timetable.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        select: { id: true, status: true, updatedAt: true, level: true, semester: true, department: { select: { name: true } } },
      }),
    ]);

    return {
      totalLecturers,
      totalStudents,
      timetables: timetablesByStatus.reduce((acc, row) => {
        acc[row.status] = row._count._all;
        return acc;
      }, {} as Record<string, number>),
      pendingComplaints,
      recentActivity: {
        complaints: recentComplaints,
        timetables: recentTimetables,
      },
    };
  }
}
