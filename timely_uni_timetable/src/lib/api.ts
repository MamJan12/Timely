import type { ApiResponse } from './types';

const AUTH_KEY = 'timely_auth';

// Custom error class that carries the full backend response body
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getTokens(): { accessToken: string | null; refreshToken: string | null } {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return { accessToken: null, refreshToken: null };
    const parsed = JSON.parse(raw);
    return {
      accessToken:  parsed.accessToken  ?? null,
      refreshToken: parsed.refreshToken ?? null,
    };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}

function setTokens(accessToken: string, refreshToken: string) {
  try {
    const raw  = localStorage.getItem(AUTH_KEY);
    const prev = raw ? JSON.parse(raw) : {};
    localStorage.setItem(AUTH_KEY, JSON.stringify({ ...prev, accessToken, refreshToken }));
  } catch { /* ignore */ }
}

async function tryRefresh(): Promise<string | null> {
  const { refreshToken } = getTokens();
  if (!refreshToken) return null;
  try {
    const res = await fetch('/api/v1/auth/refresh', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const json: ApiResponse<{ accessToken: string; refreshToken: string }> = await res.json();
    setTokens(json.data.accessToken, json.data.refreshToken);
    return json.data.accessToken;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const { accessToken } = getTokens();

  const res = await fetch(`/api/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && retry) {
    const newToken = await tryRefresh();
    if (newToken) return request<T>(path, options, false);
    localStorage.removeItem(AUTH_KEY);
    window.location.href = '/login';
    throw new ApiError('Session expired', 401, {});
  }

  // Read as text first — res.json() throws on empty body (e.g. 204 No Content)
  const text = await res.text();

  let json: Record<string, unknown> | null = null;
  if (text.trim()) {
    try {
      json = JSON.parse(text) as Record<string, unknown>;
    } catch {
      // Non-JSON body (e.g. HTML error page from a down proxy)
      if (!res.ok) throw new ApiError(`Server error (${res.status})`, res.status, {});
      return undefined as unknown as T;
    }
  }

  if (!res.ok) {
    const raw = json?.message;
    const message = typeof raw === 'string'
      ? raw
      : Array.isArray(raw)
        ? (raw as string[]).join(', ')
        : `Server error (${res.status})`;
    throw new ApiError(message, res.status, json ?? {});
  }

  // 204 No Content or empty body — return undefined cast to T
  if (!json) return undefined as unknown as T;

  // Success responses are wrapped: { statusCode, message, data }
  return (json as ApiResponse<T>).data;
}

export const api = {
  get:    <T>(path: string)              => request<T>(path),
  post:   <T>(path: string, body: unknown) => request<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: <T>(path: string)              => request<T>(path, { method: 'DELETE' }),
};
