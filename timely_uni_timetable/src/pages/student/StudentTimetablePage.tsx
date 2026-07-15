import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, ClipboardList } from 'lucide-react';
import { api } from '../../lib/api';
import type { Timetable, TimetableSlot, SystemSettings } from '../../lib/types';
import { AppContext } from '../../context/AppContext';
import TimetableGrid from '../../components/ui/TimetableGrid';
import SlotComplaintModal from '../../components/ui/SlotComplaintModal';
import toast from 'react-hot-toast';

const FORM_B_KEY = (userId: string) => `timely_formb_${userId}`;

interface FormBData {
  selectedCourseIds: string[];
  submittedAt: string;
}

const StudentTimetablePage = () => {
  const { user } = useContext(AppContext);
  const navigate = useNavigate();
  const [timetable,    setTimetable]    = useState<Timetable | null>(null);
  const [formB,        setFormB]        = useState<FormBData | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);

  useEffect(() => {
    if (!user?.student) { setLoading(false); return; }

    try {
      const raw = localStorage.getItem(FORM_B_KEY(user.id));
      if (raw) setFormB(JSON.parse(raw));
    } catch { /* ignore */ }

    const load = async () => {
      try {
        const settings = await api.get<SystemSettings>('/settings').catch(() => null);
        const semester = settings?.currentSemester ?? 'FIRST';
        const data = await api.get<Timetable>(`/timetables/my/student?semester=${semester}`);
        setTimetable(data);
      } catch (err: any) {
        if (!err?.message?.toLowerCase().includes('not found')) {
          toast.error(err instanceof Error ? err.message : 'Failed to load timetable');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const formBSubmitted = !!formB?.submittedAt;
  const selectedIds    = new Set(formB?.selectedCourseIds ?? []);

  const filteredSlots = (timetable?.slots ?? []).filter(slot => {
    if (!formBSubmitted) return true;
    return selectedIds.has(slot.course.id);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--primary-200)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--gray-dark)]">My Timetable</h1>
        {timetable && (
          <p className="text-xs text-[var(--gray-400)] mt-1">
            {timetable.department.name} · {timetable.level} · {timetable.semester} Semester · {timetable.academicYear}
            {formBSubmitted && (
              <span className="ml-2 text-emerald-600 font-medium">· {selectedIds.size} courses selected</span>
            )}
          </p>
        )}
      </div>

      {/* Form B prompt */}
      {!formBSubmitted && (
        <div
          onClick={() => navigate('/student/courses')}
          className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-5 cursor-pointer hover:bg-amber-100/70 transition-colors"
        >
          <ClipboardList className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">Submit Form B to personalise your timetable</p>
            <p className="text-xs text-amber-600">
              Showing all department courses. Tap here to select only the ones you're enrolled in.
            </p>
          </div>
          <span className="text-xs font-medium text-amber-700 bg-amber-200 px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap">
            Select Courses →
          </span>
        </div>
      )}

      <div className="h-px w-full bg-[var(--gray-200)] mb-5" />

      {!timetable ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <CalendarDays className="w-12 h-12 text-[var(--gray-300)] mb-3" />
          <p className="text-[var(--gray-500)] text-sm">No published timetable for your department and level yet.</p>
          <p className="text-[var(--gray-400)] text-xs mt-1">Check back after the admin publishes the schedule.</p>
        </div>
      ) : (
        <>
          <p className="text-[10px] text-[var(--gray-400)] mb-3">Tap any slot to report an issue with that course.</p>
          <TimetableGrid
            slots={filteredSlots}
            renderSlotCard={(slot, isDouble) => (
              <div
                onClick={() => setSelectedSlot(slot)}
                className="w-full h-full rounded-xl px-2 py-1.5 bg-[var(--primary-200)]/10 border border-[var(--primary-200)]/30 flex flex-col justify-start gap-px cursor-pointer hover:ring-2 hover:ring-[var(--primary-300)] transition-all"
              >
                {isDouble && (
                  <span className="text-[8px] uppercase tracking-widest text-[var(--primary-300)] font-bold mb-0.5">
                    4h · Double
                  </span>
                )}
                <p className="text-[10px] font-bold text-[var(--primary-400)] truncate">{slot.course.code}</p>
                <p className="text-[9px] text-[var(--gray-700)] truncate leading-tight">{slot.course.name}</p>
                <p className="text-[8px] text-[var(--gray-500)] truncate mt-0.5">
                  {slot.lecturer.firstName} {slot.lecturer.lastName}
                </p>
                {slot.venue && (
                  <p className="text-[8px] text-[var(--gray-400)] truncate">{slot.venue}</p>
                )}
              </div>
            )}
          />
        </>
      )}

      {selectedSlot && (
        <SlotComplaintModal
          slot={selectedSlot}
          role="STUDENT"
          level={timetable?.level}
          onClose={() => setSelectedSlot(null)}
        />
      )}
    </div>
  );
};

export default StudentTimetablePage;
