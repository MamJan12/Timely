import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, ChevronRight, CalendarDays, GraduationCap, Layers, BookOpen, Trash2, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';
import type { Timetable, Department, School, Level, Semester } from '../lib/types';
import LevelFilter from '../components/ui/LevelFilter';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/dateFormatter';

// ── Constants ─────────────────────────────────────────────────────────────────

const LEVELS: { label: string; value: Level }[] = [
  { label: 'Level 100', value: 'L100' },
  { label: 'Level 200', value: 'L200' },
  { label: 'Level 300', value: 'L300' },
  { label: 'Level 400', value: 'L400' },
  { label: 'Level 500', value: 'L500' },
];

const SEMESTERS: { label: string; value: Semester }[] = [
  { label: 'First Semester',  value: 'FIRST'  },
  { label: 'Second Semester', value: 'SECOND' },
];

const DEPT_COLORS: Record<string, string> = {
  'Software Engineering':           'bg-blue-100 text-blue-700 border-blue-200',
  'Network Engineering':            'bg-purple-100 text-purple-700 border-purple-200',
  'Telecommunications Engineering': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Electrical Engineering':         'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Civil Engineering':              'bg-orange-100 text-orange-700 border-orange-200',
  'Computer Science':               'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Mathematics':                    'bg-red-100 text-red-700 border-red-200',
  'Physics':                        'bg-indigo-100 text-indigo-700 border-indigo-200',
  'English & Communication':        'bg-pink-100 text-pink-700 border-pink-200',
  'Business Administration':        'bg-amber-100 text-amber-700 border-amber-200',
};
const getDeptColor = (name: string) => DEPT_COLORS[name] ?? 'bg-gray-100 text-gray-700 border-gray-200';

// ── Step indicator ────────────────────────────────────────────────────────────

