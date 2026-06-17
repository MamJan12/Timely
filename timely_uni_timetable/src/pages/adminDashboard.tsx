import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import Bubble from '../components/ui/Bubble';
import Button from '../components/ui/Button';
import { SlidersHorizontal, CheckCircle, X, Users, CalendarDays, BookOpen, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import type { DashboardStats, Complaint } from '../lib/types';
import { AppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

// ── Stat card ─────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: React.ElementType; color: string }) => (
  <div className="bg-white rounded-2xl border border-[var(--gray-150)] p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-2xl font-bold text-[var(--gray-dark)]">{value}</p>
      <p className="text-xs text-[var(--gray-500)]">{label}</p>
    </div>
  </div>
);

// ── Page ─────────────────────────────────────────────────────────────────────

const AdminDashboard: React.FC = () => {
  const { user } = useContext(AppContext);
  const navigate  = useNavigate();

  const [stats,     setStats]     = useState<DashboardStats | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading,   setLoading]   = useState(true);

  const displayName = user?.admin
    ? `${user.admin.firstName} ${user.admin.lastName}`
    : user?.email ?? 'Admin';

  useEffect(() => {
    const load = async () => {
      try {
        const [s, c] = await Promise.all([
          api.get<DashboardStats>('/dashboard/stats'),
          api.get<Complaint[]>('/complaints?status=PENDING'),
        ]);
        setStats(s);
        setComplaints(c.slice(0, 5));
      } catch {
        // stats fail silently — page still usable
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await api.patch(`/complaints/${id}/resolve`, {});
      setComplaints(prev => prev.filter(c => c.id !== id));
      toast.success('Complaint resolved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to resolve');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--gray-light)] px-3 sm:px-6 py-5 sm:py-8 font-sans">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6 sm:mb-8 gap-2">
        <div>
          <p className="text-xs text-[var(--gray-500)] uppercase tracking-widest font-medium mb-0.5">Admin</p>
          <h1 className="text-xl sm:text-3xl font-bold text-[var(--gray-dark)] leading-tight">
            Welcome, <span className="text-[var(--primary-400)]">{displayName}</span>
          </h1>
        </div>
        <Button onClick={() => navigate('/admin/schedule')} className="mt-1 shrink-0">
          <CalendarDays className="w-4 h-4" />
          <span className="hidden sm:inline">Manage Schedule</span>
        </Button>
      </div>

      {/* ── Stats ── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[var(--gray-150)] p-5 h-20 animate-pulse" />
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Lecturers"    value={stats.totalLecturers}       icon={Users}         color="bg-blue-100 text-blue-600" />
          <StatCard label="Total Students"     value={stats.totalStudents}        icon={Users}         color="bg-emerald-100 text-emerald-600" />
          <StatCard label="Published Schedules" value={stats.timetables?.PUBLISHED ?? 0} icon={CalendarDays}  color="bg-purple-100 text-purple-600" />
          <StatCard label="Pending Complaints" value={stats.pendingComplaints}    icon={AlertCircle}   color="bg-orange-100 text-orange-600" />
        </div>
      )}

      {/* ── Quick Links ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Schedule',   path: '/admin/schedule',   color: 'bg-[var(--primary-200)]' },
          { label: 'Lecturers',  path: '/admin/lecturers',  color: 'bg-blue-100' },
          { label: 'Students',   path: '/admin/students',   color: 'bg-emerald-100' },
          { label: 'Courses',    path: '/admin/courses',    color: 'bg-amber-100' },
        ].map(({ label, path, color }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`${color} rounded-2xl p-4 text-sm font-semibold text-[var(--gray-dark)] hover:opacity-80 transition-opacity text-left`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Recent Pending Complaints ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-semibold text-[var(--gray-dark)] tracking-tight">
            Pending Complaints
          </h2>
          <button
            onClick={() => navigate('/admin/complaints')}
            className="text-xs text-[var(--primary-400)] hover:underline"
          >
            View all
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 h-20 animate-pulse border border-[var(--gray-150)]" />
            ))}
          </div>
        ) : complaints.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[var(--gray-150)] p-8 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm text-[var(--gray-500)]">No pending complaints — all clear!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {complaints.map(fb => {
              const submitter = fb.lecturer ?? fb.student;
              const name = submitter ? `${submitter.firstName} ${submitter.lastName}` : fb.submitterRole;
              return (
                <div key={fb.id} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Bubble variant="feedback" className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--gray-150)] flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-[var(--gray-600)]">{name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--gray-dark)]">{name}</p>
                        <p className="text-[11px] text-[var(--gray-500)] mb-1">{fb.submitterRole} · {fb.level ?? ''}</p>
                        <p className="text-xs text-[var(--gray-700)] leading-snug">
                          <span className="font-medium text-[var(--gray-dark)]">Description: </span>
                          {fb.description}
                        </p>
                        <div className="flex justify-end mt-4">
                          <button
                            onClick={() => handleResolve(fb.id)}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-[var(--gray-150)] text-[var(--gray-700)] hover:bg-[var(--success)] hover:text-white transition-all duration-200"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Mark as Resolved
                          </button>
                        </div>
                      </div>
                    </div>
                  </Bubble>

                  {fb.course && (
                    <Bubble variant="feedback" className="sm:w-48 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--gray-100)] flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-[var(--primary-400)]" />
                      </div>
                      <div>
                        <p className="text-[11px] text-[var(--gray-500)] mb-0.5">Course</p>
                        <p className="text-sm font-semibold text-[var(--gray-dark)]">{fb.course.code}</p>
                        <p className="text-xs text-[var(--gray-500)]">{fb.course.name}</p>
                      </div>
                    </Bubble>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
