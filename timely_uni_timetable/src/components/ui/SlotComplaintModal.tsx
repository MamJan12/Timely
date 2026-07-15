import { useState } from 'react';
import { X, Clock, CalendarDays, Send } from 'lucide-react';
import { api } from '../../lib/api';
import type { TimetableSlot, Role, Level } from '../../lib/types';
import Button from './Button';
import toast from 'react-hot-toast';

const DAYS = ['TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;
const START_TIMES = ['07:00', '09:00', '11:00', '13:00', '15:00', '17:00'];
const END_TIMES   = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00'];

interface Props {
  slot:    TimetableSlot;
  role:    Role;
  level?:  Level;
  onClose: () => void;
}

const cap = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

const SlotComplaintModal = ({ slot, role, level, onClose }: Props) => {
  const [description,  setDescription]  = useState('');
  const [requestedDay, setRequestedDay] = useState('');
  const [startTime,    setStartTime]    = useState('');
  const [endTime,      setEndTime]      = useState('');
  const [submitting,   setSubmitting]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) { toast.error('Please describe the issue'); return; }
    if (role === 'LECTURER' && (!requestedDay || !startTime || !endTime)) {
      toast.error('Please specify your preferred day and time'); return;
    }

    setSubmitting(true);
    try {
      await api.post('/complaints', {
        description:  description.trim(),
        courseId:     slot.course.id,
        ...(level && { level }),
        ...(role === 'LECTURER' && {
          requestedDay,
          requestedStartTime: startTime,
          requestedEndTime:   endTime,
        }),
      });
      toast.success('Complaint submitted successfully');
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--gray-150)]">
          <div>
            <h3 className="text-lg font-bold text-[var(--gray-dark)]">
              {role === 'LECTURER' ? 'Request Time Change' : 'Report an Issue'}
            </h3>
            <p className="text-xs text-[var(--gray-400)] mt-0.5">
              {slot.course.code}: {slot.course.name}
            </p>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-[var(--gray-100)] flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current slot info */}
        <div className="px-6 pt-4 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-[var(--gray-500)] font-medium uppercase tracking-wide mr-1">Currently:</span>
          <span className="flex items-center gap-1.5 text-xs text-[var(--gray-600)] bg-[var(--gray-50)] border border-[var(--gray-150)] rounded-lg px-2.5 py-1">
            <CalendarDays className="w-3 h-3" /> {cap(slot.day)}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-[var(--gray-600)] bg-[var(--gray-50)] border border-[var(--gray-150)] rounded-lg px-2.5 py-1">
            <Clock className="w-3 h-3" /> {slot.startTime} – {slot.endTime}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Lecturer-only: preferred day + time */}
          {role === 'LECTURER' && (
            <>
              <div>
                <label className="text-xs font-medium text-[var(--gray-700)] block mb-1">
                  Preferred Day <span className="text-red-500">*</span>
                </label>
                <select value={requestedDay} onChange={e => setRequestedDay(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)] bg-white">
                  <option value="">Select a day…</option>
                  {DAYS.map(d => <option key={d} value={d}>{cap(d)}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--gray-700)] block mb-1">
                    Preferred Start <span className="text-red-500">*</span>
                  </label>
                  <select value={startTime} onChange={e => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)] bg-white">
                    <option value="">select...</option>
                    {START_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--gray-700)] block mb-1">
                    Preferred End <span className="text-red-500">*</span>
                  </label>
                  <select value={endTime} onChange={e => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)] bg-white">
                    <option value="">select...</option>
                    {END_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-[var(--gray-700)] block mb-1">
              {role === 'LECTURER' ? 'Reason / Additional Details' : 'Describe the Issue'}
              {' '}<span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              placeholder={role === 'LECTURER'
                ? 'Explain why you would like a different time slot…'
                : 'Describe your issue with this course slot…'}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)] resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-full border border-[var(--gray-200)] text-sm text-[var(--gray-700)] hover:bg-[var(--gray-100)]">
              Cancel
            </button>
            <Button type="submit" disabled={submitting} className="flex items-center gap-2">
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Submitting…' : 'Submit'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SlotComplaintModal;
