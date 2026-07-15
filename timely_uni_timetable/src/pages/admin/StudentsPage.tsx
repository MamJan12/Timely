import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import RowActions from '../../components/ui/RowActions';
import { api } from '../../lib/api';
import type { Student, Department, Level } from '../../lib/types';
import Button from '../../components/ui/Button';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '../../components/ui/Table';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/dateFormatter';

const LEVELS: Level[] = ['L100', 'L200', 'L300', 'L400', 'L500'];

interface FormState { email: string; password: string; firstName: string; lastName: string; studentId: string; departmentId: string; level: Level | '' }
const EMPTY: FormState = { email: '', password: '', firstName: '', lastName: '', studentId: '', departmentId: '', level: '' };

const StudentsPage = () => {
  const [students,    setStudents]    = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [editing,     setEditing]     = useState<Student | null>(null);
  const [form,        setForm]        = useState<FormState>(EMPTY);
  const [saving,      setSaving]      = useState(false);
  const [search,      setSearch]      = useState('');
  const [filterLevel, setFilterLevel] = useState<Level | ''>('');

  const load = async () => {
    const [s, d] = await Promise.all([
      api.get<Student[]>('/students'),
      api.get<Department[]>('/departments'),
    ]);
    setStudents(s); setDepartments(d);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit   = (s: Student) => {
    setEditing(s);
    setForm({ email: s.user.email, password: '', firstName: s.firstName, lastName: s.lastName, studentId: s.studentId, departmentId: s.department.id, level: s.level });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.level) { toast.error('Please select a level'); return; }
    setSaving(true);
    try {
      if (editing) {
        const updated = await api.patch<Student>(`/students/${editing.id}`, { ...form, password: form.password || undefined });
        setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
        toast.success('Student updated');
      } else {
        const created = await api.post<Student>('/students', form);
        setStudents(prev => [created, ...prev]);
        toast.success('Student created');
      }
      closeForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      setStudents(prev => prev.filter(s => s.id !== id));
      toast.success('Student deleted');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const matchQ = !search || `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q);
    const matchL = !filterLevel || s.level === filterLevel;
    return matchQ && matchL;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--gray-dark)]">Students</h1>
          <p className="text-xs text-[var(--gray-400)] mt-1">{students.length} student{students.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-2"><Plus className="w-4 h-4" /> Add Student</Button>
      </div>
      <div className="h-px w-full bg-[var(--gray-200)] mb-5" />

      <div className="flex items-center gap-3 justify-end mb-4">
        <select value={filterLevel} onChange={e => setFilterLevel(e.target.value as Level | '')}
          className="px-3 py-2 text-sm rounded-full border border-[var(--gray-200)] bg-white focus:outline-none focus:border-[var(--primary-200)]">
          <option value="">All Levels</option>
          {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <div className="relative">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search students…"
            className="pl-9 pr-4 py-2 text-sm rounded-full border border-[var(--gray-200)] bg-white placeholder:text-[var(--gray-400)] focus:outline-none focus:border-[var(--primary-200)] w-56" />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--gray-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--gray-150)] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-[var(--gray-dark)]">
              <TableHead className="text-white py-3">Name</TableHead>
              <TableHead className="text-white py-3">Student ID</TableHead>
              <TableHead className="text-white py-3">Level</TableHead>
              <TableHead className="text-white py-3">Department</TableHead>
              <TableHead className="text-white py-3">Joined</TableHead>
              <TableHead className="text-white py-3 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <tr><td colSpan={6} className="py-12 text-center text-sm text-[var(--gray-400)]">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-sm text-[var(--gray-400)]">No students found.</td></tr>
            ) : filtered.map((s, i) => (
              <tr key={s.id} className={`border-b border-[var(--gray-100)] ${i % 2 === 0 ? 'bg-[var(--gray-50)]' : 'bg-white'}`}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-emerald-700">{s.firstName.charAt(0)}</span>
                    </div>
                    <span className="font-medium text-[var(--gray-dark)]">{s.firstName} {s.lastName}</span>
                  </div>
                </TableCell>
                <TableCell>{s.studentId}</TableCell>
                <TableCell><span className="bg-[var(--primary-200)]/20 text-[var(--primary-400)] px-2 py-0.5 rounded-full text-xs font-semibold">{s.level}</span></TableCell>
                <TableCell>{s.department.name}</TableCell>
                <TableCell className="text-[var(--gray-500)]">{formatDate(s.createdAt)}</TableCell>
                <TableCell>
                  <RowActions onEdit={() => openEdit(s)} onDelete={() => handleDelete(s.id)} />
                </TableCell>
              </tr>
            ))}
          </TableBody>
        </Table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--gray-150)]">
              <h3 className="text-lg font-bold text-[var(--gray-dark)]">{editing ? 'Edit Student' : 'Add Student'}</h3>
              <button onClick={closeForm} className="w-7 h-7 rounded-full hover:bg-[var(--gray-100)] flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 space-y-3">
              {[
                { label: 'First Name', key: 'firstName', type: 'text', required: true },
                { label: 'Last Name',  key: 'lastName',  type: 'text', required: true },
                { label: 'Student ID', key: 'studentId', type: 'text', required: !editing },
                { label: 'Email',      key: 'email',     type: 'email', required: !editing },
                { label: `Password${editing ? ' (leave blank to keep)' : ''}`, key: 'password', type: 'password', required: !editing },
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
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeForm}
                  className="px-4 py-2 rounded-full border border-[var(--gray-200)] text-sm text-[var(--gray-700)] hover:bg-[var(--gray-100)]">Cancel</button>
                <Button type="submit" disabled={saving}>{saving ? 'Saving…' : (editing ? 'Update' : 'Create')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
