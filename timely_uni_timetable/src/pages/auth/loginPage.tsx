import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import type { StoredAuth } from '../../context/AppContext';
import type { AuthUser, AuthTokens, Role } from '../../lib/types';
import { CalendarDays, Eye, EyeOff } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Label from '../../components/ui/Label';

const LoginPage = () => {
  const { onAuth } = useContext(AppContext);
  const navigate   = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [phase,    setPhase]    = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setPhase(1), 1400);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const tokenRes = await fetch('/api/v1/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim(), password }),
      });
      const tokenJson = await tokenRes.json();
      if (!tokenRes.ok) {
        setError(tokenJson.message ?? 'Invalid credentials');
        return;
      }
      const tokens: AuthTokens = tokenJson.data;

      const profileRes = await fetch('/api/v1/auth/me', {
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
        LECTURER: '/lecturer/timetable',
        STUDENT:  '/student/timetable',
      };
      navigate(dest[tokens.role], { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans relative overflow-hidden bg-[var(--gray-dark)]">

      <div className="absolute -top-28 -left-28 w-96 h-96 rounded-full pointer-events-none"
           style={{ backgroundColor: 'color-mix(in srgb, var(--primary-200) 12%, transparent)' }} />
      <div className="absolute top-1/2 -left-16 w-64 h-64 rounded-full pointer-events-none -translate-y-1/2"
           style={{ backgroundColor: 'color-mix(in srgb, var(--primary-400) 8%, transparent)' }} />
      <div className="absolute -bottom-24 left-16 w-80 h-80 rounded-full pointer-events-none"
           style={{ backgroundColor: 'color-mix(in srgb, var(--primary-200) 8%, transparent)' }} />

      <div className="absolute top-8 left-10 z-30 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[var(--primary-200)] flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-[var(--gray-dark)]" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-widest text-white uppercase">Timely</p>
          <p className="text-[10px] text-[var(--primary-200)] tracking-widest uppercase font-medium">University Portal</p>
        </div>
      </div>

      <div
        className="absolute z-20 pointer-events-none"
        style={{
          top: '50%',
          left: phase === 0 ? '50%' : '8%',
          transform: phase === 0 ? 'translate(-50%, -50%)' : 'translate(0, -50%)',
          transition: 'left 0.85s cubic-bezier(0.4,0,0.2,1), transform 0.85s cubic-bezier(0.4,0,0.2,1)',
          textAlign:  phase === 0 ? 'center' : 'left',
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
          Timely keeps schedules, lecturers, and students in perfect sync — all from one place.
        </p>
      </div>

      <div
        className="absolute z-20"
        style={{
          top: '50%', left: '58%',
          transform: phase === 1 ? 'translate(-50%, -50%)' : 'translate(-40%, -50%)',
          opacity:    phase === 1 ? 1 : 0,
          transition: 'opacity 0.7s ease 0.55s, transform 0.7s cubic-bezier(0.4,0,0.2,1) 0.55s',
          width: '100%', maxWidth: '420px',
        }}
      >
        <div className="bg-white rounded-2xl shadow-lg px-8 py-10">
          <div className="mb-7">
            <p className="text-xs text-[var(--gray-500)] uppercase tracking-widest font-medium mb-1">Welcome back</p>
            <h2 className="text-2xl font-bold text-[var(--gray-dark)]">Sign in to Timely</h2>
            <p className="text-xs text-[var(--gray-500)] mt-1.5">Enter your institutional email and password.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email address</Label>
              <Input id="email" name="email" type="email" value={email}
                placeholder="you@school.edu" onChange={e => setEmail(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">Password</Label>
              <div className="relative">
                <Input id="password" name="password" type={showPass ? 'text' : 'password'}
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
              Don't have an account?{' '}
              <span className="font-medium text-[var(--primary-400)]">Contact your institution admin.</span>
            </p>
          </div>
        </div>
      </div>

      <p className="absolute bottom-8 left-10 text-xs text-white/20 z-20">
        © {new Date().getFullYear()} Timely. All rights reserved.
      </p>
    </div>
  );
};

export default LoginPage;
