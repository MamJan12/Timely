import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, UserPlus, UserMinus } from 'lucide-react';
import { api } from '../../lib/api';
import type { Course, Department, Lecturer, Level } from '../../lib/types';
import Button from '../../components/ui/Button';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '../../components/ui/Table';
import toast from 'react-hot-toast';

const LEVELS: Level[] = ['L100', 'L200', 'L300', 'L400', 'L500'];

interface FormState { code: string; name: string; credits: string; departmentId: string; level: Level | ''; isShared: boolean }
const EMPTY: FormState = { code: '', name: '', credits: '3', departmentId: '', level: '', isShared: false };

const CoursesPage = () => {
  const [courses,     setCourses]     = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [lecturers,   setLecturers]   = useState<Lecturer[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [editing,     setEditing]     = useState<Course | null>(null);
  const [form,        setForm]        = useState<FormState>(EMPTY);
  const [saving,      setSaving]      = useState(false);
  const [search,      setSearch]      = useState('');
  const [assigning,   setAssigning]   = useState<Course | null>(null);
  const [newLecId,    setNewLecId]    = useState('');

  const load = async () => {
    const [c, d, l] = await Promise.all([
      api.get<Course[]>('/courses'),
      api.get<Department[]>('/departments'),
      api.get<Lecturer[]>('/lecturers'),
    ]);
    setCourses(c); setDepartments(d); setLecturers(l);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit   = (c: Course) => {
    setEditing(c);
    setForm({ code: c.code, name: c.name, credits: String(c.credits), departmentId: c.department.id, level: c.level, isShared: c.isShared });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY); };

  const handleSave = async (e: React.FormEvent) => {
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

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course?')) return;
    try {
      await api.delete(`/courses/${id}`);
      setCourses(prev => prev.filter(c => c.id !== id));
      toast.success('Course deleted');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const handleAssign = async () => {
    if (!assigning || !newLecId) return;
    try {
      await api.post(`/courses/${assigning.id}/lecturers`, { lecturerId: newLecId });
      await load();
      setNewLecId('');
      toast.success('Lecturer assigned');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const handleUnassign = async (courseId: string, lecturerId: string) => {
    try {
      await api.delete(`/courses/${courseId}/lecturers/${lecturerId}`);
      await load();
      toast.success('Lecturer removed');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const filtered = courses.filter(c => {
    const q = search.toLowerCase();
    return !search || c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--gray-dark)]">Courses</h1>
          <p className="text-xs text-[var(--gray-400)] mt-1">{courses.length} course{courses.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-2"><Plus className="w-4 h-4" /> Add Course</Button>
      </div>
      <div className="h-px w-full bg-[var(--gray-200)] mb-5" />

      <div className="flex justify-end mb-4">
        <div className="relative">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by code or name…"
            className="pl-9 pr-4 py-2 text-sm rounded-full border border-[var(--gray-200)] bg-white placeholder:text-[var(--gray-400)] focus:outline-none focus:border-[var(--primary-200)] w-64" />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--gray-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--gray-150)] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-[var(--gray-dark)]">
              <TableHead className="text-white py-3">Code</TableHead>
              <TableHead className="text-white py-3">Name</TableHead>
              <TableHead className="text-white py-3">Level</TableHead>
              <TableHead className="text-white py-3">Department</TableHead>
              <TableHead className="text-white py-3">Lecturers</TableHead>
              <TableHead className="text-white py-3 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <tr><td colSpan={6} className="py-12 text-center text-sm text-[var(--gray-400)]">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-sm text-[var(--gray-400)]">No courses found.</td></tr>
            ) : filtered.map((c, i) => (
              <tr key={c.id} className={`border-b border-[var(--gray-100)] ${i % 2 === 0 ? 'bg-[var(--gray-50)]' : 'bg-white'}`}>
                <TableCell className="font-bold text-[var(--primary-400)]">{c.code}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell><span className="bg-[var(--primary-200)]/20 text-[var(--primary-400)] px-2 py-0.5 rounded-full text-xs font-semibold">{c.level}</span></TableCell>
                <TableCell>{c.department.name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {c.lecturers.map(({ lecturer }) => (
                      <span key={lecturer.id} className="inline-flex items-center gap-1 bg-[var(--gray-100)] text-[var(--gray-700)] text-[10px] px-2 py-0.5 rounded-full">
                        {lecturer.firstName} {lecturer.lastName}
                        <button onClick={() => handleUnassign(c.id, lecturer.id)} className="hover:text-red-500 transition-colors">
                          <UserMinus className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <button onClick={() => { setAssigning(c); setNewLecId(''); }}
                      className="inline-flex items-center gap-1 text-[10px] text-[var(--primary-400)] hover:underline">
                      <UserPlus className="w-3 h-3" /> Assign
                    </button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-[var(--gray-100)]"><Pencil className="w-3.5 h-3.5 text-[var(--gray-500)]" /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                  </div>
                </TableCell>
              </tr>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ── Create/Edit Form ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--gray-150)]">
              <h3 className="text-lg font-bold text-[var(--gray-dark)]">{editing ? 'Edit Course' : 'Add Course'}</h3>
              <button onClick={closeForm} className="w-7 h-7 rounded-full hover:bg-[var(--gray-100)] flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 space-y-3">
              {[
                { label: 'Course Code', key: 'code',    type: 'text', required: true },
                { label: 'Course Name', key: 'name',    type: 'text', required: true },
                { label: 'Credits',     key: 'credits', type: 'number', required: false },
              ].map(({ label, key, type, required }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-[var(--gray-700)] block mb-1">{label}</label>
                  <input type={type} required={required} value={form[key as keyof FormState] as string}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)]" />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-[var(--gray-700)] block mb-1">Department *</label>
                <select required value={form.departmentId} onChange={e => setForm(p => ({ ...p, departmentId: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)]">
                  <option value="">Select department…</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--gray-700)] block mb-1">Level *</label>
                <select required value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value as Level }))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)]">
                  <option value="">Select level…</option>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isShared} onChange={e => setForm(p => ({ ...p, isShared: e.target.checked }))} className="w-4 h-4 rounded" />
                <span className="text-xs text-[var(--gray-700)]">Shared course (used across departments)</span>
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeForm}
                  className="px-4 py-2 rounded-full border border-[var(--gray-200)] text-sm text-[var(--gray-700)] hover:bg-[var(--gray-100)]">Cancel</button>
                <Button type="submit" disabled={saving}>{saving ? 'Saving…' : (editing ? 'Update' : 'Create')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Assign Lecturer Modal ── */}
      {assigning && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--gray-150)]">
              <h3 className="text-base font-bold text-[var(--gray-dark)]">Assign Lecturer to {assigning.code}</h3>
              <button onClick={() => setAssigning(null)} className="w-7 h-7 rounded-full hover:bg-[var(--gray-100)] flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <select value={newLecId} onChange={e => setNewLecId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)]">
                <option value="">Select lecturer…</option>
                {lecturers
                  .filter(l => !assigning.lecturers.some(al => al.lecturer.id === l.id))
                  .map(l => <option key={l.id} value={l.id}>{l.firstName} {l.lastName} ({l.staffId})</option>)}
              </select>
              <div className="flex justify-end gap-3">
                <button onClick={() => setAssigning(null)}
                  className="px-4 py-2 rounded-full border border-[var(--gray-200)] text-sm text-[var(--gray-700)] hover:bg-[var(--gray-100)]">Cancel</button>
                <Button onClick={handleAssign} disabled={!newLecId}>Assign</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