const Step = ({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) => (
  <div className="flex items-center gap-2">
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
      done   ? 'bg-[var(--primary-200)] text-[var(--gray-dark)]' :
      active ? 'bg-[var(--gray-dark)] text-white' :
               'bg-[var(--gray-150)] text-[var(--gray-500)]'
    }`}>
      {done ? '✓' : n}
    </div>
    <span className={`text-xs font-medium ${active ? 'text-[var(--gray-dark)]' : 'text-[var(--gray-400)]'}`}>{label}</span>
  </div>
);

// ── Page ─────────────────────────────────────────────────────────────────────

const SchedulePage = () => {
  const navigate = useNavigate();

  const [timetables,   setTimetables]   = useState<Timetable[]>([]);
  const [departments,  setDepartments]  = useState<Department[]>([]);
  const [schools,      setSchools]      = useState<School[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [creating,     setCreating]     = useState(false);
  const [showModal,    setShowModal]    = useState(false);
  const [step,         setStep]         = useState(1);
  const [modalSchoolId, setModalSchoolId] = useState('');
  const [deptId,       setDeptId]       = useState('');
  const [level,        setLevel]        = useState<Level | ''>('');
  const [semester,     setSemester]     = useState<Semester | ''>('');
  const academicYear = (() => {
    const now = new Date();
    const startYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
    return `${startYear}/${startYear + 1}`;
  })();
  const [search,       setSearch]       = useState('');
  const [levelFilter,  setLevelFilter]  = useState<Level | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Timetable | null>(null);
  const [deleting,     setDeleting]     = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [tt, depts, schs] = await Promise.all([
        api.get<Timetable[]>('/timetables').catch(() => [] as Timetable[]),
        api.get<Department[]>('/departments').catch(() => [] as Department[]),
        api.get<School[]>('/schools').catch(() => [] as School[]),
      ]);
      setTimetables(tt ?? []);
      setDepartments(depts ?? []);
      setSchools(schs ?? []);
    } catch {
      // silently fall back to empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetModal = () => { setStep(1); setModalSchoolId(''); setDeptId(''); setLevel(''); setSemester(''); setShowModal(false); };

  const handleCreate = async () => {
    if (!deptId || !level || !semester) return;
    setCreating(true);
    try {
      const newTT = await api.post<Timetable>('/timetables', { departmentId: deptId, level, semester, academicYear });
      setTimetables(prev => [newTT, ...prev]);
      resetModal();
      navigate(`/admin/schedule/${newTT.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create timetable');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/timetables/${deleteTarget.id}`);
      setTimetables(prev => prev.filter(t => t.id !== deleteTarget.id));
      toast.success('Timetable deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const selectedDept = departments.find(d => d.id === deptId);

  const filtered = timetables.filter(t => {
    const matchesLevel  = levelFilter === null || t.level === levelFilter;
    const q = search.toLowerCase();
    const matchesSearch = !search || t.department.name.toLowerCase().includes(q) || t.level.toLowerCase().includes(q);
    return matchesLevel && matchesSearch;
  });

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--gray-dark)] leading-none">Schedule</h1>
        <p className="text-xs text-[var(--gray-400)] mt-1">
          {timetables.length} timetable{timetables.length !== 1 ? 's' : ''} generated
        </p>
      </div>

      <div className="h-px w-full bg-[var(--gray-200)] mb-4" />

      <div className="flex justify-end mb-4">
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--gray-dark)] text-white text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Timetable
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <LevelFilter value={levelFilter} onChange={setLevelFilter} />
        <div className="relative">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search timetables..."
            className="pl-9 pr-4 py-2 text-sm rounded-full border border-[var(--gray-200)] bg-white placeholder:text-[var(--gray-400)] focus:outline-none focus:border-[var(--primary-200)] w-52" />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--gray-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </div>
      </div>

      {/* ── Cards ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-[var(--gray-150)] p-5 h-44 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <CalendarDays className="w-12 h-12 text-[var(--gray-300)] mb-3" />
          <p className="text-[var(--gray-500)] text-sm">No timetables found.</p>
          <button onClick={() => setShowModal(true)} className="mt-3 text-sm text-[var(--primary-400)] hover:underline">Create one now</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(tt => (
            <div key={tt.id}
              className="relative group bg-white border border-[var(--gray-150)] rounded-2xl p-5 hover:shadow-md hover:border-[var(--primary-200)] transition-all duration-200">

              {/* Delete button — appears on hover */}
              <button
                onClick={e => { e.stopPropagation(); setDeleteTarget(tt); }}
                title="Delete timetable"
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white border border-[var(--gray-150)] items-center justify-center hidden group-hover:flex hover:bg-red-50 hover:border-red-200 transition-all z-10"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
              </button>

              {/* Click card body to open editor */}
              <button onClick={() => navigate(`/admin/schedule/${tt.id}`)} className="w-full text-left">
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                    tt.status === 'PUBLISHED' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>{tt.status}</span>
                  <ChevronRight className="w-4 h-4 text-[var(--gray-300)] group-hover:text-[var(--primary-200)] transition-colors" />
                </div>

                <span className={`inline-block text-[11px] font-medium px-2.5 py-1 rounded-full border mb-3 ${getDeptColor(tt.department.name)}`}>
                  {tt.department.name}
                </span>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-[var(--gray-600)]">
                    <GraduationCap className="w-3.5 h-3.5 shrink-0" /><span className="font-medium">{tt.level}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--gray-600)]">
                    <Layers className="w-3.5 h-3.5 shrink-0" /><span>{tt.semester} Semester</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--gray-600)]">
                    <CalendarDays className="w-3.5 h-3.5 shrink-0" /><span>{tt.academicYear}</span>
                  </div>
                </div>
                <p className="text-[10px] text-[var(--gray-400)]">Created {formatDate(tt.createdAt)}</p>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--gray-dark)]">Delete Timetable?</h3>
                <p className="text-xs text-[var(--gray-500)] mt-0.5">This will delete all slots. Cannot be undone.</p>
              </div>
            </div>
            <div className="bg-[var(--gray-50)] border border-[var(--gray-150)] rounded-xl px-4 py-3 mb-5">
              <p className="text-sm font-semibold text-[var(--gray-dark)]">{deleteTarget.department.name}</p>
              <p className="text-xs text-[var(--gray-500)] mt-0.5">
                {deleteTarget.level} · {deleteTarget.semester} Semester · {deleteTarget.academicYear}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--gray-200)] text-sm text-[var(--gray-700)] hover:bg-[var(--gray-100)] transition-colors">
                No, keep it
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-40">
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Timetable Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--gray-150)]">
              <div>
                <h3 className="text-lg font-bold text-[var(--gray-dark)]">New Timetable</h3>
                <p className="text-xs text-[var(--gray-500)] mt-0.5">Fill in the details to generate a timetable</p>
              </div>
              <button onClick={resetModal} className="w-7 h-7 rounded-full hover:bg-[var(--gray-100)] flex items-center justify-center">
                <X className="w-4 h-4 text-[var(--gray-600)]" />
              </button>
            </div>

            <div className="flex items-center gap-4 px-6 py-4 border-b border-[var(--gray-100)]">
              <Step n={1} label="Department" active={step === 1} done={step > 1} />
              <div className="flex-1 h-px bg-[var(--gray-150)]" />
              <Step n={2} label="Level" active={step === 2} done={step > 2} />
              <div className="flex-1 h-px bg-[var(--gray-150)]" />
              <Step n={3} label="Semester" active={step === 3} done={false} />
            </div>

            <div className="px-6 py-5 flex-1">

              {step === 1 && (() => {
                const filteredDepts = modalSchoolId
                  ? departments.filter(d => d.schoolId === modalSchoolId)
                  : [];
                return (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-4 h-4 text-[var(--primary-400)]" />
                        <p className="text-sm font-semibold text-[var(--gray-dark)]">Select School</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {schools.map(s => {
                          const active = modalSchoolId === s.id;
                          return (
                            <button key={s.id} onClick={() => { setModalSchoolId(s.id); setDeptId(''); }}
                              className={`px-4 py-2 rounded-xl text-center transition-colors border flex flex-col items-center min-w-[72px] ${
                                active
                                  ? 'bg-[var(--gray-dark)] border-[var(--gray-dark)]'
                                  : 'bg-white border-[var(--gray-200)] hover:border-[var(--gray-400)] hover:bg-[var(--gray-50)]'
                              }`}>
                              <span className={`text-xs font-bold leading-tight ${active ? 'text-white' : 'text-[var(--gray-700)]'}`}>
                                {s.abbreviation}
                              </span>
                              <span className={`text-[8px] leading-tight mt-0.5 max-w-[100px] ${active ? 'text-white/50' : 'text-[var(--gray-400)]'}`}>
                                {s.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {modalSchoolId && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <BookOpen className="w-4 h-4 text-[var(--primary-400)]" />
                          <p className="text-sm font-semibold text-[var(--gray-dark)]">Select Department</p>
                        </div>
                        {filteredDepts.length === 0 ? (
                          <p className="text-sm text-[var(--gray-400)] text-center py-6">
                            No departments under this school yet.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                            {filteredDepts.map(d => (
                              <button key={d.id} onClick={() => setDeptId(d.id)}
                                className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                                  deptId === d.id
                                    ? 'bg-[var(--gray-dark)] text-white border-[var(--gray-dark)]'
                                    : 'bg-white text-[var(--gray-700)] border-[var(--gray-200)] hover:border-[var(--primary-200)]'
                                }`}>
                                {d.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {step === 2 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <GraduationCap className="w-4 h-4 text-[var(--primary-400)]" />
                    <p className="text-sm font-semibold text-[var(--gray-dark)]">Select Level</p>
                  </div>
                  <p className="text-xs text-[var(--gray-500)] mb-3">
                    Department: <span className="font-semibold text-[var(--gray-dark)]">{selectedDept?.name}</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {LEVELS.map(l => (
                      <button key={l.value} onClick={() => setLevel(l.value)}
                        className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
                          level === l.value
                            ? 'bg-[var(--gray-dark)] text-white border-[var(--gray-dark)]'
                            : 'bg-white text-[var(--gray-700)] border-[var(--gray-200)] hover:border-[var(--primary-200)]'
                        }`}>
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Layers className="w-4 h-4 text-[var(--primary-400)]" />
                    <p className="text-sm font-semibold text-[var(--gray-dark)]">Select Semester</p>
                  </div>
                  <div className="bg-[var(--gray-50)] border border-[var(--gray-150)] rounded-xl px-4 py-3 mb-4 space-y-1">
                    <p className="text-xs text-[var(--gray-500)]">Department: <span className="font-semibold text-[var(--gray-dark)]">{selectedDept?.name}</span></p>
                    <p className="text-xs text-[var(--gray-500)]">Level: <span className="font-semibold text-[var(--gray-dark)]">{level}</span></p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {SEMESTERS.map(s => (
                      <button key={s.value} onClick={() => setSemester(s.value)}
                        className={`px-4 py-4 rounded-xl border text-sm font-medium transition-all ${
                          semester === s.value
                            ? 'bg-[var(--gray-dark)] text-white border-[var(--gray-dark)]'
                            : 'bg-white text-[var(--gray-700)] border-[var(--gray-200)] hover:border-[var(--primary-200)]'
                        }`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--gray-700)] block mb-1">Academic Year</label>
                    <div className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] bg-[var(--gray-100)] text-[var(--gray-700)]">
                      {academicYear}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 pb-6 flex justify-between gap-3">
              {step > 1
                ? <button onClick={() => setStep(s => s - 1)} className="px-4 py-2.5 rounded-xl border border-[var(--gray-200)] text-sm text-[var(--gray-700)] hover:bg-[var(--gray-100)] transition-colors">Back</button>
                : <div />
              }
              {step < 3 ? (
                <button onClick={() => setStep(s => s + 1)} disabled={step === 1 ? !deptId : !level}
                  className="px-5 py-2.5 rounded-xl bg-[var(--gray-dark)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">
                  Next
                </button>
              ) : (
                <button onClick={handleCreate} disabled={!semester || creating}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--primary-200)' }}>
                  {creating ? 'Creating…' : 'Create Timetable'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
