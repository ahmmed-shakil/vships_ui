# Refresh Token API — Backend Implementation Guide

> **For:** Backend developer  
> **Frontend repo:** `Client_V2` (Next.js 15 / next-auth 4)  
> **Base URL:** `https://ocean-pact-api.perfomax.tech`

---

## Endpoint

```
POST /api/auth/refresh
```

---

## Request

**Headers:**

| Header         | Value              |
| -------------- | ------------------ |
| `Content-Type` | `application/json` |

**Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

| Field          | Type     | Required | Description                                                  |
| -------------- | -------- | -------- | ------------------------------------------------------------ |
| `refreshToken` | `string` | **Yes**  | The refresh token issued during login or a previous refresh. |

---

## Success Response — `200 OK`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...<new access JWT>",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...<new refresh JWT>"
}
```

| Field          | Type     | Required | Description                                                              |
| -------------- | -------- | -------- | ------------------------------------------------------------------------ |
| `accessToken`  | `string` | **Yes**  | New JWT access token. Frontend checks this field to determine success.   |
| `refreshToken` | `string` | **Yes**  | New refresh token (rotation). The old refresh token MUST be invalidated. |

> **Critical:** The frontend uses `if (data.accessToken)` to decide if the refresh succeeded. If `accessToken` is missing, empty, or falsy, the refresh is treated as **failed** and the user is signed out.

---

## Error Responses

| Status                      | When                                          | Body (optional)                                   |
| --------------------------- | --------------------------------------------- | ------------------------------------------------- |
| `401 Unauthorized`          | Refresh token is expired, revoked, or invalid | `{ "error": "invalid or expired refresh token" }` |
| `400 Bad Request`           | Missing `refreshToken` field in body          | `{ "error": "refreshToken is required" }`         |
| `500 Internal Server Error` | Server-side failure                           | `{ "error": "internal server error" }`            |

> The frontend only checks `res.ok` (status 200–299). Any non-2xx status = refresh failed → user is signed out and redirected to `/signin`.

---

## How the Frontend Uses This

```
1. User makes any API call → gets 401 Unauthorized
2. Frontend sends POST /api/auth/refresh with the stored refreshToken
3. If 200 + accessToken present:
   → Stores new accessToken & refreshToken in sessionStorage
   → Retries the original failed request with new accessToken
4. If refresh fails (non-200 or no accessToken in body):
   → Signs user out via next-auth
   → Redirects to /signin
```

### Key Frontend Behaviors

- **Deduplication:** Multiple concurrent 401s trigger only **ONE** refresh call. All pending requests wait for the single refresh to complete.
- **Single retry:** After a successful refresh, the original request is retried exactly once. If that retry also returns 401, the user is signed out.
- **Token rotation expected:** The frontend **always** replaces its stored `refreshToken` with the one from the refresh response. The backend should rotate tokens (invalidate old, issue new) on every refresh.

---

## Frontend Code Reference

```typescript
// POST request made by the frontend (src/services/api-client.ts)
async function tryRefresh(): Promise<boolean> {
  const rt = getRefreshToken();
  if (!rt) return false;

  const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: rt }),
  });

  if (!res.ok) return false;

  const data = await res.json();
  // ↓↓↓ THIS is the success check ↓↓↓
  if (data.accessToken) {
    setAccessToken(data.accessToken);
    if (data.refreshToken) setRefreshToken(data.refreshToken);
    return true;
  }
  return false;
}
```

---

## Related: Login Endpoint (for reference)

```
POST /api/auth/login
```

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

Both `accessToken` and `refreshToken` from login are stored by the frontend and used for the refresh flow described above.

---

## Recommended Token Lifetimes

| Token          | Suggested TTL | Reasoning                                                               |
| -------------- | ------------- | ----------------------------------------------------------------------- |
| `accessToken`  | 15–30 minutes | Short-lived, used for API auth. NextAuth session is configured for 24h. |
| `refreshToken` | 7–30 days     | Long-lived, used only to obtain new access tokens. Rotated on each use. |

---

## Security Requirements

1. **Rotate refresh tokens** — each successful refresh must invalidate the old refresh token and return a new one.
2. **Store refresh tokens server-side** — maintain a whitelist or blacklist in the database to detect reuse.
3. **Detect reuse (token theft)** — if a previously-used refresh token is presented again, revoke the **entire token family** (all refresh tokens for that user session) as this indicates potential theft.
4. **Rate limit** — protect `/api/auth/refresh` from brute-force attempts (e.g., max 10 requests per minute per user/IP).
5. **No CORS credentials needed** — the frontend sends the refresh token in the JSON body, not as a cookie.
