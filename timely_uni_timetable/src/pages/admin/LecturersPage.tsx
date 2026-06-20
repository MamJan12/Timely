import { useState, useEffect } from 'react';
import { Pencil, Trash2, X } from 'lucide-react';
import { api } from '../../lib/api';
import type { Lecturer, Department } from '../../lib/types';
import Button from '../../components/ui/Button';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '../../components/ui/Table';
import DeleteConfirmModal from '../../components/ui/DeleteConfirmModal';
import FAB from '../../components/ui/FAB';
import DepartmentFilter from '../../components/ui/DepartmentFilter';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/dateFormatter';

interface FormState { email: string; password: string; firstName: string; lastName: string; staffId: string; departmentId: string }
const EMPTY: FormState = { email: '', password: '', firstName: '', lastName: '', staffId: '', departmentId: '' };

const LecturersPage = () => {
  const [lecturers,   setLecturers]   = useState<Lecturer[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [editing,     setEditing]     = useState<Lecturer | null>(null);
  const [form,        setForm]        = useState<FormState>(EMPTY);
  const [saving,       setSaving]       = useState(false);
  const [search,       setSearch]       = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Lecturer | null>(null);
  const [deptFilter,   setDeptFilter]   = useState<string | null>(null);

  const load = async () => {
    const [l, d] = await Promise.all([
      api.get<Lecturer[]>('/lecturers'),
      api.get<Department[]>('/departments'),
    ]);
    setLecturers(l); setDepartments(d);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit   = (l: Lecturer) => {
    setEditing(l);
    setForm({ email: l.user.email, password: '', firstName: l.firstName, lastName: l.lastName, staffId: l.staffId, departmentId: l.departmentId ?? '' });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY); };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const updated = await api.patch<Lecturer>(`/lecturers/${editing.id}`, {
          ...form, password: form.password || undefined,
        });
        setLecturers(prev => prev.map(l => l.id === updated.id ? updated : l));
        toast.success('Lecturer updated');
      } else {
        const created = await api.post<Lecturer>('/lecturers', form);
        setLecturers(prev => [created, ...prev]);
        toast.success('Lecturer created');
      }
      closeForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/lecturers/${deleteTarget.id}`);
      setLecturers(prev => prev.filter(l => l.id !== deleteTarget.id));
      toast.success('Lecturer deleted');
      setDeleteTarget(null);
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to delete'); }
  };

  const filtered = lecturers.filter(l => {
    const matchesDept = deptFilter === null || l.departmentId === deptFilter;
    const q = search.toLowerCase();
    const matchesSearch = !search || `${l.firstName} ${l.lastName}`.toLowerCase().includes(q) || l.staffId.toLowerCase().includes(q);
    return matchesDept && matchesSearch;
  });

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--gray-dark)]">Lecturers</h1>
        <p className="text-xs text-[var(--gray-400)] mt-1">{lecturers.length} lecturer{lecturers.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="h-px w-full bg-[var(--gray-200)] mb-5" />

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <DepartmentFilter departments={departments} value={deptFilter} onChange={setDeptFilter} />
        <div className="relative">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or staff ID…"
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
              <TableHead className="text-white py-3">Name</TableHead>
              <TableHead className="text-white py-3">Staff ID</TableHead>
              <TableHead className="text-white py-3">Email</TableHead>
              <TableHead className="text-white py-3">Department</TableHead>
              <TableHead className="text-white py-3">Joined</TableHead>
              <TableHead className="text-white py-3 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <tr><td colSpan={6} className="py-12 text-center text-sm text-[var(--gray-400)]">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-sm text-[var(--gray-400)]">No lecturers found.</td></tr>
            ) : filtered.map((l, i) => (
              <tr key={l.id} className={`border-b border-[var(--gray-100)] ${i % 2 === 0 ? 'bg-[var(--gray-50)]' : 'bg-white'}`}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary-200)] flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-[var(--gray-dark)]">{l.firstName.charAt(0)}</span>
                    </div>
                    <span className="font-medium text-[var(--gray-dark)]">{l.firstName} {l.lastName}</span>
                  </div>
                </TableCell>
                <TableCell>{l.staffId}</TableCell>
                <TableCell className="text-[var(--gray-500)]">{l.user.email}</TableCell>
                <TableCell>{l.department?.name ?? '—'}</TableCell>
                <TableCell className="text-[var(--gray-500)]">{formatDate(l.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => openEdit(l)} className="p-1.5 rounded-lg hover:bg-[var(--gray-100)]"><Pencil className="w-3.5 h-3.5 text-[var(--gray-500)]" /></button>
                    <button onClick={() => setDeleteTarget(l)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                  </div>
                </TableCell>
              </tr>
            ))}
          </TableBody>
        </Table>
      </div>

      <FAB onClick={openCreate} title="Add Lecturer" />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        itemName={deleteTarget ? `${deleteTarget.firstName} ${deleteTarget.lastName}` : ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--gray-150)]">
              <h3 className="text-lg font-bold text-[var(--gray-dark)]">{editing ? 'Edit Lecturer' : 'Add Lecturer'}</h3>
              <button onClick={closeForm} className="w-7 h-7 rounded-full hover:bg-[var(--gray-100)] flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 space-y-3">
              {[
                { label: 'First Name', key: 'firstName', type: 'text', required: true },
                { label: 'Last Name',  key: 'lastName',  type: 'text', required: true },
                { label: 'Staff ID',   key: 'staffId',   type: 'text', required: !editing },
                { label: 'Email',      key: 'email',     type: 'email', required: !editing },
                { label: `Password${editing ? ' (leave blank to keep)' : ''}`, key: 'password', type: 'password', required: !editing },
              ].map(({ label, key, type, required }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-[var(--gray-700)] block mb-1">{label}</label>
                  <input type={type} required={required} value={form[key as keyof FormState]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)]" />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-[var(--gray-700)] block mb-1">Department</label>
                <select value={form.departmentId} onChange={e => setForm(p => ({ ...p, departmentId: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)]">
                  <option value="">No department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeForm}
                  className="px-4 py-2 rounded-full border border-[var(--gray-200)] text-sm text-[var(--gray-700)] hover:bg-[var(--gray-100)]">
                  Cancel
                </button>
                <Button type="submit" disabled={saving}>{saving ? 'Saving…' : (editing ? 'Update' : 'Create')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturersPage;
