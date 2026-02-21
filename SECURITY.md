# M-Control — Security Checklist

## Phase 1 (Foundation)

- [x] **Multi-tenant isolation** — Every business table has `tenant_id`; middleware and helpers enforce scope
- [x] **Auth** — JWT in httpOnly cookie; bcrypt password hashing
- [x] **RBAC** — Role/permission checks via `lib/rbac.ts`
- [x] **No indexing** — `robots.txt` disallow all; metadata `robots: noindex, nofollow`; security headers (X-Robots-Tag, X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
- [x] **Protected routes** — Middleware redirects unauthenticated users to `/auth/login`; only `/auth` and `/api/auth` are public
- [x] **Audit logging** — Critical actions logged via `lib/audit.ts`
- [x] **Integration tokens** — Stored via `lib/tokens.ts` abstraction (encrypt before save; replace XOR with AES-256-GCM in production)

## Before production

- [ ] Use strong `JWT_SECRET` and `ENCRYPTION_KEY` (32+ chars, random)
- [ ] Replace XOR in `lib/tokens.ts` with proper AES-256-GCM encryption
- [ ] Enable HTTPS only; set `secure: true` for cookies in production (already conditional on NODE_ENV)
- [ ] Add rate limiting on `/api/auth/login` (e.g. Vercel or middleware)
- [ ] Consider CSRF for state-changing APIs if using cookie-based auth with non-same-origin frontends

## Extension (later phases)

- [ ] Rate limiting middleware
- [ ] Stricter CORS if needed
- [ ] Audit log retention and export
