import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { SystemSettings, Semester } from '../../lib/types';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [form,     setForm]     = useState({
    academicYear:      '',
    currentSemester:   '' as Semester | '',
    semesterStartDate: '',
    semesterEndDate:   '',
    slotStartTime:     '',
    slotEndTime:       '',
  });

  useEffect(() => {
    api.get<SystemSettings>('/settings')
      .then(s => {
        setSettings(s);
        setForm({
          academicYear:      s.academicYear,
          currentSemester:   s.currentSemester,
          semesterStartDate: s.semesterStartDate ? s.semesterStartDate.split('T')[0] : '',
          semesterEndDate:   s.semesterEndDate   ? s.semesterEndDate.split('T')[0]   : '',
          slotStartTime:     s.slotStartTime,
          slotEndTime:       s.slotEndTime,
        });
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.patch<SystemSettings>('/settings', {
        ...form,
        semesterStartDate: form.semesterStartDate ? new Date(form.semesterStartDate).toISOString() : undefined,
        semesterEndDate:   form.semesterEndDate   ? new Date(form.semesterEndDate).toISOString()   : undefined,
      });
      setSettings(updated);
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally { setSaving(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-[var(--primary-200)] border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--gray-dark)]">Settings</h1>
        <p className="text-xs text-[var(--gray-400)] mt-1">Academic year, semester, and time slot configuration</p>
      </div>
      <div className="h-px w-full bg-[var(--gray-200)] mb-6" />

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[var(--gray-150)] p-6 space-y-5">

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--gray-700)] block mb-1">Academic Year</label>
            <input type="text" value={form.academicYear} onChange={e => setForm(p => ({ ...p, academicYear: e.target.value }))}
              placeholder="e.g. 2024/2025"
              className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)]" />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--gray-700)] block mb-1">Current Semester</label>
            <select value={form.currentSemester} onChange={e => setForm(p => ({ ...p, currentSemester: e.target.value as Semester }))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)]">
              <option value="FIRST">First Semester</option>
              <option value="SECOND">Second Semester</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--gray-700)] block mb-1">Semester Start Date</label>
            <input type="date" value={form.semesterStartDate} onChange={e => setForm(p => ({ ...p, semesterStartDate: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)]" />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--gray-700)] block mb-1">Semester End Date</label>
            <input type="date" value={form.semesterEndDate} onChange={e => setForm(p => ({ ...p, semesterEndDate: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--gray-700)] block mb-1">Slot Start Time</label>
            <input type="time" value={form.slotStartTime} onChange={e => setForm(p => ({ ...p, slotStartTime: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)]" />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--gray-700)] block mb-1">Slot End Time</label>
            <input type="time" value={form.slotEndTime} onChange={e => setForm(p => ({ ...p, slotEndTime: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)]" />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Settings'}</Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
