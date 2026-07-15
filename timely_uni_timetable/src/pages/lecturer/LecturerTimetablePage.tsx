import { useState, useEffect } from 'react';
import { CalendarDays } from 'lucide-react';
import { api } from '../../lib/api';
import type { TimetableSlot } from '../../lib/types';
import TimetableGrid from '../../components/ui/TimetableGrid';
import SlotComplaintModal from '../../components/ui/SlotComplaintModal';
import toast from 'react-hot-toast';

const LecturerTimetablePage = () => {
  const [slots,        setSlots]        = useState<TimetableSlot[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);

  useEffect(() => {
    api.get<TimetableSlot[]>('/timetables/my/lecturer')
      .then(setSlots)
      .catch(err => toast.error(err instanceof Error ? err.message : 'Failed to load timetable'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--primary-200)] border-t-transparent rounded-full" />
      </div>
    );
  }

  const hasDraft = slots.some(s => s.timetable?.status === 'DRAFT');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--gray-dark)]">My Timetable</h1>
        <p className="text-xs text-[var(--gray-400)] mt-1">
          {slots.length} slot{slots.length !== 1 ? 's' : ''} across all departments · tap a slot to request a time change
        </p>
      </div>

      {hasDraft && (
        <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <span className="text-xs font-semibold text-amber-700">
            Your schedule includes courses from a timetable that hasn't been published yet. Ask your admin to publish when ready.
          </span>
        </div>
      )}

      <div className="h-px w-full bg-[var(--gray-200)] mb-5" />

      {slots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <CalendarDays className="w-12 h-12 text-[var(--gray-300)] mb-3" />
          <p className="text-[var(--gray-500)] text-sm">No classes scheduled yet.</p>
          <p className="text-[var(--gray-400)] text-xs mt-1">Contact your admin to assign courses and publish the timetable.</p>
        </div>
      ) : (
        <TimetableGrid
          slots={slots}
          renderSlotCard={(slot, isDouble) => {
            const level   = slot.timetable?.level ?? slot.course.level;
            const isDraft = slot.timetable?.status === 'DRAFT';
            return (
              <div
                onClick={() => setSelectedSlot(slot)}
                className={`w-full h-full rounded-xl px-2 py-1.5 flex flex-col justify-start gap-px border cursor-pointer hover:ring-2 hover:ring-[var(--primary-300)] transition-all ${isDraft ? 'bg-amber-50/60 border-amber-200/60' : 'bg-[var(--primary-200)]/10 border-[var(--primary-200)]/30'}`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <span className={`text-[8px] font-bold text-white rounded px-1 py-px leading-none shrink-0 ${isDraft ? 'bg-amber-400' : 'bg-[var(--primary-400)]'}`}>
                    {level}
                  </span>
                  {isDouble && (
                    <span className="text-[8px] text-[var(--primary-300)] font-bold leading-none">· 4h</span>
                  )}
                  {isDraft && (
                    <span className="text-[7px] font-bold text-amber-500 leading-none uppercase tracking-wide">draft</span>
                  )}
                </div>
                <p className="text-[10px] font-bold text-[var(--primary-400)] truncate">{slot.course.code}</p>
                <p className="text-[9px] text-[var(--gray-700)] truncate leading-tight">{slot.course.name}</p>
                {slot.timetable?.semester && (
                  <p className="text-[8px] text-[var(--gray-500)] truncate mt-px">{slot.timetable.semester}</p>
                )}
                {slot.venue && (
                  <p className="text-[8px] text-[var(--gray-400)] truncate">{slot.venue}</p>
                )}
              </div>
            );
          }}
        />
      )}

      {selectedSlot && (
        <SlotComplaintModal
          slot={selectedSlot}
          role="LECTURER"
          onClose={() => setSelectedSlot(null)}
        />
      )}
    </div>
  );
};

export default LecturerTimetablePage;
