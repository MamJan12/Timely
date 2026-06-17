import type { Role } from '../lib/types';

const AUTH_KEY = 'timely_auth';

export const getUserRole = (): Role | null => {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return (parsed?.role as Role) ?? null;
  } catch {
    return null;
  }
};
