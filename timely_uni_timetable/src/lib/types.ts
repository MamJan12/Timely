// ── Enums ─────────────────────────────────────────────────────────────────────

export type Role             = 'ADMIN' | 'LECTURER' | 'STUDENT';
export type Level            = 'L100' | 'L200' | 'L300' | 'L400' | 'L500';
export type Semester         = 'FIRST' | 'SECOND';
export type Day              = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';
export type TimetableStatus  = 'DRAFT' | 'PUBLISHED';
export type ComplaintStatus  = 'PENDING' | 'RESOLVED';
export type NotificationType = 'COMPLAINT_SUBMITTED' | 'COMPLAINT_RESOLVED' | 'TIMETABLE_PUBLISHED' | 'TIMETABLE_UPDATED';
export type ProgramType      = 'UNDERGRADUATE' | 'POSTGRADUATE';

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  role: Role;
}

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  admin?:    { id: string; firstName: string; lastName: string };
  lecturer?: { id: string; firstName: string; lastName: string; staffId: string; departmentId?: string };
  student?:  { id: string; firstName: string; lastName: string; studentId: string; departmentId: string; level: Level };
}

// ── School ───────────────────────────────────────────────────────────────────

export interface School {
  id: string;
  name: string;
  abbreviation: string;
  createdAt: string;
  _count?: { departments: number };
}

// ── Department ────────────────────────────────────────────────────────────────

export interface Department {
  id: string;
  name: string;
  code: string;
  schoolId: string | null;
  programType: ProgramType;
  createdAt: string;
  school?: { id: string; name: string; abbreviation: string } | null;
  _count?: { lecturers: number; students: number; courses: number };
}

// ── Course ────────────────────────────────────────────────────────────────────

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  level: Level;
  isShared: boolean;
  createdAt: string;
  department: { id: string; name: string; code: string };
  lecturers: { lecturer: { id: string; firstName: string; lastName: string; staffId: string } }[];
}

// ── Lecturer ──────────────────────────────────────────────────────────────────

export interface Lecturer {
  id: string;
  staffId: string;
  firstName: string;
  lastName: string;
  departmentId?: string;
  createdAt: string;
  user: { id: string; email: string; role: Role };
  department?: { id: string; name: string; code: string };
}

// ── Student ───────────────────────────────────────────────────────────────────

export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  level: Level;
  createdAt: string;
  user: { id: string; email: string; role: Role };
  department: { id: string; name: string; code: string };
}

// ── Timetable ─────────────────────────────────────────────────────────────────

export interface TimetableSlot {
  id: string;
  day: Day;
  startTime: string;
  endTime: string;
  venue?: string | null;
  course:   { id: string; code: string; name: string; level: Level };
  lecturer: { id: string; firstName: string; lastName: string; staffId: string };
  timetable?: { id: string; departmentId: string; level: Level; semester: Semester };
}

export interface Timetable {
  id: string;
  level: Level;
  semester: Semester;
  academicYear: string;
  status: TimetableStatus;
  createdAt: string;
  updatedAt: string;
  department: { id: string; name: string; code: string };
  slots?: TimetableSlot[];
  _count?: { slots: number };
}

// ── Complaint ─────────────────────────────────────────────────────────────────

export interface Complaint {
  id: string;
  submitterRole: Role;
  description: string;
  level?: Level;
  status: ComplaintStatus;
  resolvedById?: string;
  resolvedAt?: string;
  createdAt: string;
  course?:    { code: string; name: string };
  lecturer?:  { id: string; firstName: string; lastName: string };
  student?:   { id: string; firstName: string; lastName: string };
}

// ── Notification ──────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalLecturers: number;
  totalStudents: number;
  timetables: Record<TimetableStatus, number>;
  pendingComplaints: number;
  recentActivity: {
    complaints: Complaint[];
    timetables: Timetable[];
  };
}

// ── Settings ──────────────────────────────────────────────────────────────────

export interface SystemSettings {
  id: string;
  academicYear: string;
  currentSemester: Semester;
  semesterStartDate?: string;
  semesterEndDate?: string;
  slotDuration: number;
  slotStartTime: string;
  slotEndTime: string;
}

// ── API response wrapper ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}
