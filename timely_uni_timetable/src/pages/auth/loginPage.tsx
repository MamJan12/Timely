import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import type { StoredAuth } from '../../context/AppContext';
import type { AuthUser, AuthTokens, Role, Department, Level } from '../../lib/types';
import { CalendarDays, Eye, EyeOff, ChevronLeft, ShieldCheck, GraduationCap, BookOpen, Copy, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Label from '../../components/ui/Label';

type Screen = 'role-select' | 'login' | 'register' | 'staff-id-reveal';

const LEVELS: Level[] = ['L100', 'L200', 'L300', 'L400', 'L500'];

const ROLE_META = {
  ADMIN: {
    label: 'Admin',
    desc: 'Manage schedules, courses and staff',
    icon: ShieldCheck,
    iconBg: 'bg-[var(--primary-400)]',
    iconColor: 'text-white',
    badge: 'bg-[var(--primary-400)] text-white',
  },
  LECTURER: {
    label: 'Lecturer',
    desc: 'View your assigned classes and schedule',
    icon: BookOpen,
    iconBg: 'bg-[var(--primary-200)]',
    iconColor: 'text-[var(--gray-dark)]',
    badge: 'bg-[var(--primary-200)]/20 text-[var(--primary-400)]',
  },
  STUDENT: {
    label: 'Student',
    desc: 'Check your department timetable',
    icon: GraduationCap,
    iconBg: 'bg-[var(--gray-200)]',
    iconColor: 'text-[var(--gray-700)]',
    badge: 'bg-[var(--gray-100)] text-[var(--gray-700)]',
  },
} as const;

// Per-role identifier input config
const IDENTIFIER_META: Record<Role, { label: string; placeholder: string; inputType: string }> = {
  ADMIN:    { label: 'Email address',          placeholder: 'admin@timely.edu',              inputType: 'email' },
  LECTURER: { label: 'Email or Staff ID',       placeholder: 'you@school.edu or STF1234',     inputType: 'text'  },
  STUDENT:  { label: 'Email or Student ID',     placeholder: 'you@school.edu or SENG22SE019', inputType: 'text'  },
};

const LoginPage = () => {
  const { onAuth } = useContext(AppContext);
  const navigate   = useNavigate();

  const [phase,        setPhase]        = useState(0);
  const [screen,       setScreen]       = useState<Screen>('role-select');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Login fields
  const [identifier, setIdentifier] = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);

  // Register fields
  const [firstName,   setFirstName]   = useState('');
  const [lastName,    setLastName]    = useState('');
  const [studentId,   setStudentId]   = useState('');
  const [regEmail,    setRegEmail]    = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [level,       setLevel]       = useState<Level | ''>('');
  const [deptId,      setDeptId]      = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);

  // Lecturer claim-existing-profile
  const [lecSuggestions, setLecSuggestions] = useState<{ id: string; firstName: string; lastName: string; staffId: string }[]>([]);
  const [claimedLecId,   setClaimedLecId]   = useState('');
  const [claimedStaffId, setClaimedStaffId] = useState('');

  // Staff ID reveal
  const [generatedStaffId, setGeneratedStaffId] = useState('');
  const [pendingAuth,      setPendingAuth]      = useState<AuthTokens | null>(null);
  const [copied,           setCopied]           = useState(false);
  const [wasClaim,         setWasClaim]         = useState(false);

  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPhase(1), 1400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (screen === 'register' && selectedRole === 'STUDENT' && departments.length === 0) {
      fetch('/api/v1/departments')
        .then(r => r.json())
        .then(j => setDepartments((j.data ?? []).filter((d: Department) => d.code !== 'CS')))
        .catch(() => {});
    }
  }, [screen, selectedRole]);

  useEffect(() => {
    if (screen !== 'register' || selectedRole !== 'LECTURER' || claimedLecId) return;
    const fn = firstName.trim();
    const ln = lastName.trim();
    const query = ln.length >= fn.length ? ln : fn;
    if (query.length < 2) { setLecSuggestions([]); return; }
    const timer = setTimeout(() => {
      fetch(`/api/v1/auth/lecturers/search?name=${encodeURIComponent(query)}`)
        .then(r => r.json())
        .then(j => setLecSuggestions(j.data ?? []))
        .catch(() => {});
    }, 400);
    return () => clearTimeout(timer);
  }, [firstName, lastName, screen, selectedRole, claimedLecId]);

  const pickRole = (role: Role) => {
    setSelectedRole(role);
    setError('');
    setIdentifier('');
    setPassword('');
    setScreen('login');
  };

  const goBack = () => {
    setError('');
    setClaimedLecId('');
    setClaimedStaffId('');
    setLecSuggestions([]);
    if (screen === 'register') {
      setScreen('login');
    } else {
      setScreen('role-select');
      setSelectedRole(null);
    }
  };

  const finalizeAuth = async (tokens: AuthTokens) => {
    const profileRes  = await fetch('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });
    const profileJson = await profileRes.json();
    const user: AuthUser = profileJson.data;

    const auth: StoredAuth = {
      accessToken:  tokens.accessToken,
      refreshToken: tokens.refreshToken,
      role:         tokens.role,
      user,
    };
    onAuth(auth);

    const dest: Record<Role, string> = {
      ADMIN:    '/admin/dashboard',
      LECTURER: '/lecturer/dashboard',
      STUDENT:  '/student/dashboard',
    };
    navigate(dest[tokens.role], { replace: true });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your identifier and password.');
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.message ?? 'Invalid credentials'); return; }
      await finalizeAuth(json.data as AuthTokens);
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!firstName.trim() || !lastName.trim()) { setError('Please enter your full name.'); return; }
    setLoading(true);
    try {
      const isLecturer = selectedRole === 'LECTURER';
      const isAdmin    = selectedRole === 'ADMIN';
      const endpoint   = isLecturer
        ? '/api/v1/auth/register/lecturer'
        : isAdmin
        ? '/api/v1/auth/register/admin'
        : '/api/v1/auth/register/student';
      const body = selectedRole === 'STUDENT'
        ? { firstName: firstName.trim(), lastName: lastName.trim(), studentId: studentId.trim(), email: regEmail.trim(), password: regPassword, departmentId: deptId, level }
        : { firstName: firstName.trim(), lastName: lastName.trim(), email: regEmail.trim(), password: regPassword, ...(claimedLecId ? { claimLecturerId: claimedLecId } : {}) };

      const res  = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.message ?? 'Registration failed'); return; }

      const data = json.data as AuthTokens & { staffId?: string };

      if (isLecturer && data.staffId) {
        setGeneratedStaffId(data.staffId);
        setPendingAuth(data);
        setWasClaim(!!claimedLecId);
        setScreen('staff-id-reveal');
      } else {
        await finalizeAuth(data);
      }
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyStaffId = () => {
    navigator.clipboard.writeText(generatedStaffId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen font-sans relative overflow-hidden bg-[var(--gray-dark)]">

      {/* Background orbs */}
      <div className="absolute -top-28 -left-28 w-96 h-96 rounded-full pointer-events-none"
           style={{ backgroundColor: 'color-mix(in srgb, var(--primary-200) 12%, transparent)' }} />
      <div className="absolute top-1/2 -left-16 w-64 h-64 rounded-full pointer-events-none -translate-y-1/2"
           style={{ backgroundColor: 'color-mix(in srgb, var(--primary-400) 8%, transparent)' }} />
      <div className="absolute -bottom-24 left-16 w-80 h-80 rounded-full pointer-events-none"
           style={{ backgroundColor: 'color-mix(in srgb, var(--primary-200) 8%, transparent)' }} />

      {/* Logo */}
      <div className="absolute top-8 left-10 z-30 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[var(--primary-200)] flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-[var(--gray-dark)]" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-widest text-white uppercase">Timely</p>
          <p className="text-[10px] text-[var(--primary-200)] tracking-widest uppercase font-medium">University Portal</p>
        </div>
      </div>

      {/* Hero text */}
      <div
        className="absolute z-20 pointer-events-none"
        style={{
          top: '50%',
          left: phase === 0 ? '50%' : '8%',
          transform: phase === 0 ? 'translate(-50%, -50%)' : 'translate(0, -50%)',
          transition: 'left 0.85s cubic-bezier(0.4,0,0.2,1), transform 0.85s cubic-bezier(0.4,0,0.2,1)',
          textAlign: phase === 0 ? 'center' : 'left',
          width: '36%',
          minWidth: '280px',
        }}
      >
        <h1 className="text-4xl font-bold text-white leading-snug mb-4">
          Manage your<br />
          <span className="text-[var(--primary-200)]">timetable</span><br />
          with ease.
        </h1>
        <p
          className="text-sm text-white/50 leading-relaxed"
          style={{ opacity: phase === 1 ? 1 : 0, transition: 'opacity 0.6s ease 0.6s' }}
        >
          Timely keeps schedules, lecturers, and students in perfect sync, all from one place.
        </p>
      </div>

      {/* Card panel */}
      <div
        className="absolute z-20"
        style={{
          top: '50%', left: '58%',
          transform: phase === 1 ? 'translate(-50%, -50%)' : 'translate(-40%, -50%)',
          opacity: phase === 1 ? 1 : 0,
          transition: 'opacity 0.7s ease 0.55s, transform 0.7s cubic-bezier(0.4,0,0.2,1) 0.55s',
          width: '100%', maxWidth: '420px',
        }}
      >
        <div className="bg-white rounded-2xl shadow-lg px-8 py-10">

          {/* ── Role selection ─────────────────────────────────────────────── */}
          {screen === 'role-select' && (
            <>
              <div className="mb-7">
                <p className="text-xs text-[var(--gray-500)] uppercase tracking-widest font-medium mb-1">Welcome</p>
                <h2 className="text-2xl font-bold text-[var(--gray-dark)]">Who are you?</h2>
                <p className="text-xs text-[var(--gray-500)] mt-1.5">Select your role to continue.</p>
              </div>
              <div className="space-y-3">
                {(['ADMIN', 'LECTURER', 'STUDENT'] as Role[]).map(role => {
                  const meta = ROLE_META[role];
                  const Icon = meta.icon;
                  return (
                    <button key={role} onClick={() => pickRole(role)}
                      className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border border-[var(--gray-200)] hover:border-[var(--primary-200)] hover:bg-[var(--primary-200)]/5 transition-all text-left">
                      <div className={`w-10 h-10 rounded-xl ${meta.iconBg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-5 h-5 ${meta.iconColor}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--gray-dark)]">{meta.label}</p>
                        <p className="text-xs text-[var(--gray-500)]">{meta.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Login form ─────────────────────────────────────────────────── */}
          {screen === 'login' && selectedRole && (() => {
            const meta   = ROLE_META[selectedRole];
            const idMeta = IDENTIFIER_META[selectedRole];
            return (
              <>
                <div className="flex items-center gap-3 mb-7">
                  <button onClick={goBack}
                    className="p-1.5 rounded-lg hover:bg-[var(--gray-100)] transition-colors text-[var(--gray-500)]">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${meta.badge}`}>
                      {meta.label}
                    </span>
                    <h2 className="text-xl font-bold text-[var(--gray-dark)] mt-1">Sign in</h2>
                  </div>
                </div>

                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="space-y-1.5">
                    <Label htmlFor="login-id" className="text-xs">{idMeta.label}</Label>
                    <Input
                      id="login-id"
                      type={idMeta.inputType}
                      value={identifier}
                      placeholder={idMeta.placeholder}
                      onChange={e => setIdentifier(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="login-password" className="text-xs">Password</Label>
                    <div className="relative">
                      <Input id="login-password" type={showPass ? 'text' : 'password'}
                        value={password} placeholder="••••••••" onChange={e => setPassword(e.target.value)} />
                      <button type="button" tabIndex={-1} onClick={() => setShowPass(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--gray-400)] hover:text-[var(--gray-dark)] transition-colors">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">{error}</p>
                  )}

                  <Button type="submit" className="w-full mt-1" disabled={loading}>
                    {loading ? 'Signing in…' : 'Sign in'}
                  </Button>
                </form>

                <div className="mt-6 pt-5 border-t border-[var(--gray-150)] text-center">
                  <p className="text-xs text-[var(--gray-500)]">
                    New to Timely?{' '}
                    <button onClick={() => { setScreen('register'); setError(''); }}
                      className="font-medium text-[var(--primary-400)] hover:underline">
                      Create an account
                    </button>
                  </p>
                </div>
              </>
            );
          })()}

          {/* ── Register form ──────────────────────────────────────────────── */}
          {screen === 'register' && selectedRole && (() => {
            const meta = ROLE_META[selectedRole];
            const isLecturer = selectedRole === 'LECTURER';
            const isStudent  = selectedRole === 'STUDENT';
            return (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={goBack}
                    className="p-1.5 rounded-lg hover:bg-[var(--gray-100)] transition-colors text-[var(--gray-500)]">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${meta.badge}`}>
                      {meta.label}
                    </span>
                    <h2 className="text-xl font-bold text-[var(--gray-dark)] mt-1">Create account</h2>
                  </div>
                </div>

                <form className="space-y-3" onSubmit={handleRegister}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">First name</Label>
                      <Input value={firstName} placeholder="First" onChange={e => setFirstName(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Last name</Label>
                      <Input value={lastName} placeholder="Last" onChange={e => setLastName(e.target.value)} />
                    </div>
                  </div>

                  {/* Lecturer: check if the registrant matches an existing seeded lecturer */}
                  {isLecturer && claimedLecId && (
                    <div className="flex items-center justify-between gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-emerald-800">Linked to existing profile</p>
                          <p className="text-[10px] font-mono text-emerald-600 tracking-wider">{claimedStaffId} will be preserved</p>
                        </div>
                      </div>
                      <button type="button"
                        onClick={() => { setClaimedLecId(''); setClaimedStaffId(''); setLecSuggestions([]); }}
                        className="text-[10px] text-[var(--gray-400)] hover:text-[var(--gray-dark)] underline shrink-0">
                        Not me
                      </button>
                    </div>
                  )}

                  {isLecturer && !claimedLecId && lecSuggestions.length > 0 && (
                    <div className="rounded-xl border border-[var(--primary-200)]/50 bg-[var(--primary-200)]/5 overflow-hidden">
                      <p className="text-[10px] text-[var(--gray-500)] px-3 pt-2.5 pb-1 font-medium uppercase tracking-wide">
                        Are you one of these lecturers?
                      </p>
                      {lecSuggestions.map(s => (
                        <div key={s.id}
                          className="flex items-center justify-between gap-2 px-3 py-2 border-t border-[var(--gray-150)]">
                          <div>
                            <p className="text-xs font-semibold text-[var(--gray-dark)]">{s.firstName} {s.lastName}</p>
                            <p className="text-[10px] font-mono text-[var(--primary-400)] tracking-wide">{s.staffId}</p>
                          </div>
                          <button type="button"
                            onClick={() => { setClaimedLecId(s.id); setClaimedStaffId(s.staffId); setLecSuggestions([]); }}
                            className="text-[10px] font-semibold text-[var(--primary-400)] bg-[var(--primary-400)]/10 hover:bg-[var(--primary-400)]/20 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap">
                            That's me →
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Students need their matricule number, admin and lecturer do not */}
                  {isStudent && (
                    <div className="space-y-1.5">
                      <Label className="text-xs">Student ID / Matricule Number</Label>
                      <Input
                        value={studentId}
                        placeholder="e.g. SENG22SE019"
                        onChange={e => setStudentId(e.target.value)}
                      />
                      <p className="text-[10px] text-[var(--gray-400)]">
                        Enter your official matricule number exactly as it appears on your documents.
                      </p>
                    </div>
                  )}

                  {isStudent && (
                    <>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Department</Label>
                        <select value={deptId} onChange={e => setDeptId(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)] bg-white text-[var(--gray-dark)]">
                          <option value="">Select department…</option>
                          {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Level</Label>
                        <select value={level} onChange={e => setLevel(e.target.value as Level)}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:outline-none focus:border-[var(--primary-200)] bg-white text-[var(--gray-dark)]">
                          <option value="">Select level…</option>
                          {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-xs">Email address</Label>
                    <Input type="email" value={regEmail} placeholder="you@school.edu"
                      onChange={e => setRegEmail(e.target.value)} />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Password</Label>
                    <div className="relative">
                      <Input type={showRegPass ? 'text' : 'password'} value={regPassword}
                        placeholder="Min 6 characters" onChange={e => setRegPassword(e.target.value)} />
                      <button type="button" tabIndex={-1} onClick={() => setShowRegPass(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--gray-400)] hover:text-[var(--gray-dark)] transition-colors">
                        {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isLecturer && (
                    <p className="text-[10px] text-[var(--gray-400)] bg-[var(--gray-50)] border border-[var(--gray-150)] rounded-xl px-3 py-2">
                      A unique Staff ID will be auto-generated for your account after registration. Save it, you can use it to log in.
                    </p>
                  )}

                  {error && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">{error}</p>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating account…' : 'Create account'}
                  </Button>
                </form>

                <div className="mt-5 pt-4 border-t border-[var(--gray-150)] text-center">
                  <p className="text-xs text-[var(--gray-500)]">
                    Already have an account?{' '}
                    <button onClick={() => { setScreen('login'); setError(''); }}
                      className="font-medium text-[var(--primary-400)] hover:underline">
                      Sign in
                    </button>
                  </p>
                </div>
              </>
            );
          })()}

          {/* ── Staff ID reveal ────────────────────────────────────────────── */}
          {screen === 'staff-id-reveal' && (
            <>
              <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${wasClaim ? 'bg-[var(--primary-200)]/30' : 'bg-emerald-100'}`}>
                  <CheckCircle className={`w-8 h-8 ${wasClaim ? 'text-[var(--primary-400)]' : 'text-emerald-600'}`} />
                </div>
                <h2 className="text-xl font-bold text-[var(--gray-dark)]">
                  {wasClaim ? 'Profile linked!' : 'Account created!'}
                </h2>
                <p className="text-xs text-[var(--gray-500)] mt-1.5">
                  {wasClaim
                    ? 'Your account has been linked to your existing lecturer profile.'
                    : 'Your staff ID has been generated. Save it, you can use it to sign in.'}
                </p>
              </div>

              <div className="bg-[var(--gray-50)] border border-[var(--gray-200)] rounded-2xl px-6 py-5 mb-6 text-center">
                <p className="text-[10px] text-[var(--gray-400)] uppercase tracking-widest font-medium mb-2">
                  {wasClaim ? 'Your Staff ID (preserved)' : 'Your Staff ID'}
                </p>
                <p className="text-3xl font-bold tracking-wider text-[var(--gray-dark)] mb-3">
                  {generatedStaffId}
                </p>
                <button
                  onClick={handleCopyStaffId}
                  className="flex items-center gap-1.5 text-xs font-medium text-[var(--primary-400)] hover:underline mx-auto"
                >
                  {copied
                    ? <><CheckCircle className="w-3.5 h-3.5" /> Copied!</>
                    : <><Copy className="w-3.5 h-3.5" /> Copy to clipboard</>
                  }
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
                <p className="text-xs text-amber-800 leading-relaxed">
                  <span className="font-semibold">Important:</span>{' '}
                  {wasClaim
                    ? 'This is your permanent Staff ID. Your timetable assignments are already linked to it.'
                    : 'Write this down or copy it now. You can use your Staff ID or email address to sign in at any time.'}
                </p>
              </div>

              <Button
                className="w-full"
                onClick={() => pendingAuth && finalizeAuth(pendingAuth)}
                disabled={loading}
              >
                {loading ? 'Loading…' : 'Continue to Dashboard'}
              </Button>
            </>
          )}

        </div>
      </div>

      <p className="absolute bottom-8 left-10 text-xs text-white/20 z-20">
        © {new Date().getFullYear()} Timely. All rights reserved.
      </p>
    </div>
  );
};

export default LoginPage;
