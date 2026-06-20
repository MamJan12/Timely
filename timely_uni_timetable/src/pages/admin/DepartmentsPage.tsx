import { useState, useEffect } from 'react';
import { MoreHorizontal, X, Pencil, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import type { Department, School, ProgramType } from '../../lib/types';
import Button from '../../components/ui/Button';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '../../components/ui/Table';
import DeleteConfirmModal from '../../components/ui/DeleteConfirmModal';
import SchoolFilter from '../../components/ui/SchoolFilter';
import FAB from '../../components/ui/FAB';
import toast from 'react-hot-toast';

interface FormState {
  name: string;
  code: string;
  schoolId: string;
  programType: ProgramType;
}
const EMPTY: FormState = { name: '', code: '', schoolId: '', programType: 'UNDERGRADUATE' };

const DepartmentsPage = () => {
  const [departments,  setDepartments]  = useState<Department[]>([]);
  const [schools,      setSchools]      = useState<School[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [editing,      setEditing]      = useState<Department | null>(null);
  const [form,         setForm]         = useState<FormState>(EMPTY);
  const [saving,       setSaving]       = useState(false);
  const [search,       setSearch]       = useState('');
  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [openMenuId,   setOpenMenuId]   = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  const load = async () => {
    const [d, s] = await Promise.all([
      api.get<Department[]>('/departments'),
      api.get<School[]>('/schools'),
    ]);
    setDepartments(d ?? []);
    setSchools(s ?? []);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-menu-container]')) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (d: Department) => {
    setEditing(d);
    setForm({
      name: d.name,
      code: d.code,
      schoolId: d.schoolId ?? '',
      programType: d.programType,
    });
    setOpenMenuId(null);
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY); };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.schoolId) { toast.error('Please select a school'); return; }
    setSaving(true);
    try {
      if (editing) {
        const updated = await api.patch<Department>(`/departments/${editing.id}`, form);
        setDepartments(prev => prev.map(d => d.id === updated.id ? updated : d));
        toast.success('Department updated');
      } else {
        const created = await api.post<Department>('/departments', form);
        setDepartments(prev => [created, ...prev]);
        toast.success('Department created');
      }
      closeForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/departments/${deleteTarget.id}`);
      setDepartments(prev => prev.filter(d => d.id !== deleteTarget.id));
      toast.success('Department deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const filtered = departments.filter(d => {
    const matchesSchool  = schoolFilter === null || d.schoolId === schoolFilter;
    const q = search.toLowerCase();
    const matchesSearch  = !search || d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q);
    return matchesSchool && matchesSearch;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--gray-dark)]">Departments</h1>
          <p className="text-xs text-[var(--gray-400)] mt-1">
            {departments.length} department{departments.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      <div className="h-px w-full bg-[var(--gray-200)] mb-5" />

      {/* School filter + search */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <SchoolFilter schools={schools} value={schoolFilter} onChange={setSchoolFilter} />
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or code…"
            className="pl-9 pr-4 py-2 text-sm rounded-full border border-[var(--gray-200)] bg-white placeholder:text-[var(--gray-400)] focus:outline-none focus:border-[var(--primary-200)] w-56"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--gray-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--gray-150)] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-[var(--gray-dark)]">
              <TableHead className="text-white py-3">Department</TableHead>
              <TableHead className="text-white py-3">Code</TableHead>
              <TableHead className="text-white py-3">School</TableHead>
              <TableHead className="text-white py-3">Program</TableHead>
              <TableHead className="text-white py-3 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <tr><td colSpan={5} className="py-12 text-center text-sm text-[var(--gray-400)]">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-sm text-[var(--gray-400)]">No departments found.</td></tr>
            ) : filtered.map((d, i) => (
              <tr key={d.id} className={`border-b border-[var(--gray-100)] ${i % 2 === 0 ? 'bg-[var(--gray-50)]' : 'bg-white'}`}>
                <TableCell className="font-medium text-[var(--gray-dark)]">{d.name}</TableCell>
                <TableCell className="font-bold text-[var(--primary-400)]">{d.code}</TableCell>
                <TableCell>
                  {d.school ? (
                    <span className="bg-[var(--gray-100)] text-[var(--gray-700)] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {d.school.abbreviation}
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--gray-400)] italic">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    d.programType === 'POSTGRADUATE'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {d.programType === 'POSTGRADUATE' ? 'PG' : 'UG'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <div className="relative" data-menu-container>
                      <button
                        onClick={() => setOpenMenuId(prev => prev === d.id ? null : d.id)}
                        className="px-3 py-1.5 text-xs font-semibold border border-[var(--gray-200)] rounded-lg hover:bg-[var(--gray-100)] text-[var(--gray-700)] flex items-center gap-1 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {openMenuId === d.id && (
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-[var(--gray-150)] z-20 py-1 overflow-hidden">
                          <button
                            onClick={() => openEdit(d)}
                            className="w-full text-left px-4 py-2 text-sm text-[var(--gray-700)] hover:bg-[var(--gray-50)] flex items-center gap-2"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => { setDeleteTarget(d); setOpenMenuId(null); }}
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

      {/* FAB */}
      <FAB onClick={openCreate} title="Add Department" />

      {/* ── Create / Edit Modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--gray-150)]">
              <h3 className="text-lg font-bold text-[var(--gray-dark)]">
                {editing ? 'Edit Department' : 'Add Department'}
              </h3>
              <button onClick={closeForm} className="w-7 h-7 rounded-full hover:bg-[var(--gray-100)] flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              {/* School */}
              <div>
                <label className="text-xs font-medium text-[var(--gray-700)] block mb-1">School *</label>
                <select
                  required
                  value={form.schoolId}
                  onChange={e => setForm(p => ({ ...p, schoolId: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)]"
                >
                  <option value="">Select school…</option>
                  {schools.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.abbreviation})</option>
                  ))}
                </select>
              </div>

              {/* Department name */}
              <div>
                <label className="text-xs font-medium text-[var(--gray-700)] block mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Computer Science"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)]"
                />
              </div>

              {/* Department code */}
              <div>
                <label className="text-xs font-medium text-[var(--gray-700)] block mb-1">Department Code *</label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
                  placeholder="e.g. CS"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)]"
                />
              </div>

              {/* Program type */}
              <div>
                <label className="text-xs font-medium text-[var(--gray-700)] block mb-2">Program Type *</label>
                <div className="flex gap-3">
                  {(['UNDERGRADUATE', 'POSTGRADUATE'] as const).map(pt => (
                    <label
                      key={pt}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                        form.programType === pt
                          ? 'bg-[var(--gray-dark)] text-white border-[var(--gray-dark)]'
                          : 'bg-white text-[var(--gray-700)] border-[var(--gray-200)] hover:border-[var(--primary-200)]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="programType"
                        value={pt}
                        checked={form.programType === pt}
                        onChange={() => setForm(p => ({ ...p, programType: pt }))}
                        className="sr-only"
                      />
                      {pt === 'UNDERGRADUATE' ? 'Undergraduate' : 'Postgraduate'}
                    </label>
                  ))}
                </div>
              </div>

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

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        itemName={deleteTarget ? `${deleteTarget.name} (${deleteTarget.code})` : ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default DepartmentsPage;
