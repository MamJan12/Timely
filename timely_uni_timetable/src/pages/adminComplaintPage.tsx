import { useState, useMemo, useEffect } from 'react';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { CheckCircle, AlertCircle, X, BookOpen, Users, MessageSquareWarning, ChevronDown, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import type { Complaint } from '../lib/types';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/dateFormatter';

type Tab     = 'Lecturers' | 'Students';
type SortKey = 'name-az' | 'name-za' | 'oldest' | 'newest' | null;

const sortOptions: { label: string; value: SortKey }[] = [
  { label: 'A → Z',        value: 'name-az' },
  { label: 'Z → A',        value: 'name-za' },
  { label: 'Oldest first', value: 'oldest'  },
  { label: 'Newest first', value: 'newest'  },
];

const getName = (c: Complaint) =>
  c.lecturer ? `${c.lecturer.firstName} ${c.lecturer.lastName}`
  : c.student  ? `${c.student.firstName}  ${c.student.lastName}`
  : c.submitterRole;

const AdminComplaintPage = () => {
  const [activeTab,  setActiveTab]  = useState<Tab>('Lecturers');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState<Complaint | null>(null);
  const [search,     setSearch]     = useState('');
  const [sortKey,    setSortKey]    = useState<SortKey>(null);
  const [showSort,   setShowSort]   = useState(false);
  const [resolving,  setResolving]  = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get<Complaint[]>('/complaints');
      setComplaints(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const tabData = complaints.filter(c =>
    activeTab === 'Lecturers' ? c.submitterRole === 'LECTURER' : c.submitterRole === 'STUDENT'
  );

  const searched = tabData.filter(c => {
    const name = getName(c).toLowerCase();
    const code = c.course?.code?.toLowerCase() ?? '';
    const q    = search.toLowerCase();
    return name.includes(q) || code.includes(q);
  });

  const sorted = useMemo(() => {
    const compare = (a: Complaint, b: Complaint) => {
      if (sortKey === 'name-az') return getName(a).localeCompare(getName(b));
      if (sortKey === 'name-za') return getName(b).localeCompare(getName(a));
      if (sortKey === 'newest')  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    };
    const pending  = searched.filter(c => c.status === 'PENDING').sort(compare);
    const resolved = searched.filter(c => c.status === 'RESOLVED').sort(compare);
    return [...pending, ...resolved];
  }, [searched, sortKey]);

  const handleResolve = async (id: string) => {
    setResolving(true);
    try {
      await api.patch(`/complaints/${id}/resolve`, {});
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'RESOLVED' } : c));
      setSelected(prev => prev?.id === id ? { ...prev, status: 'RESOLVED' } : prev);
      toast.success('Complaint resolved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to resolve');
    } finally {
      setResolving(false);
    }
  };

  const currentSortLabel = sortKey ? (sortOptions.find(o => o.value === sortKey)?.label ?? 'Filter') : 'Filter';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-2xl text-[var(--gray-dark)]">Complaints</h4>
        <button onClick={load} className="p-2 rounded-xl hover:bg-[var(--gray-100)] transition-colors" title="Refresh">
          <RefreshCw className="w-4 h-4 text-[var(--gray-500)]" />
        </button>
      </div>
      <div className="h-px w-full bg-[var(--gray-200)] mb-6" />

      {/* ── Tabs ── */}
      <div className="flex gap-0 mb-6">
        {(['Lecturers', 'Students'] as Tab[]).map((tab, i) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSearch(''); setSelected(null); }}
            className={`px-8 py-2.5 text-sm font-medium border transition-all duration-150 ${i === 0 ? 'rounded-l-lg' : 'rounded-r-lg'} ${
              activeTab === tab
                ? 'bg-[var(--primary-200)] text-[var(--gray-dark)] border-[var(--primary-200)]'
                : 'bg-white text-[var(--gray-600)] border-[var(--gray-200)] hover:text-[var(--gray-dark)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
        <p className="text-base font-semibold text-[var(--gray-dark)]">All {activeTab}</p>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or course..."
              className="pl-9 pr-4 py-2 text-sm rounded-full border border-[var(--gray-200)] bg-white placeholder:text-[var(--gray-400)] focus:outline-none focus:border-[var(--primary-200)] w-56 sm:w-72"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--gray-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowSort(p => !p)}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-[var(--gray-200)] bg-white rounded-full hover:border-[var(--primary-200)] transition-colors text-[var(--gray-400)]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h4" />
              </svg>
              <span className={sortKey ? 'text-[var(--gray-700)] font-medium' : ''}>{currentSortLabel}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showSort && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
                <div className="absolute right-0 mt-1 w-44 bg-white border border-[var(--gray-150)] rounded-xl shadow-lg z-20 overflow-hidden">
                  {sortOptions.map(opt => (
                    <button key={opt.value} onClick={() => { setSortKey(opt.value); setShowSort(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sortKey === opt.value ? 'bg-[var(--primary-200)] text-[var(--gray-dark)] font-medium' : 'text-[var(--gray-700)] hover:bg-[var(--gray-50)]'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto rounded-xl border border-[var(--gray-150)] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-[var(--gray-dark)]">
              <TableHead className="text-white py-3 text-center w-12">S/N</TableHead>
              <TableHead className="text-white py-3">Name</TableHead>
              <TableHead className="text-white py-3 text-center">Course</TableHead>
              <TableHead className="text-white py-3 text-center">Level</TableHead>
              <TableHead className="text-white py-3 text-center">Status</TableHead>
              <TableHead className="text-white py-3 text-center">Submitted</TableHead>
              <TableHead className="text-white py-3 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <tr><td colSpan={7} className="py-12 text-center text-sm text-[var(--gray-400)]">Loading…</td></tr>
            ) : sorted.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-sm text-[var(--gray-400)]">No complaints found.</td></tr>
            ) : sorted.map((c, index) => {
              const name = getName(c);
              return (
                <tr key={c.id} onClick={() => setSelected(c)}
                  className={`cursor-pointer transition-colors border-b border-[var(--gray-100)] ${index % 2 === 0 ? 'bg-[var(--gray-50)]' : 'bg-white'} hover:bg-[var(--primary-200)]/10`}>
                  <td className="px-4 py-3 text-center font-semibold text-[var(--gray-dark)]">{index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--gray-200)] flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-[var(--gray-600)]">{name.charAt(0)}</span>
                      </div>
                      <p className="text-sm font-semibold text-[var(--gray-dark)]">{name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-[var(--gray-dark)]">{c.course?.code ?? '—'}</td>
                  <td className="px-4 py-3 text-center text-[var(--gray-dark)]">{c.level ?? '—'}</td>
                  <td className="px-4 py-3 text-center">
                    {c.status === 'RESOLVED' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Resolved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-orange-500 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full">
                        <AlertCircle className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-[var(--gray-500)]">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={e => { e.stopPropagation(); setSelected(c); }}
                      className="text-[var(--gray-400)] hover:text-[var(--gray-dark)] font-bold tracking-widest px-2 text-base">
                      •••
                    </button>
                  </td>
                </tr>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* ── Detail Modal ── */}
      {selected && (
        <Modal>
          <div className="w-full max-w-lg mx-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--primary-200)] flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-[var(--gray-dark)]">{getName(selected).charAt(0)}</span>
                </div>
                <div>
                  <p className="text-base font-bold text-[var(--gray-dark)]">{getName(selected)}</p>
                  <p className="text-xs text-[var(--gray-400)]">{selected.submitterRole}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[var(--gray-100)]">
                <X className="w-4 h-4 text-[var(--gray-600)]" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-[var(--gray-50)] border border-[var(--gray-150)] rounded-xl px-3 py-3">
                <div className="flex items-center gap-1.5 text-[var(--gray-500)] mb-1">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase tracking-wide font-medium">Level</span>
                </div>
                <p className="text-sm font-semibold text-[var(--gray-dark)]">{selected.level ?? '—'}</p>
              </div>
              <div className="bg-[var(--gray-50)] border border-[var(--gray-150)] rounded-xl px-3 py-3">
                <div className="flex items-center gap-1.5 text-[var(--gray-500)] mb-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase tracking-wide font-medium">Code</span>
                </div>
                <p className="text-sm font-semibold text-[var(--gray-dark)]">{selected.course?.code ?? '—'}</p>
              </div>
              <div className="bg-[var(--gray-50)] border border-[var(--gray-150)] rounded-xl px-3 py-3">
                <div className="flex items-center gap-1.5 text-[var(--gray-500)] mb-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase tracking-wide font-medium">Course</span>
                </div>
                <p className="text-sm font-semibold text-[var(--gray-dark)] truncate">{selected.course?.name ?? '—'}</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquareWarning className="w-4 h-4 text-[var(--primary-400)]" />
                <p className="text-xs font-semibold text-[var(--gray-dark)] uppercase tracking-wide">Complaint</p>
              </div>
              <p className="text-sm text-[var(--gray-700)] leading-relaxed bg-[var(--gray-50)] border border-[var(--gray-150)] rounded-xl px-4 py-3">
                {selected.description}
              </p>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs text-[var(--gray-500)]">Status:</span>
              {selected.status === 'RESOLVED' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
                  <CheckCircle className="w-3 h-3" /> Resolved
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-orange-500 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full">
                  <AlertCircle className="w-3 h-3" /> Pending
                </span>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setSelected(null)}
                className="text-sm px-4 py-2 rounded-full border border-[var(--gray-200)] text-[var(--gray-700)] hover:bg-[var(--gray-100)] transition-colors">
                Cancel
              </button>
              {selected.status === 'PENDING' && (
                <Button variant="success" onClick={() => handleResolve(selected.id)} disabled={resolving}
                  className="text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {resolving ? 'Resolving…' : 'Confirm as Resolved'}
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminComplaintPage;
