# Auth Cookie Isolation Fix — OceanPact Portal (`oceanpact.perfomax.io`)

## Problem

Both portals (`vships.perfomax.io` and `oceanpact.perfomax.io`) share the same NextAuth session cookie because it defaults to the parent domain `.perfomax.io`. When a user logs into one portal, the cookie is sent to the other, causing **cross-tenant data leakage**.

This has already been fixed on the VShips portal. You need to apply the equivalent fix to the OceanPact codebase.

---

## What to Change

### 1. `src/app/api/auth/[...nextauth]/auth-options.ts`

Add the `buildCookies()` function and wire it into `authOptions`. **Do not change providers, callbacks, or session config** — only add the `cookies` block.

```ts
import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { pagesOptions } from './pages-options';
import { loginUser } from '@/services/api';

const COOKIE_DOMAIN = 'oceanpact.perfomax.io'; // ← YOUR SUBDOMAIN

function buildCookies(): NextAuthOptions['cookies'] {
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    // Development: no secure prefix, no explicit domain (defaults to localhost)
    return {
      sessionToken: {
        name: 'next-auth.session-token',
        options: { httpOnly: true, sameSite: 'lax', path: '/', secure: false },
      },
      callbackUrl: {
        name: 'next-auth.callback-url',
        options: { httpOnly: true, sameSite: 'lax', path: '/', secure: false },
      },
      csrfToken: {
        name: 'next-auth.csrf-token',
        options: { httpOnly: true, sameSite: 'lax', path: '/', secure: false },
      },
    };
  }

  // Production: lock cookies to this subdomain only
  return {
    sessionToken: {
      name: '__Secure-next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
        domain: COOKIE_DOMAIN,
      },
    },
    callbackUrl: {
      name: '__Secure-next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
        domain: COOKIE_DOMAIN,
      },
    },
    csrfToken: {
      name: '__Host-next-auth.csrf-token',
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: true },
    },
  };
}

export const authOptions: NextAuthOptions = {
  pages: {
    ...pagesOptions,
  },
  cookies: buildCookies(), // ← ADD THIS LINE
  session: {
    // ... keep your existing session config unchanged ...
  },
  callbacks: {
    // ... keep your existing callbacks unchanged ...
  },
  providers: [
    // ... keep your existing providers unchanged ...
  ],
};
```

**Key difference from VShips:** Only the `COOKIE_DOMAIN` value changes — use `'oceanpact.perfomax.io'` instead of `'vships.perfomax.io'`.

---

### 2. `.env.production` (create if it doesn't exist)

```env
NEXTAUTH_URL=https://oceanpact.perfomax.io
NEXTAUTH_SECRET=<your-production-secret>
NODE_ENV=production

API_BASE_URL=https://ocean-pact-api.perfomax.tech
NEXT_PUBLIC_API_BASE_URL=https://ocean-pact-api.perfomax.tech
```

`NEXTAUTH_URL` **must exactly match** the subdomain. This is what NextAuth uses to derive cookie defaults.

---

### 3. `.env.local` (for local development)

Verify it has:

```env
NEXTAUTH_URL=http://localhost:3000
```

No domain locking happens in dev — `buildCookies()` skips the domain when `NODE_ENV !== 'production'`, so `localhost` works normally.

---

### 4. Docker / CI / PM2 (if applicable)

Make sure `NEXTAUTH_URL` is set in your deployment environment:

```yaml
# Docker Compose example
environment:
  - NEXTAUTH_URL=https://oceanpact.perfomax.io
  - NEXTAUTH_SECRET=<your-production-secret>
```

```js
// PM2 ecosystem.config.js — add to env block
env: {
  NODE_ENV: 'production',
  NEXTAUTH_URL: 'https://oceanpact.perfomax.io',
}
```

---

## How It Works

| Environment | Cookie names | `secure` | `domain` |
|---|---|---|---|
| Development | `next-auth.session-token` | `false` | *(none — defaults to localhost)* |
| Production | `__Secure-next-auth.session-token` | `true` | `oceanpact.perfomax.io` |

- In **production**, cookies are explicitly locked to `oceanpact.perfomax.io`, so the browser will **not** send them to `vships.perfomax.io` (and vice versa).
- In **development**, plain cookie names without `__Secure-` prefix work over `http://localhost`.
- The `__Host-` prefix on `csrfToken` intentionally has **no domain** — that prefix requires it.

---

## Verification

After deploying:

1. Open `oceanpact.perfomax.io` → log in → confirm data loads
2. Open `vships.perfomax.io` in a new tab → should show login page (NOT auto-logged-in)
3. Check DevTools → Application → Cookies:
   - `oceanpact.perfomax.io` has its own `__Secure-next-auth.session-token`
   - The cookie domain column shows `oceanpact.perfomax.io`, **not** `.perfomax.io`
4. Log in to VShips with a VShips user → confirm VShips data loads independently

---

## Notes

- `sessionStorage` (used by `api-client.ts` for backend JWT tokens) is already per-origin — no cross-domain token leakage there.
- The backend API already enforces `customer_id` verification as an additional safety net, but the cookie fix is the correct primary solution.
