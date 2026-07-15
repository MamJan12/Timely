import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, X, CheckCircle, AlertTriangle, Wand2, Trash2 } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { Timetable, TimetableSlot, Course, Lecturer, Day } from '../lib/types';
import TimetableGrid, {
  DAY_LABELS,
  SLOT_END_MAP,
  SLOT_END_OPTIONS,
} from '../components/ui/TimetableGrid';
import toast from 'react-hot-toast';

interface EditingCell { day: Day; startTime: string; endTime: string; existingSlot?: TimetableSlot }

const GenTimetablePage = () => {
  const { id: timetableId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [timetable,    setTimetable]    = useState<Timetable | null>(null);
  const [courses,      setCourses]      = useState<Course[]>([]);
  const [lecturers,    setLecturers]    = useState<Lecturer[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [editingCell,  setEditingCell]  = useState<EditingCell | null>(null);
  const [formCourse,   setFormCourse]   = useState('');
  const [formLecturer, setFormLecturer] = useState('');
  const [formVenue,    setFormVenue]    = useState('');
  const [formEndTime,  setFormEndTime]  = useState('');
  const [saving,       setSaving]       = useState(false);
  const [generating,   setGenerating]   = useState(false);
  const [publishing,   setPublishing]   = useState(false);
  const [conflicts,    setConflicts]    = useState<{ type: string; details: string }[]>([]);

  useEffect(() => {
    if (!timetableId) return;
    const load = async () => {
      setLoading(true);
      try {
        const tt = await api.get<Timetable>(`/timetables/${timetableId}`);
        setTimetable(tt);
        const [c, l] = await Promise.all([
          api.get<Course[]>(`/courses?department=${tt.department.id}&level=${tt.level}`),
          api.get<Lecturer[]>('/lecturers'),
        ]);
        setCourses(c);
        setLecturers(l);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to load timetable');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [timetableId]);

  const openCell = (day: Day, startTime: string, defaultEndTime: string) => {
    const existing = timetable?.slots?.find(s => s.day === day && s.startTime === startTime);
    setEditingCell({ day, startTime, endTime: defaultEndTime, existingSlot: existing });
    setFormCourse(existing?.course.id ?? '');
    setFormLecturer(existing?.lecturer.id ?? '');
    setFormVenue(existing?.venue ?? '');
    setFormEndTime(existing?.endTime ?? defaultEndTime);
    setConflicts([]);
  };

  const closeCell = () => { setEditingCell(null); setConflicts([]); };

  const saveCell = async () => {
    if (!editingCell || !timetableId) return;
    setSaving(true);
    setConflicts([]);
    try {
      const body = {
        day:        editingCell.day,
        startTime:  editingCell.startTime,
        endTime:    formEndTime,
        courseId:   formCourse,
        lecturerId: formLecturer,
        venue:      formVenue || undefined,
      };

      if (editingCell.existingSlot) {
        const updated = await api.patch<TimetableSlot>(
          `/timetables/${timetableId}/slots/${editingCell.existingSlot.id}`,
          body,
        );
        setTimetable(prev =>
          prev ? { ...prev, slots: prev.slots?.map(s => s.id === updated.id ? updated : s) } : prev,
        );
      } else {
        const created = await api.post<TimetableSlot>(`/timetables/${timetableId}/slots`, body);
        setTimetable(prev =>
          prev ? { ...prev, slots: [...(prev.slots ?? []), created] } : prev,
        );
      }
      closeCell();
      toast.success('Slot saved');
    } catch (err) {
      if (err instanceof ApiError && Array.isArray(err.body.conflicts)) {
        setConflicts(err.body.conflicts as { type: string; details: string }[]);
      } else {
        toast.error(err instanceof Error ? err.message : 'Failed to save slot');
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteSlot = async () => {
    if (!editingCell?.existingSlot || !timetableId) return;
    setSaving(true);
    try {
      await api.delete(`/timetables/${timetableId}/slots/${editingCell.existingSlot.id}`);
      setTimetable(prev =>
        prev ? { ...prev, slots: prev.slots?.filter(s => s.id !== editingCell.existingSlot!.id) } : prev,
      );
      closeCell();
      toast.success('Slot cleared');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!timetableId) return;
    setGenerating(true);
    try {
      const result = await api.post<{ generated: number; total: number; slots: TimetableSlot[] }>(
        `/timetables/${timetableId}/generate`,
        {},
      );
      const fresh = await api.get<Timetable>(`/timetables/${timetableId}`);
      setTimetable(fresh);
      toast.success(`Auto-generated ${result.generated} of ${result.total} slots`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!timetableId) return;
    setPublishing(true);
    try {
      await api.patch(`/timetables/${timetableId}/status`, { status: 'PUBLISHED' });
      setTimetable(prev => prev ? { ...prev, status: 'PUBLISHED' } : prev);
      toast.success('Timetable published!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--primary-200)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!timetable) return <p className="text-center text-[var(--gray-500)] py-12">Timetable not found.</p>;

  const slots = timetable.slots ?? [];

  return (
    <div className="min-h-full">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-1 gap-4 flex-wrap">
        <div>
          <button
            onClick={() => navigate('/admin/schedule')}
            className="flex items-center gap-1.5 text-xs text-[var(--gray-500)] hover:text-[var(--gray-dark)] mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Schedule
          </button>
          <h1 className="text-xl font-bold text-[var(--gray-dark)] leading-tight">{timetable.department.name}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-[var(--gray-500)]">{timetable.level}</span>
            <span className="text-[var(--gray-300)]">·</span>
            <span className="text-xs text-[var(--gray-500)]">{timetable.semester} Semester</span>
            <span className="text-[var(--gray-300)]">·</span>
            <span className="text-xs text-[var(--gray-500)]">{timetable.academicYear}</span>
            <span className="text-[var(--gray-300)]">·</span>
            <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
              timetable.status === 'PUBLISHED'
                ? 'bg-green-50 text-green-600 border-green-100'
                : 'bg-amber-50 text-amber-600 border-amber-100'
            }`}>{timetable.status}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {timetable.status !== 'PUBLISHED' && (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--gray-200)] bg-white text-sm font-medium text-[var(--gray-700)] hover:bg-[var(--gray-50)] transition-colors disabled:opacity-40"
            >
              <Wand2 className="w-4 h-4" /> {generating ? 'Generating…' : 'Auto-Generate'}
            </button>
          )}
          {timetable.status !== 'PUBLISHED' && (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-40"
              style={{ backgroundColor: 'var(--primary-200)' }}
            >
              <CheckCircle className="w-4 h-4" /> {publishing ? 'Publishing…' : 'Publish'}
            </button>
          )}
        </div>
      </div>

      <div className="h-px w-full bg-[var(--gray-200)] my-5" />

      {/* ── Timetable Grid ── */}
      <TimetableGrid
        slots={slots}
        renderSlotCard={(slot, isDouble) => (
          <button
            onClick={() => openCell(slot.day, slot.startTime, slot.endTime)}
            className="w-full h-full rounded-xl px-2 py-1.5 text-left border bg-[var(--primary-200)]/10 border-[var(--primary-200)]/30 transition-all hover:shadow-sm flex flex-col justify-start gap-px"
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
          </button>
        )}
        renderEmpty={(day, startTime) => (
          <button
            onClick={() => timetable.status !== 'PUBLISHED' && openCell(day, startTime, SLOT_END_MAP[startTime])}
            disabled={timetable.status === 'PUBLISHED'}
            className="w-full h-full min-h-[52px] rounded-xl border border-dashed border-[var(--gray-200)] hover:border-[var(--primary-200)] hover:bg-[var(--primary-200)]/5 transition-all disabled:cursor-default disabled:hover:border-[var(--gray-200)] disabled:hover:bg-transparent"
          />
        )}
      />

      {/* ── Slot Edit Modal ── */}
      {editingCell && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--gray-150)]">
              <div>
                <h3 className="text-base font-bold text-[var(--gray-dark)]">
                  {editingCell.existingSlot ? 'Edit Slot' : 'Add Course'}
                </h3>
                <p className="text-xs text-[var(--gray-500)] mt-0.5">
                  {DAY_LABELS[editingCell.day]} · {editingCell.startTime} – {formEndTime}
                </p>
              </div>
              <button
                onClick={closeCell}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[var(--gray-100)]"
              >
                <X className="w-4 h-4 text-[var(--gray-600)]" />
              </button>
            </div>

            <div className="px-5 py-5 space-y-4">
              {conflicts.length > 0 && (
                <div className="space-y-2">
                  {conflicts.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>{c.details}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Duration / end time selector */}
              <div>
                <label className="text-xs font-medium text-[var(--gray-700)] block mb-1">Duration</label>
                <select
                  value={formEndTime}
                  onChange={e => setFormEndTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)] text-[var(--gray-dark)]"
                >
                  {(SLOT_END_OPTIONS[editingCell.startTime] ?? []).map(end => {
                    const hours = parseInt(end, 10) - parseInt(editingCell.startTime, 10);
                    return (
                      <option key={end} value={end}>
                        {editingCell.startTime} – {end} · {hours}h
                        {hours >= 4 ? ' (Double Period)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--gray-700)] block mb-1">Course</label>
                <select
                  value={formCourse}
                  onChange={e => setFormCourse(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)] text-[var(--gray-dark)]"
                >
                  <option value="">Select course…</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--gray-700)] block mb-1">Lecturer</label>
                <select
                  value={formLecturer}
                  onChange={e => setFormLecturer(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)] text-[var(--gray-dark)]"
                >
                  <option value="">Select lecturer…</option>
                  {lecturers.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.firstName} {l.lastName} ({l.staffId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--gray-700)] block mb-1">Venue (optional)</label>
                <input
                  type="text"
                  value={formVenue}
                  onChange={e => setFormVenue(e.target.value)}
                  placeholder="e.g. LT1"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)] text-[var(--gray-dark)]"
                />
              </div>
            </div>

            <div className="px-5 pb-6 flex justify-between gap-3">
              {editingCell.existingSlot && (
                <button
                  onClick={deleteSlot}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-red-500 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              )}
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={closeCell}
                  className="px-4 py-2 rounded-xl border border-[var(--gray-200)] text-sm text-[var(--gray-700)] hover:bg-[var(--gray-100)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCell}
                  disabled={saving || !formCourse || !formLecturer}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--gray-dark)] transition-opacity disabled:opacity-40"
                  style={{ backgroundColor: 'var(--primary-200)' }}
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenTimetablePage;
