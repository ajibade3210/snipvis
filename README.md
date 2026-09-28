# Snipvis - Single Next.js Fullstack (Recommended)

## Why this is better than split Fastify + Next.js

- One repo, one deploy to Vercel, no CORS, no Render
- Same architecture: Service Layer (src/services/api/), TanStack Query v5, Zod, Cache-Aside
- API routes are Next.js Route Handlers (app/api/\*) instead of Fastify routes - same logic

## Stack

- Next.js 14 App Router + Tailwind (light/dark with CSS vars, class toggle)
- Prisma + Postgres (Supabase)
- Domain Service Layer: src/services/api/
- TanStack Query v5 + Zod validation
- Cache-Aside: src/lib/cache/index.ts with withCache + InMemory -> Redis swappable
- Biome, TypeScript strict

## Run

1. cp .env.example .env -> set DATABASE_URL
2. npm install
3. npx prisma migrate dev && npx prisma generate
4. npm run dev -> http://localhost:3000
   API: /api/projects, /api/inspirations, /api/assets, /api/youtube

## Deploy to Vercel

- Push to GitHub, import to Vercel, set DATABASE_URL env, deploy. Done.
