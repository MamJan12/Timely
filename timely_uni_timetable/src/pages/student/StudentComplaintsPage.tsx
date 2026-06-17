import { useState, useEffect, useContext } from 'react';
import { CheckCircle, AlertCircle, Plus, X } from 'lucide-react';
import { api } from '../../lib/api';
import type { Complaint } from '../../lib/types';
import { AppContext } from '../../context/AppContext';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/dateFormatter';

const StudentComplaintsPage = () => {
  const { user } = useContext(AppContext);
  const [complaints,  setComplaints]  = useState<Complaint[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [description, setDescription] = useState('');
  const [submitting,  setSubmitting]  = useState(false);

  useEffect(() => {
    api.get<Complaint[]>('/complaints/my')
      .then(setComplaints)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) { toast.error('Please describe the issue'); return; }
    setSubmitting(true);
    try {
      const newC = await api.post<Complaint>('/complaints', {
        description: description.trim(),
        level: user?.student?.level,
      });
      setComplaints(prev => [newC, ...prev]);
      setDescription(''); setShowForm(false);
      toast.success('Complaint submitted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit');
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--gray-dark)]">Complaints</h1>
          <p className="text-xs text-[var(--gray-400)] mt-1">Submit and track your timetable issues</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Complaint
        </Button>
      </div>
      <div className="h-px w-full bg-[var(--gray-200)] mb-6" />

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--gray-150)]">
              <h3 className="text-lg font-bold text-[var(--gray-dark)]">Submit Complaint</h3>
              <button onClick={() => setShowForm(false)} className="w-7 h-7 rounded-full hover:bg-[var(--gray-100)] flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-[var(--gray-700)] block mb-1">Description *</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                  placeholder="Describe your timetable issue clearly…"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)] resize-none" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-full border border-[var(--gray-200)] text-sm text-[var(--gray-700)] hover:bg-[var(--gray-100)]">
                  Cancel
                </button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl border h-20 animate-pulse" />)}
        </div>
      ) : complaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-400 mb-3" />
          <p className="text-[var(--gray-500)] text-sm">No complaints submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-[var(--gray-150)] p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm text-[var(--gray-700)] leading-relaxed">{c.description}</p>
                  <p className="text-[10px] text-[var(--gray-400)] mt-2">{formatDate(c.createdAt)}</p>
                </div>
                {c.status === 'RESOLVED' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full shrink-0">
                    <CheckCircle className="w-3 h-3" /> Resolved
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-orange-500 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full shrink-0">
                    <AlertCircle className="w-3 h-3" /> Pending
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentComplaintsPage;
