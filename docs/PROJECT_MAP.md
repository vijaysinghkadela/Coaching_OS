# Project Map

## Root

- `app/` - Next.js routes and pages
- `components/` - UI and feature components
- `lib/` - helper code, demo client, actions, utilities
- `public/` - static assets
- `docs/` - written documentation

## Important Files

- `app/layout.tsx` - root layout
- `app/globals.css` - global styles and theme tokens
- `lib/demo/data.ts` - showcase data
- `lib/demo/client.ts` - mock query client
- `lib/supabase/server.ts` - demo client wrapper for server code
- `lib/supabase/client.ts` - demo client wrapper for client code
- `components/ui/*` - base UI primitives
- `docs/SUMMARY.md` - current project summary

## Removed Runtime Backend

- No live `supabase/` runtime folder is required anymore
- No Supabase environment variables are needed for showcase mode
