import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, ClipboardList, CheckCircle, MessageSquareWarning, ChevronRight } from 'lucide-react';
import { AppContext } from '../../context/AppContext';

const FORM_B_KEY = (userId: string) => `timely_formb_${userId}`;

interface FormBData {
  selectedCourseIds: string[];
  submittedAt: string;
}

const StudentDashboardPage: React.FC = () => {
  const { user } = useContext(AppContext);
  const navigate = useNavigate();
  const [formB, setFormB] = useState<FormBData | null>(null);

  const displayName = user?.student
    ? `${user.student.firstName} ${user.student.lastName}`
    : user?.email ?? 'Student';

  useEffect(() => {
    if (!user?.id) return;
    try {
      const raw = localStorage.getItem(FORM_B_KEY(user.id));
      if (raw) setFormB(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [user]);

  const formBSubmitted = !!formB?.submittedAt;
  const selectedCount = formB?.selectedCourseIds.length ?? 0;

  return (
    <div className="min-h-screen bg-[var(--gray-light)] px-3 sm:px-6 py-5 sm:py-8 font-sans">

      {/* Header */}
      <div className="flex items-start justify-between mb-6 sm:mb-8 gap-2">
        <div>
          <p className="text-xs text-[var(--gray-500)] uppercase tracking-widest font-medium mb-0.5">
            Student
          </p>
          <h1 className="text-xl sm:text-3xl font-bold text-[var(--gray-dark)] leading-tight">
            Welcome, <span className="text-[var(--primary-400)]">{displayName}</span>
          </h1>
        </div>
        <button
          onClick={() => navigate('/student/timetable')}
          className="mt-1 shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary-200)] text-[var(--gray-dark)] text-sm font-semibold hover:opacity-80 transition-opacity"
        >
          <CalendarDays className="w-4 h-4" />
          <span className="hidden sm:inline">My Timetable</span>
        </button>
      </div>

      {/* Student info card */}
      {user?.student && (
        <div className="bg-white rounded-2xl border border-[var(--gray-150)] p-5 mb-6 flex flex-wrap gap-6">
          {[
            { label: 'Student ID', value: user.student.studentId },
            { label: 'Level',      value: user.student.level },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] text-[var(--gray-400)] uppercase tracking-wide mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-[var(--gray-dark)]">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Form B status banner */}
      <div
        className={`rounded-2xl border p-5 mb-6 flex items-center gap-4 cursor-pointer hover:opacity-90 transition-opacity ${
          formBSubmitted
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-amber-50 border-amber-200'
        }`}
        onClick={() => navigate('/student/courses')}
      >
        {formBSubmitted ? (
          <CheckCircle className="w-8 h-8 text-emerald-500 shrink-0" />
        ) : (
          <ClipboardList className="w-8 h-8 text-amber-500 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-semibold ${
              formBSubmitted ? 'text-emerald-800' : 'text-amber-800'
            }`}
          >
            {formBSubmitted
              ? `Form B submitted: ${selectedCount} course${selectedCount !== 1 ? 's' : ''} selected`
              : 'Form B not yet submitted'}
          </p>
          <p
            className={`text-xs mt-0.5 ${
              formBSubmitted ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {formBSubmitted
              ? 'Your timetable is filtered to your selected courses. Tap to view or edit.'
              : 'Select your courses for this semester to see your personalised timetable.'}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-[var(--gray-400)] shrink-0" />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'My Timetable', path: '/student/timetable',  color: 'bg-[var(--primary-200)]', icon: CalendarDays         },
          { label: 'Form B',       path: '/student/courses',     color: 'bg-amber-100',            icon: ClipboardList        },
          { label: 'Complaints',   path: '/student/complaints',  color: 'bg-blue-100',             icon: MessageSquareWarning },
        ].map(({ label, path, color, icon: Icon }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`${color} rounded-2xl p-4 text-left hover:opacity-80 transition-opacity`}
          >
            <Icon className="w-5 h-5 text-[var(--gray-600)] mb-2" />
            <p className="text-sm font-semibold text-[var(--gray-dark)]">{label}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboardPage;
