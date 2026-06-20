import { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, X, Pencil, Trash2, UserPlus, UserMinus } from 'lucide-react';
import { api } from '../../lib/api';
import type { Course, Department, Lecturer, Level } from '../../lib/types';
import Button from '../../components/ui/Button';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '../../components/ui/Table';
import DeleteConfirmModal from '../../components/ui/DeleteConfirmModal';
import FAB from '../../components/ui/FAB';
import LevelFilter from '../../components/ui/LevelFilter';
import DepartmentFilter from '../../components/ui/DepartmentFilter';
import toast from 'react-hot-toast';

const LEVELS: Level[] = ['L100', 'L200', 'L300', 'L400', 'L500']; // still needed for the form select

interface FormState {
  code: string;
  name: string;
  credits: string;
  departmentId: string;
  level: Level | '';
  isShared: boolean;
}
const EMPTY: FormState = { code: '', name: '', credits: '3', departmentId: '', level: '', isShared: false };

const CoursesPage = () => {
  const [courses,      setCourses]      = useState<Course[]>([]);
  const [departments,  setDepartments]  = useState<Department[]>([]);
  const [lecturers,    setLecturers]    = useState<Lecturer[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [editing,      setEditing]      = useState<Course | null>(null);
  const [form,         setForm]         = useState<FormState>(EMPTY);
  const [saving,       setSaving]       = useState(false);
  const [search,       setSearch]       = useState('');
  const [levelFilter,  setLevelFilter]  = useState<Level | null>(null);
  const [openMenuId,     setOpenMenuId]     = useState<string | null>(null);
  const [deleteTarget,   setDeleteTarget]   = useState<Course | null>(null);
  const [newLecId,       setNewLecId]       = useState('');
  const [semesterFilter, setSemesterFilter] = useState<'ALL' | 1 | 2>('ALL');
  const [deptFilter,     setDeptFilter]     = useState<string | null>(null);

  const load = async () => {
    const [c, d, l] = await Promise.all([
      api.get<Course[]>('/courses'),
      api.get<Department[]>('/departments'),
      api.get<Lecturer[]>('/lecturers'),
    ]);
    setCourses(c); setDepartments(d); setLecturers(l);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  // Close dropdown when clicking outside any menu container
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-menu-container]')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setNewLecId(''); setShowForm(true); };
  const openEdit = (c: Course) => {
    setEditing(c);
    setForm({ code: c.code, name: c.name, credits: String(c.credits), departmentId: c.department.id, level: c.level, isShared: c.isShared });
    setNewLecId('');
    setOpenMenuId(null);
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY); };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.level) { toast.error('Please select a level'); return; }
    setSaving(true);
    try {
      const payload = { ...form, credits: parseInt(form.credits) || 3 };
      if (editing) {
        const updated = await api.patch<Course>(`/courses/${editing.id}`, payload);
        setCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
        toast.success('Course updated');
      } else {
        const created = await api.post<Course>('/courses', payload);
        setCourses(prev => [created, ...prev]);
        toast.success('Course created');
      }
      closeForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/courses/${deleteTarget.id}`);
      setCourses(prev => prev.filter(c => c.id !== deleteTarget.id));
      toast.success('Course deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleAssignLecturer = async () => {
    if (!editing || !newLecId) return;
    try {
      await api.post(`/courses/${editing.id}/lecturers`, { lecturerId: newLecId });
      const fresh = await api.get<Course[]>('/courses');
      setCourses(fresh);
      const updated = fresh.find(c => c.id === editing.id);
      if (updated) setEditing(updated);
      setNewLecId('');
      toast.success('Lecturer assigned');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const handleUnassignLecturer = async (lecturerId: string) => {
    if (!editing) return;
    try {
      await api.delete(`/courses/${editing.id}/lecturers/${lecturerId}`);
      const fresh = await api.get<Course[]>('/courses');
      setCourses(fresh);
      const updated = fresh.find(c => c.id === editing.id);
      if (updated) setEditing(updated);
      toast.success('Lecturer removed');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  // Odd number in code → Semester 1, even → Semester 2 (e.g. EEB 305 = Sem 1, CED 302 = Sem 2)
  const getSemester = (code: string): 1 | 2 | null => {
    const match = code.match(/\d+/);
    if (!match) return null;
    return parseInt(match[0]) % 2 === 1 ? 1 : 2;
  };

  const filtered = courses.filter(c => {
    const matchesLevel    = levelFilter === null || c.level === levelFilter;
    const matchesSemester = semesterFilter === 'ALL' || getSemester(c.code) === semesterFilter;
    const matchesDept     = deptFilter === null || c.department.id === deptFilter;
    const q = search.toLowerCase();
    const matchesSearch   = !search || c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
    return matchesLevel && matchesSemester && matchesDept && matchesSearch;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--gray-dark)]">Courses</h1>
          <p className="text-xs text-[var(--gray-400)] mt-1">
            {courses.length} course{courses.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Course
        </Button>
      </div>
      <div className="h-px w-full bg-[var(--gray-200)] mb-5" />

      {/* Level + Department filter buttons + search */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <LevelFilter value={levelFilter} onChange={setLevelFilter} />
          <div className="w-px h-6 bg-[var(--gray-200)]" />
          <DepartmentFilter departments={departments} value={deptFilter} onChange={setDeptFilter} />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by code or name…"
              className="pl-9 pr-4 py-2 text-sm rounded-full border border-[var(--gray-200)] bg-white placeholder:text-[var(--gray-400)] focus:outline-none focus:border-[var(--primary-200)] w-56"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--gray-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </div>
          {/* Semester filter */}
          <div className="flex items-center gap-1 bg-[var(--gray-100)] rounded-full p-1">
            {([['ALL', 'All'], [1, 'Sem 1'], [2, 'Sem 2']] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setSemesterFilter(val)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  semesterFilter === val
                    ? 'bg-white text-[var(--gray-dark)] shadow-sm'
                    : 'text-[var(--gray-500)] hover:text-[var(--gray-700)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--gray-150)] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-[var(--gray-dark)]">
              <TableHead className="text-white py-3">Course ID</TableHead>
              <TableHead className="text-white py-3">Course Title</TableHead>
              <TableHead className="text-white py-3">Lecturer(s)</TableHead>
              <TableHead className="text-white py-3 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm text-[var(--gray-400)]">Loading…</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm text-[var(--gray-400)]">No courses found.</td>
              </tr>
            ) : filtered.map((c, i) => (
              <tr
                key={c.id}
                className={`border-b border-[var(--gray-100)] ${i % 2 === 0 ? 'bg-[var(--gray-50)]' : 'bg-white'}`}
              >
                <TableCell className="font-bold text-[var(--primary-400)]">{c.code}</TableCell>
                <TableCell className="font-medium text-[var(--gray-dark)]">{c.name}</TableCell>
                <TableCell>
                  {c.lecturers.length === 0 ? (
                    <span className="text-xs text-[var(--gray-400)] italic">Unassigned</span>
                  ) : (
                    <div className="flex flex-col gap-0.5">
                      {c.lecturers.slice(0, 2).map(({ lecturer }) => (
                        <span key={lecturer.id} className="text-xs text-[var(--gray-700)]">
                          {lecturer.firstName} {lecturer.lastName}
                        </span>
                      ))}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <div className="relative" data-menu-container>
                      <button
                        onClick={() => setOpenMenuId(prev => prev === c.id ? null : c.id)}
                        className="px-3 py-1.5 text-xs font-semibold border border-[var(--gray-200)] rounded-lg hover:bg-[var(--gray-100)] text-[var(--gray-700)] flex items-center gap-1 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {openMenuId === c.id && (
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-[var(--gray-150)] z-20 py-1 overflow-hidden">
                          <button
                            onClick={() => openEdit(c)}
                            className="w-full text-left px-4 py-2 text-sm text-[var(--gray-700)] hover:bg-[var(--gray-50)] flex items-center gap-2"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => { setDeleteTarget(c); setOpenMenuId(null); }}
                            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
              </tr>
            ))}
          </TableBody>
        </Table>
      </div>

      <FAB onClick={openCreate} title="Add Course" />

      {/* ── Create / Edit Modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--gray-150)]">
              <h3 className="text-lg font-bold text-[var(--gray-dark)]">
                {editing ? 'Edit Course' : 'Add Course'}
              </h3>
              <button onClick={closeForm} className="w-7 h-7 rounded-full hover:bg-[var(--gray-100)] flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 space-y-3">
              {([
                { label: 'Course Code', key: 'code',    type: 'text',   required: true },
                { label: 'Course Name', key: 'name',    type: 'text',   required: true },
                { label: 'Credits',     key: 'credits', type: 'number', required: false },
              ] as const).map(({ label, key, type, required }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-[var(--gray-700)] block mb-1">{label}</label>
                  <input
                    type={type}
                    required={required}
                    value={form[key] as string}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)]"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-[var(--gray-700)] block mb-1">Department *</label>
                <select
                  required
                  value={form.departmentId}
                  onChange={e => setForm(p => ({ ...p, departmentId: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)]"
                >
                  <option value="">Select department…</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--gray-700)] block mb-1">Level *</label>
                <select
                  required
                  value={form.level}
                  onChange={e => setForm(p => ({ ...p, level: e.target.value as Level }))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)]"
                >
                  <option value="">Select level…</option>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isShared}
                  onChange={e => setForm(p => ({ ...p, isShared: e.target.checked }))}
                  className="w-4 h-4 rounded"
                />
                <span className="text-xs text-[var(--gray-700)]">Shared course (used across departments)</span>
              </label>

              {/* Lecturer assignment — only when editing */}
              {editing && (
                <div className="pt-3 border-t border-[var(--gray-150)] space-y-2">
                  <p className="text-xs font-semibold text-[var(--gray-700)]">Assigned Lecturers</p>
                  {editing.lecturers.length === 0 ? (
                    <p className="text-xs text-[var(--gray-400)] italic">No lecturers assigned yet</p>
                  ) : (
                    editing.lecturers.map(({ lecturer }) => (
                      <div key={lecturer.id} className="flex items-center justify-between bg-[var(--gray-50)] rounded-lg px-3 py-1.5">
                        <span className="text-xs text-[var(--gray-700)]">
                          {lecturer.firstName} {lecturer.lastName}
                          <span className="ml-1 text-[var(--gray-400)]">({lecturer.staffId})</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUnassignLecturer(lecturer.id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                  {editing.lecturers.length < 2 && (
                    <div className="flex gap-2">
                      <select
                        value={newLecId}
                        onChange={e => setNewLecId(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)]"
                      >
                        <option value="">Add a lecturer…</option>
                        {lecturers
                          .filter(l => !editing.lecturers.some(al => al.lecturer.id === l.id))
                          .map(l => (
                            <option key={l.id} value={l.id}>
                              {l.firstName} {l.lastName} ({l.staffId})
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAssignLecturer}
                        disabled={!newLecId}
                        className="px-3 py-2 rounded-xl bg-[var(--primary-400)] text-white text-xs font-medium disabled:opacity-40 flex items-center gap-1 hover:bg-[var(--primary-500)] transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 rounded-full border border-[var(--gray-200)] text-sm text-[var(--gray-700)] hover:bg-[var(--gray-100)]"
                >
                  Cancel
                </button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        itemName={deleteTarget ? `${deleteTarget.code} – ${deleteTarget.name}` : ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default CoursesPage;
