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

## Notes
- Set `NEXT_PUBLIC_APP_URL` for server-side page fetches to API routes.
- `API_FOOTBALL_KEY` and Supabase credentials are required for live data.
