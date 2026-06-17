import { useState, useEffect } from 'react';
import { CalendarDays } from 'lucide-react';
import { api } from '../../lib/api';
import type { TimetableSlot, Day } from '../../lib/types';
import toast from 'react-hot-toast';

const DAYS: Day[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const DAY_LABELS: Record<Day, string> = { MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu', FRIDAY: 'Fri' };

const TIME_SLOTS = [
  { label: '7:00 – 9:00',   start: '07:00' },
  { label: '9:00 – 11:00',  start: '09:00' },
  { label: '11:00 – 13:00', start: '11:00' },
  { label: '13:00 – 15:00', start: '13:00' },
  { label: '15:00 – 17:00', start: '15:00' },
  { label: '17:00 – 19:00', start: '17:00' },
];

const LecturerTimetablePage = () => {
  const [slots,   setSlots]   = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<TimetableSlot[]>('/timetables/my/lecturer')
      .then(setSlots)
      .catch(err => toast.error(err instanceof Error ? err.message : 'Failed to load timetable'))
      .finally(() => setLoading(false));
  }, []);

  const getSlot = (day: Day, start: string) =>
    slots.find(s => s.day === day && s.startTime === start);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--primary-200)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--gray-dark)]">My Timetable</h1>
        <p className="text-xs text-[var(--gray-400)] mt-1">
          {slots.length} slot{slots.length !== 1 ? 's' : ''} across all departments
        </p>
      </div>

      <div className="h-px w-full bg-[var(--gray-200)] mb-5" />

      {slots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <CalendarDays className="w-12 h-12 text-[var(--gray-300)] mb-3" />
          <p className="text-[var(--gray-500)] text-sm">No classes scheduled yet.</p>
          <p className="text-[var(--gray-400)] text-xs mt-1">Contact your admin to assign courses.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--gray-150)] bg-white shadow-sm w-full overflow-hidden">
          <div className="flex border-b border-[var(--gray-150)]">
            <div className="shrink-0 py-3" style={{ width: 'clamp(64px, 14%, 120px)' }} />
            {DAYS.map(day => (
              <div key={day} className="flex-1 min-w-0 py-3 text-center text-[10px] sm:text-xs font-semibold text-[var(--gray-600)] uppercase tracking-widest">
                {DAY_LABELS[day]}
              </div>
            ))}
          </div>

          <div className="divide-y divide-[var(--gray-100)]">
            {TIME_SLOTS.map(({ label, start }) => (
              <div key={start} className="flex items-center w-full py-1.5 gap-1 px-1">
                <div className="shrink-0 pl-2 flex items-center" style={{ width: 'clamp(64px, 14%, 120px)' }}>
                  <span className="text-[9px] sm:text-[11px] text-[var(--gray-500)] font-medium leading-tight">
                    <span className="hidden sm:inline">{label}</span>
                    <span className="sm:hidden">{start}</span>
                  </span>
                </div>
                {DAYS.map(day => {
                  const slot = getSlot(day, start);
                  return (
                    <div key={day} className="flex-1 min-w-0 min-h-[52px] flex items-center px-0.5">
                      {slot ? (
                        <div className="w-full rounded-xl px-2 py-1.5 bg-[var(--primary-200)]/10 border border-[var(--primary-200)]/30">
                          <p className="text-[10px] font-bold text-[var(--primary-400)] truncate">{slot.course.code}</p>
                          <p className="text-[9px] text-[var(--gray-700)] truncate leading-tight">{slot.course.name}</p>
                          <p className="text-[8px] text-[var(--gray-500)] truncate mt-0.5">
                            {slot.timetable?.level} · {slot.timetable?.semester}
                          </p>
                          {slot.venue && <p className="text-[8px] text-[var(--gray-400)] truncate">{slot.venue}</p>}
                        </div>
                      ) : (
                        <div className="w-full min-h-[44px] rounded-xl border border-dashed border-[var(--gray-150)]" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerTimetablePage;
