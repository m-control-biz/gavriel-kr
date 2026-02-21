# ADD — OAuth Integration Architecture

## Existing Infrastructure (reused)
- `lib/auth.ts` — `jose` JWT already installed; `getJwtSecret()` used for OAuth state signing
- `lib/tokens.ts` — `encryptToken / decryptToken` for storing credentials
- `prisma/schema.prisma` — `Integration` model already has `encryptedAccessToken`, `encryptedRefreshToken`, `tokenExpiry`, `metadataJson`
- `getAccountScopeFromRequest()` — tenant/account isolation on all API routes
- Middleware — sets `x-account-id` on protected routes; `/api/auth/*` is public (for callbacks)

## New Route Paths
```
GET /api/integrations/connect/[provider]   — PROTECTED — initiates OAuth
GET /api/auth/callback/google              — PUBLIC — Google OAuth callback
GET /api/auth/callback/meta               — PUBLIC — Meta OAuth callback
GET /api/auth/callback/linkedin           — PUBLIC — LinkedIn OAuth callback
```

Note: connect route uses `/api/integrations/` prefix (protected by middleware).
Callback routes use `/api/auth/` prefix (already public in middleware).

## State Security
- State param = short-lived JWT (10 min) signed with JWT_SECRET
- Contains: `{ accountId, feature, provider }`
- Verified on callback before processing

## Token Storage
- `encryptedAccessToken` — XOR-encrypted access_token
- `encryptedRefreshToken` — XOR-encrypted refresh_token
- `tokenExpiry` — expiry DateTime (for pre-emptive refresh)
- `metadataJson` — `{ connectionStatus, lastCheckedAt, lastError }`

## Data Flow
```
Browser → /api/integrations/connect/google?feature=gsc
  → read session + accountId from middleware header
  → sign state JWT { accountId, feature="gsc", provider="google" }
  → redirect to accounts.google.com/o/oauth2/v2/auth

Google → /api/auth/callback/google?code=xxx&state=yyy
  → verify state JWT → extract accountId + feature
  → POST to oauth2.googleapis.com/token → get access_token + refresh_token
  → GET googleapis.com/oauth2/v3/userinfo → get user email as name
  → upsertIntegration(accountId, provider=feature, tokens)
  → redirect to /integrations?provider=gsc&connected=1
```

## Check Flow
```
POST /api/integrations/[id]/check
  → load integration + decrypt tokens
  → if expired: try token refresh (Google only)
  → call provider API:
      Google: GET /oauth2/v3/userinfo (validates any Google OAuth token)
      Meta:   GET graph.facebook.com/me
      LinkedIn: GET api.linkedin.com/v2/me
  → write connectionStatus to metadataJson
```

## No New Dependencies
- `jose` — already installed (session JWTs)
- `fetch` — native (token exchange + API calls)
- No new npm packages
