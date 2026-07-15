import React, { useState, useEffect, useContext } from 'react';
import { CheckCircle, ClipboardList, Search, Pencil, BookOpen } from 'lucide-react';
import { api } from '../../lib/api';
import type { Course, SystemSettings } from '../../lib/types';
import { AppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const FORM_B_KEY = (userId: string) => `timely_formb_${userId}`;

interface FormBData {
  selectedCourseIds: string[];
  submittedAt: string;
}

const LEVEL_COLORS: Record<string, string> = {
  L100: 'bg-blue-100 text-blue-700',
  L200: 'bg-emerald-100 text-emerald-700',
  L300: 'bg-purple-100 text-purple-700',
  L400: 'bg-orange-100 text-orange-700',
  L500: 'bg-rose-100 text-rose-700',
};

const StudentFormBPage: React.FC = () => {
  const { user } = useContext(AppContext);

  const [courses,   setCourses]   = useState<Course[]>([]);
  const [selected,  setSelected]  = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [editing,   setEditing]   = useState(false);
  const [semester,  setSemester]  = useState('FIRST');
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!user?.student) return;
    const load = async () => {
      try {
        const [c, s] = await Promise.all([
          api.get<Course[]>(
            `/courses?department=${user.student!.departmentId}&level=${user.student!.level}`
          ),
          api.get<SystemSettings>('/settings').catch(() => null),
        ]);
        setCourses(c);
        if (s?.currentSemester) setSemester(s.currentSemester);

        const raw = localStorage.getItem(FORM_B_KEY(user.id));
        if (raw) {
          const data: FormBData = JSON.parse(raw);
          setSelected(new Set(data.selectedCourseIds));
          if (data.submittedAt) setSubmitted(true);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    if (selected.size === 0) {
      toast.error('Please select at least one course');
      return;
    }
    const data: FormBData = {
      selectedCourseIds: [...selected],
      submittedAt: new Date().toISOString(),
    };
    localStorage.setItem(FORM_B_KEY(user!.id), JSON.stringify(data));
    setSubmitted(true);
    setEditing(false);
    toast.success(
      `Form B submitted! Your timetable will now show ${selected.size} course${selected.size !== 1 ? 's' : ''}.`
    );
  };

  const filtered = courses.filter(
    c =>
      !search ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectAll = () => setSelected(new Set(filtered.map(c => c.id)));
  const clearAll  = () => setSelected(new Set());

  const selectedCourses = courses.filter(c => selected.has(c.id));

  // Submitted + not editing: show the selected courses list
  if (submitted && !editing) {
    return (
      <div className="min-h-screen bg-[var(--gray-light)] px-3 sm:px-6 py-5 sm:py-8 font-sans">

        <div className="mb-6">
          <p className="text-xs text-[var(--gray-500)] uppercase tracking-widest font-medium mb-0.5">Student</p>
          <h1 className="text-xl sm:text-3xl font-bold text-[var(--gray-dark)] leading-tight">My Courses</h1>
          <p className="text-xs text-[var(--gray-400)] mt-1">
            {user?.student?.level} · {semester} Semester · {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''} enrolled
          </p>
        </div>

        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 mb-6">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-800">Form B submitted</p>
            <p className="text-xs text-emerald-600">
              {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''} selected. Your timetable is personalised to these courses.
            </p>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-700 text-xs font-semibold hover:bg-emerald-200 transition-colors shrink-0"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit Selection
          </button>
        </div>

        {selectedCourses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[var(--gray-150)] p-12 text-center">
            <BookOpen className="w-10 h-10 text-[var(--gray-300)] mx-auto mb-2" />
            <p className="text-sm text-[var(--gray-500)]">No courses selected.</p>
            <button onClick={() => setEditing(true)} className="mt-3 text-sm text-[var(--primary-400)] hover:underline">
              Go back and select courses
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {selectedCourses.map(course => (
              <div key={course.id} className="bg-white rounded-2xl border border-[var(--gray-150)] px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary-200)]/10 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-[var(--primary-400)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-xs font-bold text-[var(--primary-400)]">{course.code}</p>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${LEVEL_COLORS[course.level] ?? 'bg-gray-100 text-gray-700'}`}>
                      {course.level}
                    </span>
                    {course.isShared && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">Shared</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-[var(--gray-dark)] truncate">{course.name}</p>
                </div>
                <span className="text-[10px] text-[var(--gray-400)] shrink-0">{course.credits} cr</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Selection mode (initial or editing)
  return (
    <div className="min-h-screen bg-[var(--gray-light)] px-3 sm:px-6 py-5 sm:py-8 font-sans">

      <div className="mb-6">
        <p className="text-xs text-[var(--gray-500)] uppercase tracking-widest font-medium mb-0.5">Student</p>
        <h1 className="text-xl sm:text-3xl font-bold text-[var(--gray-dark)] leading-tight">
          {editing ? 'Edit Course Selection' : 'Form B: Course Selection'}
        </h1>
        <p className="text-xs text-[var(--gray-400)] mt-1">
          {user?.student?.level} · {semester} Semester · Tick every course you are enrolled in this semester
        </p>
      </div>

      {editing && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 mb-5">
          <Pencil className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-800">
            You are editing your course selection. Click <strong>Submit Form B</strong> when done.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--gray-400)]" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[var(--gray-200)] bg-white text-[var(--gray-dark)] placeholder:text-[var(--gray-400)] focus:outline-none focus:border-[var(--primary-400)]"
          />
        </div>
        <div className="flex items-center gap-2 text-xs shrink-0">
          <button onClick={selectAll} className="px-3 py-1.5 rounded-lg bg-[var(--gray-100)] text-[var(--gray-600)] hover:bg-[var(--gray-200)] transition-colors">
            Select All
          </button>
          <button onClick={clearAll} className="px-3 py-1.5 rounded-lg bg-[var(--gray-100)] text-[var(--gray-600)] hover:bg-[var(--gray-200)] transition-colors">
            Clear
          </button>
          <span className="text-[var(--gray-400)]">{selected.size} selected</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[var(--gray-150)] p-5 h-16 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--gray-150)] p-12 text-center">
          <ClipboardList className="w-10 h-10 text-[var(--gray-300)] mx-auto mb-2" />
          <p className="text-sm text-[var(--gray-500)]">
            {search ? 'No courses match your search.' : 'No courses found for your department and level.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 pb-24">
          {filtered.map(course => {
            const isSelected = selected.has(course.id);
            return (
              <button
                key={course.id}
                onClick={() => toggle(course.id)}
                className={`w-full flex items-center gap-4 rounded-2xl border px-5 py-3.5 text-left transition-all duration-150 ${
                  isSelected
                    ? 'bg-[var(--primary-200)]/10 border-[var(--primary-400)]/30'
                    : 'bg-white border-[var(--gray-150)] hover:border-[var(--gray-300)]'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                  isSelected ? 'bg-[var(--primary-400)] border-[var(--primary-400)]' : 'border-[var(--gray-300)] bg-white'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-bold text-[var(--primary-400)]">{course.code}</p>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${LEVEL_COLORS[course.level] ?? 'bg-gray-100 text-gray-700'}`}>
                      {course.level}
                    </span>
                    {course.isShared && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">Shared</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-[var(--gray-dark)] truncate mt-0.5">{course.name}</p>
                </div>

                <span className="text-[10px] text-[var(--gray-400)] shrink-0">{course.credits} cr</span>
              </button>
            );
          })}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-3 px-6 pointer-events-none">
          {editing && (
            <button
              onClick={() => { setEditing(false); }}
              className="pointer-events-auto flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-[var(--gray-200)] text-[var(--gray-700)] text-sm font-semibold shadow-lg hover:bg-[var(--gray-50)] transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={selected.size === 0}
            className="pointer-events-auto flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary-400)] text-white text-sm font-semibold shadow-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4" />
            Submit Form B ({selected.size} course{selected.size !== 1 ? 's' : ''})
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentFormBPage;
