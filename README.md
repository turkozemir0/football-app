# KickoffAI Scaffold

A Next.js 14 starter scaffold aligned with the KickoffAI blueprint.

## Included
- App Router + `next-intl` request/routing setup (`en` + `tr`) with locale layout provider
- Tailwind CSS baseline
- Supabase, API-Football, and Claude wrapper modules
- Prediction engine base utilities (form score + Poisson model)
- Cache-first fixtures API route (`/api/football/fixtures`) with Supabase -> API fallback
- Matches page rendering grouped fixtures from API route
- Cron route placeholders + Vercel cron config
- Supabase schema starter SQL

## Run
```bash
npm install
npm run dev
```

## Environment Setup
1. Copy `.env.example` to `.env.local`.
2. Fill these required values:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `API_FOOTBALL_KEY`
3. Keep `NEXT_PUBLIC_APP_URL=http://localhost:3000` for local development.

## Supabase Setup
1. Open your Supabase project SQL Editor.
2. Run [supabase/schema.sql](./supabase/schema.sql) once.
3. Verify tables were created: `leagues`, `teams`, `fixtures`.

## Notes
- The fixtures route uses cache-first behavior when Supabase env vars exist.
- If Supabase env vars are missing, the app falls back to API-only mode.
