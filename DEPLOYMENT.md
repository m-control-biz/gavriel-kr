# M-Control — Deployment Guide (Vercel)

## Prerequisites

- Node.js 18+
- PostgreSQL database (e.g. Vercel Postgres, Neon, Supabase)
- `JWT_SECRET` and `ENCRYPTION_KEY` (min 32 chars each)

## Steps

1. **Clone and install**
   ```bash
   cd m-control
   npm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env`
   - Set `DATABASE_URL` to your PostgreSQL connection string
   - Set `JWT_SECRET` and `ENCRYPTION_KEY` (generate secure random strings)
   - Set `NEXTAUTH_URL` to your production URL (e.g. `https://m-control.biz`)

3. **Database**
   ```bash
   npx prisma db push
   npm run db:seed
   ```

4. **Vercel**
   - Import the repo in Vercel
   - Add env vars in Project Settings → Environment Variables
   - Deploy; Vercel will run `next build` and `next start`

5. **Post-deploy (schema + seed)**
   After each deploy that adds or changes Prisma models or seed data, run against the production DB:
   ```bash
   npx prisma db push
   npm run db:seed
   ```

---

## OAuth Integration Setup

### Google (Search Console, GA4, Google Ads)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Enable these APIs:
   - Google Search Console API
   - Google Analytics Data API
   - Google Ads API
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add authorized redirect URI: `https://m-control.biz/api/auth/callback/google`
7. Copy **Client ID** → `GOOGLE_CLIENT_ID`
8. Copy **Client Secret** → `GOOGLE_CLIENT_SECRET`
9. Go to **OAuth consent screen** → set app name, support email, scopes:
   - `openid`, `email`, `profile`
   - `https://www.googleapis.com/auth/webmasters.readonly`
   - `https://www.googleapis.com/auth/analytics.readonly`
   - `https://www.googleapis.com/auth/adwords`

### Meta (Facebook + Instagram)

1. Go to [Meta for Developers](https://developers.facebook.com)
2. Click **My Apps → Create App → Business**
3. Add product: **Facebook Login**
4. In Facebook Login settings, add valid OAuth redirect URI: `https://m-control.biz/api/auth/callback/meta`
5. Go to **Settings → Basic** → copy **App ID** → `META_APP_ID`
6. Copy **App Secret** → `META_APP_SECRET`
7. Add permissions in App Review: `pages_read_engagement`, `instagram_basic`, `ads_read`, `business_management`

### LinkedIn

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers)
2. Click **Create App**
3. Under **Auth**, add authorized redirect URL: `https://m-control.biz/api/auth/callback/linkedin`
4. Request access to products: **Marketing Developer Platform**, **Share on LinkedIn**
5. Copy **Client ID** → `LINKEDIN_CLIENT_ID`
6. Copy **Client Secret** → `LINKEDIN_CLIENT_SECRET`

### Add vars to Vercel

In Vercel project → **Settings → Environment Variables**, add all 6 OAuth vars:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `META_APP_ID`
- `META_APP_SECRET`
- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`

Then trigger a redeploy. The Integrations page will automatically show "Connect with Google/Meta/LinkedIn" buttons once the vars are present.
