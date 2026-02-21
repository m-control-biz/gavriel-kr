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

5. **Post-deploy**
   - For schema changes: run `npx prisma migrate deploy` in a build step or manually against production DB
   - Ensure production DB URL is used in Vercel env

## Build command

Default: `next build`. No override needed.

## Optional: Vercel Postgres

If using Vercel Postgres, use the pooled connection string for serverless and run migrations from your machine or a one-off job with the direct URL.
