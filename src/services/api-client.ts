const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

let cachedToken: string | null = null;
let cachedRefreshToken: string | null = null;
let refreshPromise: Promise<boolean> | null = null;

export function setAccessToken(token: string) {
  cachedToken = token;
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('accessToken', token);
  }
}

export function setRefreshToken(token: string) {
  cachedRefreshToken = token;
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('refreshToken', token);
  }
}

export function getAccessToken(): string | null {
  if (cachedToken) return cachedToken;
  if (typeof window !== 'undefined') {
    cachedToken = sessionStorage.getItem('accessToken');
  }
  return cachedToken;
}

export function getRefreshToken(): string | null {
  if (cachedRefreshToken) return cachedRefreshToken;
  if (typeof window !== 'undefined') {
    cachedRefreshToken = sessionStorage.getItem('refreshToken');
  }
  return cachedRefreshToken;
}

export function clearAccessToken() {
  cachedToken = null;
  cachedRefreshToken = null;
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
  }
}

/** Attempt to refresh the access token. Returns true if successful. */
async function tryRefresh(): Promise<boolean> {
  const rt = getRefreshToken();
  if (!rt) return false;

  try {
    const url = `${API_BASE_URL}/api/auth/refresh`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    });

    if (!res.ok) return false;

    const data = (await res.json()) as {
      accessToken?: string;
      refreshToken?: string;
    };
    if (data.accessToken) {
      setAccessToken(data.accessToken);
      if (data.refreshToken) setRefreshToken(data.refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/** Deduplicated refresh — prevents multiple concurrent refresh calls */
export function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = tryRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

let isSigningOut = false;

/** Sign the user out client-side */
async function forceSignOut() {
  if (isSigningOut) return;
  isSigningOut = true;

  clearAccessToken();
  if (typeof window !== 'undefined') {
    try {
      const { signOut } = await import('next-auth/react');
      await signOut({ callbackUrl: '/signin' });
    } catch {
      // Fallback: hard redirect if signOut fails
      window.location.href = '/signin';
    }
  }
}

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  skipAuth?: boolean;
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { body, skipAuth, ...init } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = `${API_BASE_URL}${path}`;

  let res = await fetch(url, {
    ...init,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // On 401, try refreshing the token and retry once
  if (res.status === 401 && !skipAuth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const newToken = getAccessToken();
      if (newToken) headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(url, {
        ...init,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    }

    // Still 401 after refresh attempt → sign out
    if (res.status === 401) {
      await forceSignOut();
      throw new Error('Session expired');
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

/** Server-side only fetch using the server env var (not exposed to client) */
export async function serverApiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const serverBase =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://localhost:8080';

  const { body, skipAuth, ...init } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  const url = `${serverBase}${path}`;

  const res = await fetch(url, {
    ...init,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}
