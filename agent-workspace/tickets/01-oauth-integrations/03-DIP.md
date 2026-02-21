# DIP — Implementation Plan

## Phase 1 — OAuth Lib Layer
- [ ] `lib/oauth/state.ts` — signOAuthState / verifyOAuthState (10-min JWT)
- [ ] `lib/oauth/google.ts` — buildGoogleAuthUrl, exchangeGoogleCode, refreshGoogleToken, checkGoogleToken
- [ ] `lib/oauth/meta.ts` — buildMetaAuthUrl, exchangeMetaCode, checkMetaConnection
- [ ] `lib/oauth/linkedin.ts` — buildLinkedInAuthUrl, exchangeLinkedInCode, checkLinkedInConnection
- [ ] `lib/integrations.ts` — add upsertIntegration helper

## Phase 2 — API Routes
- [ ] `app/api/integrations/connect/[provider]/route.ts` — GET, initiates OAuth
- [ ] `app/api/auth/callback/google/route.ts` — GET, Google callback
- [ ] `app/api/auth/callback/meta/route.ts` — GET, Meta callback
- [ ] `app/api/auth/callback/linkedin/route.ts` — GET, LinkedIn callback
- [ ] `app/api/integrations/[id]/check/route.ts` — rewrite to use real API tokens

## Phase 3 — UI
- [ ] `components/integrations/oauth-connect-button.tsx` — reusable "Connect with X" button
- [ ] `components/integrations/connect-google-ads-form.tsx` — replace with OAuthConnectButton
- [ ] `components/integrations/connect-search-console-form.tsx` — replace with OAuthConnectButton
- [ ] `components/integrations/connect-analytics-form.tsx` — replace with OAuthConnectButton
- [ ] `app/(dashboard)/integrations/page.tsx` — activate Meta + LinkedIn sections (remove "coming soon")

## Phase 4 — Config & Docs
- [ ] `.env.example` — add 6 OAuth env vars
- [ ] `DEPLOYMENT.md` — add OAuth setup guide (Google Cloud Console, Meta Developer, LinkedIn Developer)

## Phase 5 — Deploy
- [ ] Commit all changes
- [ ] Push to main → Vercel deploy
- [ ] Add env vars to Vercel project settings
- [ ] Test each OAuth flow end-to-end
