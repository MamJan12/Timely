import { createContext, useState, type ReactNode } from 'react';
import type { AuthUser, Role } from '../lib/types';

const AUTH_KEY = 'timely_auth';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StoredAuth {
  accessToken:  string;
  refreshToken: string;
  role:         Role;
  user:         AuthUser;
}

export interface AppContextValue {
  user:     AuthUser | null;
  role:     Role | null;
  onAuth:   (auth: StoredAuth) => void;
  onLogout: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

export const AppContext = createContext<AppContextValue>({
  user:     null,
  role:     null,
  onAuth:   () => {},
  onLogout: () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────

const AppProvider = ({ children }: { children: ReactNode }) => {
  const stored = (() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? (JSON.parse(raw) as StoredAuth) : null;
    } catch {
      return null;
    }
  })();

  const [user, setUser] = useState<AuthUser | null>(stored?.user ?? null);
  const [role, setRole] = useState<Role | null>(stored?.role ?? null);

  const onAuth = (auth: StoredAuth) => {
    setUser(auth.user);
    setRole(auth.role);
    try { localStorage.setItem(AUTH_KEY, JSON.stringify(auth)); } catch { /* ignore */ }
  };

  const onLogout = () => {
    setUser(null);
    setRole(null);
    try { localStorage.removeItem(AUTH_KEY); } catch { /* ignore */ }
  };

  return (
    <AppContext.Provider value={{ user, role, onAuth, onLogout }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
