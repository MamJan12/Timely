import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, CalendarDays, Building2, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';
import type { Course, TimetableSlot } from '../../lib/types';
import { AppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}) => (
  <div className="bg-white rounded-2xl border border-[var(--gray-150)] p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-2xl font-bold text-[var(--gray-dark)]">{value}</p>
      <p className="text-xs text-[var(--gray-500)]">{label}</p>
    </div>
  </div>
);

const LecturerDashboardPage: React.FC = () => {
  const { user } = useContext(AppContext);
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const displayName = user?.lecturer
    ? `${user.lecturer.firstName} ${user.lecturer.lastName}`
    : user?.email ?? 'Lecturer';

  useEffect(() => {
    if (!user?.lecturer) return;
    const load = async () => {
      try {
        const [c, s] = await Promise.all([
          api.get<Course[]>(`/courses/lecturer/${user.lecturer!.id}`),
          api.get<TimetableSlot[]>('/timetables/my/lecturer').catch(() => [] as TimetableSlot[]),
        ]);
        setCourses(c);
        setSlots(s);

        // Count students per unique dept+level combination
        const seen = new Set<string>();
        const combos: { departmentId: string; level: string }[] = [];
        for (const co of c) {
          const key = `${co.department.id}-${co.level}`;
          if (!seen.has(key)) {
            seen.add(key);
            combos.push({ departmentId: co.department.id, level: co.level });
          }
        }

        if (combos.length > 0) {
          const counts = await Promise.all(
            combos.map(({ departmentId, level }) =>
              api
                .get<{ count: number }>(
                  `/students/count?department=${departmentId}&level=${level}`
                )
                .catch(() => ({ count: 0 }))
            )
          );
          setTotalStudents(counts.reduce((sum, r) => sum + r.count, 0));
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const deptCount = new Set(courses.map(c => c.department.id)).size;

  return (
    <div className="min-h-screen bg-[var(--gray-light)] px-3 sm:px-6 py-5 sm:py-8 font-sans">

      {/* Header */}
      <div className="flex items-start justify-between mb-6 sm:mb-8 gap-2">
        <div>
          <p className="text-xs text-[var(--gray-500)] uppercase tracking-widest font-medium mb-0.5">
            Lecturer
          </p>
          <h1 className="text-xl sm:text-3xl font-bold text-[var(--gray-dark)] leading-tight">
            Welcome, <span className="text-[var(--primary-400)]">{displayName}</span>
          </h1>
        </div>
        <button
          onClick={() => navigate('/lecturer/timetable')}
          className="mt-1 shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary-200)] text-[var(--gray-dark)] text-sm font-semibold hover:opacity-80 transition-opacity"
        >
          <CalendarDays className="w-4 h-4" />
          <span className="hidden sm:inline">My Timetable</span>
        </button>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[var(--gray-150)] p-5 h-20 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Courses Assigned"
            value={courses.length}
            icon={BookOpen}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            label="Total Students"
            value={totalStudents}
            icon={Users}
            color="bg-emerald-100 text-emerald-600"
          />
          <StatCard
            label="Weekly Slots"
            value={slots.length}
            icon={CalendarDays}
            color="bg-purple-100 text-purple-600"
          />
          <StatCard
            label="Departments"
            value={deptCount}
            icon={Building2}
            color="bg-orange-100 text-orange-600"
          />
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {[
          { label: 'My Timetable', path: '/lecturer/timetable', color: 'bg-[var(--primary-200)]' },
          { label: 'My Courses',   path: '/lecturer/courses',   color: 'bg-blue-100' },
        ].map(({ label, path, color }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`${color} rounded-2xl p-4 text-sm font-semibold text-[var(--gray-dark)] hover:opacity-80 transition-opacity text-left`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Course list */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-semibold text-[var(--gray-dark)] tracking-tight">
            My Courses
          </h2>
          <button
            onClick={() => navigate('/lecturer/courses')}
            className="text-xs text-[var(--primary-400)] hover:underline flex items-center gap-1"
          >
            View all <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 h-16 animate-pulse border border-[var(--gray-150)]"
              />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[var(--gray-150)] p-8 text-center">
            <BookOpen className="w-10 h-10 text-[var(--gray-300)] mx-auto mb-2" />
            <p className="text-sm text-[var(--gray-500)]">No courses assigned yet.</p>
            <p className="text-[var(--gray-400)] text-xs mt-1">
              Contact your admin to get course assignments.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {courses.slice(0, 6).map(course => (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-[var(--gray-150)] px-5 py-3 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--primary-200)]/15 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-[var(--primary-400)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--gray-dark)] truncate">
                    {course.code} — {course.name}
                  </p>
                  <p className="text-xs text-[var(--gray-500)] truncate">{course.department.name}</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--primary-200)]/15 text-[var(--primary-400)] shrink-0">
                  {course.level}
                </span>
              </div>
            ))}
            {courses.length > 6 && (
              <button
                onClick={() => navigate('/lecturer/courses')}
                className="text-xs text-[var(--primary-400)] text-center py-2 hover:underline"
              >
                +{courses.length - 6} more courses
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default LecturerDashboardPage;
