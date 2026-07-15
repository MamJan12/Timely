import React, { useState, useEffect, useContext } from 'react';
import { BookOpen, Users, Search } from 'lucide-react';
import { api } from '../../lib/api';
import type { Course } from '../../lib/types';
import { AppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const LEVEL_COLORS: Record<string, string> = {
  L100: 'bg-blue-100 text-blue-700',
  L200: 'bg-emerald-100 text-emerald-700',
  L300: 'bg-purple-100 text-purple-700',
  L400: 'bg-orange-100 text-orange-700',
  L500: 'bg-rose-100 text-rose-700',
};

const LecturerCoursesPage: React.FC = () => {
  const { user } = useContext(AppContext);

  const [courses, setCourses] = useState<Course[]>([]);
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.lecturer) return;
    const load = async () => {
      try {
        const c = await api.get<Course[]>(`/courses/lecturer/${user.lecturer!.id}`);
        setCourses(c);

        const seen = new Set<string>();
        const combos: { departmentId: string; level: string; key: string }[] = [];
        for (const co of c) {
          const key = `${co.department.id}-${co.level}`;
          if (!seen.has(key)) {
            seen.add(key);
            combos.push({ departmentId: co.department.id, level: co.level, key });
          }
        }

        if (combos.length > 0) {
          const results = await Promise.all(
            combos.map(({ departmentId, level, key }) =>
              api
                .get<{ count: number }>(
                  `/students/count?department=${departmentId}&level=${level}`
                )
                .then(r => ({ key, count: r.count }))
                .catch(() => ({ key, count: 0 }))
            )
          );
          setStudentCounts(Object.fromEntries(results.map(r => [r.key, r.count])));
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const filtered = courses.filter(
    c =>
      !search ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.level.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, Course[]>>((acc, c) => {
    acc[c.level] = [...(acc[c.level] ?? []), c];
    return acc;
  }, {});

  const levels = Object.keys(grouped).sort();

  return (
    <div className="min-h-screen bg-[var(--gray-light)] px-3 sm:px-6 py-5 sm:py-8 font-sans">

      <div className="mb-6">
        <p className="text-xs text-[var(--gray-500)] uppercase tracking-widest font-medium mb-0.5">
          Lecturer
        </p>
        <h1 className="text-xl sm:text-3xl font-bold text-[var(--gray-dark)] leading-tight">
          My Courses
        </h1>
        <p className="text-xs text-[var(--gray-400)] mt-1">
          {courses.length} course{courses.length !== 1 ? 's' : ''} assigned
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--gray-400)]" />
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[var(--gray-200)] bg-white text-[var(--gray-dark)] placeholder:text-[var(--gray-400)] focus:outline-none focus:border-[var(--primary-400)]"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[var(--gray-150)] p-5 h-24 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--gray-150)] p-12 text-center">
          <BookOpen className="w-10 h-10 text-[var(--gray-300)] mx-auto mb-2" />
          <p className="text-sm text-[var(--gray-500)]">
            {search ? 'No courses match your search.' : 'No courses assigned yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {levels.map(level => (
            <section key={level}>
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${LEVEL_COLORS[level] ?? 'bg-gray-100 text-gray-700'}`}
                >
                  {level}
                </span>
                <p className="text-sm font-semibold text-[var(--gray-dark)]">
                  {grouped[level].length} course{grouped[level].length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {grouped[level].map(course => {
                  const countKey = `${course.department.id}-${course.level}`;
                  const count = studentCounts[countKey] ?? 0;
                  return (
                    <div
                      key={course.id}
                      className="bg-white rounded-2xl border border-[var(--gray-150)] p-5 flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[var(--primary-400)] truncate">
                            {course.code}
                          </p>
                          <p className="text-sm font-semibold text-[var(--gray-dark)] leading-snug mt-0.5">
                            {course.name}
                          </p>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-[var(--primary-200)]/10 flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4 text-[var(--primary-400)]" />
                        </div>
                      </div>

                      <div className="border-t border-[var(--gray-100)] pt-3 flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-[var(--gray-400)] uppercase tracking-wide">
                            Department
                          </p>
                          <p className="text-xs font-medium text-[var(--gray-700)] truncate">
                            {course.department.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <Users className="w-3.5 h-3.5 text-[var(--gray-400)]" />
                          <span className="text-sm font-bold text-[var(--gray-dark)]">{count}</span>
                          <span className="text-[10px] text-[var(--gray-400)]">students</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-[var(--gray-500)]">
                          {course.credits} credits
                        </span>
                        {course.isShared && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                            Shared
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default LecturerCoursesPage;
