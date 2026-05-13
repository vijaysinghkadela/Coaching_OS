# Coaching OS

Showcase-only Next.js app for a coaching institute dashboard.

The project now uses local demo data only. There is no live Supabase, payment, or WhatsApp backend required to run or build it.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Demo Mode

- `NEXT_PUBLIC_DEMO_MODE=true`
- All data comes from `lib/demo/data.ts`
- All client/server Supabase helpers resolve to the local demo client

## Docs

- `docs/SUMMARY.md` for the current project state
- `docs/DEPLOYMENT.md` for showcase-only runtime notes
- `docs/DATABASE.md` for the mock data model
- `docs/API.md` for route behavior
- `docs/FEATURES.md` for feature coverage
- `docs/PROJECT_MAP.md` for the repository map
