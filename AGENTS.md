# AGENTS.md: Architecture Reference & Developer Rules for Snipvis

> **Repository:** `snipvis`  
> **Application:** Snipvis OS — Creator Research Lab  
> **Target Framework:** Next.js 14.2.5 (App Router)  
> **Primary Language:** TypeScript 5.4.5 (Strict Mode)  
> **Database & ORM:** PostgreSQL + Prisma 7.10.0 (PrismaPg Driver Adapter)  
> **Styling & Design System:** Tailwind CSS 3.4.4 (Creator Paper / Dark Studio Palette)  
> **State Management:** TanStack React Query v5.51.1  
> **Validation:** Zod 3.23.8

---

# MANDATORY: Check When Done — NEVER SKIP THIS
AFTER EVERY CODE CHANGE, WITHOUT EXCEPTION, YOU MUST:
1. **No Magic Strings Allowed** — Define named constants, cache key identifiers, API route paths, or configuration maps in `src/lib/constants.ts` or `src/config/constants/`.
2. **Types & Interfaces in `src/types/` — Direct File Imports (No Re-Export Barrels)**: Every exported domain interface, type alias, or DTO must live in its dedicated file in `src/types/` (e.g. `src/types/channel.ts`, `src/types/hook-analysis.ts`). Never add barrel re-exports (`export * from "./..."`) inside `src/types/index.ts`. Consumers must always import types directly from their specific file (e.g. `import type { ChannelRecord } from "@/types/channel"`, `import type { HookType } from "@/types/hook-analysis"`). Apply domain type extraction wherever it fits, but skip extraction when it would be over-engineering, such as a single-use component prop type or a private, non-exported type.
3. **Scan Related Files** — Check Next.js API Route Handlers (`src/app/api/`), client services (`src/services/api/`), React Query hooks (`src/hooks/`), Zod validation schemas (`src/lib/validations.ts`), Prisma schema/migrations (`prisma/`), and UI components (`src/components/`) for anything missing, broken, or inconsistent with your change.
4. **Briefly Explain Changes** — Provide a concise summary of the problem, the fix applied, and any important architectural considerations.
5. **Call Out Breaking Changes** — Explicitly warn if a change impacts DB schema, Prisma migrations, API response contracts, cache structures, or client state.
6. **Run Verification Suite**:
   - `npm run lint` / `npm run format` (Biome linting and formatting across `./src`)
   - `npm run type-check` or `npm run check` (`tsc --noEmit` static type checking)
   - `npm run test` (Vitest test suite)
7. **End With Completion Confirmation** — End with a one-line statement confirming whether anything important is missing: `"Nothing important appears to be missing."`
8. **No Automatic Git Commits or Pushes** — Never execute git commits or git pushes automatically. Version control staging, committing, and pushing to GitHub must be handled manually by the user.

---

## Core Developer Principles & Behavioral Guidelines

- **STRICT ARCHITECTURAL PLACEMENT & MODULAR BOUNDARIES:**
  Everything in the codebase MUST be defined strictly in its designated architectural layer without exception:
  - **API Route Handlers** $\rightarrow$ `src/app/api/{resource}/route.ts` & `src/app/api/{resource}/[id]/route.ts` (Next.js server-side endpoints, request body/query extraction, Zod validation, delegating to Prisma, Cache-Aside operations, returning standard `NextResponse.json(...)`).
  - **Client API Services** $\rightarrow$ `src/services/api/{resource}.service.ts` (Type-safe client abstractions over HTTP endpoints using `client.ts` fetch wrapper and Zod schema verification).
  - **Client State & Data Fetching Hooks** $\rightarrow$ `src/hooks/use-{resource}.ts` (TanStack React Query hooks for reactive caching, queries, mutations, and cache invalidation).
  - **UI Studio Views** $\rightarrow$ `src/components/views/{feature}-view.tsx` (High-density dashboard screens: Global Vault, Projects Hub, Project Workspace, Competitor Spy, Settings).
  - **Workspace Modals & Overlays** $\rightarrow$ `src/components/{feature}-modal.tsx` (Controlled forms and dialogs for creating/editing projects, inspirations, assets, notes).
  - **Reusable UI Primitives** $\rightarrow$ `src/components/ui/{component}.tsx` (Design system atoms: buttons, cards, badges, inputs).
  - **Global Shell & Navigation** $\rightarrow$ `src/components/top-header.tsx`, `src/components/sidebar.tsx`.
  - **Validation Schemas & Contracts** $\rightarrow$ `src/lib/validations.ts` (Zod schemas for all mutating endpoints, query params, and YouTube metadata extraction).
  - **Shared Types & Domain Interfaces** $\rightarrow$ `src/types/` (Exported TypeScript interfaces, type aliases, and contract definitions).
  - **Core Infrastructure & Singletons** $\rightarrow$ `src/lib/` (`prisma.ts` for database pooling, `cache/` for Cache-Aside store, `query-client.ts`, `providers.tsx`, `theme-provider.tsx`).
  - **Configuration & Constants** $\rightarrow$ `src/lib/constants.ts` (Cache keys, route paths, default limits, TTL constants).
  - **Database Schema & Migrations** $\rightarrow$ `prisma/schema.prisma` and `prisma/migrations/`.
  - **Clean Code & Self-Documenting Discipline**: Remove all unnecessary comments or redundant comments. Keep code clean, lean, and self-documenting without redundant inline explanations or unnecessary JSDoc blocks.

- **ZERO `any` POLICY (Strict TypeScript):**
  `any` is strictly prohibited anywhere in the codebase. Always use explicit types from `@prisma/client`, `src/types/`, or Zod inferences (`z.infer<...>`). For unknown inputs, third-party API payloads, or catch clauses, use `unknown` with explicit runtime type narrowing (`instanceof Error`, Zod `safeParse`, type predicates).

- **STRICT SCOPE ENFORCEMENT:**
  NEVER introduce unrequested endpoints, database columns/models, external libraries, background queues, or utility functions unless explicitly requested. Keep implementations tightly scoped to the user directive.

- **CUSTOM ERROR HANDLING & DOMAIN EXCEPTIONS:**
  Never leak raw database errors or generic uncaught exceptions to the client:
  - **Server-Side API Routes**: Catch errors and return standardized JSON error objects with appropriate HTTP status codes:
    - `400 Bad Request` — Validation failures (Zod parsing errors, malformed YouTube URLs).
    - `404 Not Found` — Entity not found (e.g., project ID not matching any record).
    - `409 Conflict` — Unique constraint conflicts (e.g., duplicate slug).
    - `500 Internal Server Error` — Sanitized error message for unexpected failures.
  - **Client-Side HTTP Client**: `src/services/api/client.ts` intercepts non-2xx responses, extracts the `error` field, and throws actionable errors handled by UI modals and contextual banners.

---

## 1. Project Purpose, Scope, and Domain Context

**Snipvis** (branded in-app as **Snipvis OS - Creator Research Lab**) is a high-density, fullstack creator intelligence and production management platform. It is engineered for video creators, YouTube strategists, creative directors, and video editors to dismantle the viral mechanics of top-performing content and translate research directly into structured production assets.

### Core Domain Workflows

1. **Packaging & Inspiration Ingestion:** Captures high-CTR thumbnails, retention hooks, and title formulas via direct manual input or automated YouTube oEmbed metadata extraction.
2. **Project-Centric Asset Tagging:** Links global inspirations to specific projects with project-specific contextual notes and favorite toggles via a `ProjectInspiration` join model.
3. **Structured Creative Briefs:** Houses target retention hooks, script document links (Google Docs, Notion, Figma), and full video scripts per project.
4. **Production Asset Management:** Tracks b-roll URLs, licensed audio cues, imagery, and typography resources from third-party libraries (Pexels, Pixabay, Mixkit, YouTube) mapped directly to projects.
5. **Competitor & Outlier Intelligence:** Benchmarks multiplier velocity (e.g., 12.4x channel average), estimated CTRs, visual contrast strategies, and retention hooks.
6. **Analytics & Performance Auditing:** Provides real-time breakdowns of inspiration type ratios (Thumbnails vs. Titles vs. Hooks), top benchmarked channels, and brief completion scores.

---

## 2. High-Level System Architecture

Snipvis operates as a unified, single-repository Next.js 14 App Router application deployed on Vercel. It consolidates UI rendering, domain service abstractions, REST API Route Handlers, database pooling, and caching into a cohesive monorepo, completely eliminating cross-origin CORS overhead and multiple service deployment sprawl.

```mermaid
flowchart TD
    subgraph Client["Client Browser (Single-Page App Shell)"]
        UI["UI Layer<br/>(src/app/page.tsx, components/views/*)"]
        Theme["Theme Provider<br/>(localStorage: sv-theme)"]
        RQ["TanStack React Query v5<br/>(Cache & Invalidation)"]
        Services["Domain Service Layer<br/>(src/services/api/*.service.ts)"]
        ClientFetch["Typed Fetch Client<br/>(src/services/api/client.ts)"]

        UI --> RQ
        RQ --> Services
        Services --> ClientFetch
    end

    subgraph Server["Next.js 14 Fullstack Server (Vercel / Node runtime)"]
        RouteHandlers["Next.js Route Handlers<br/>(src/app/api/*)"]
        Validations["Runtime Schemas<br/>(src/lib/validations.ts)"]
        CacheLayer["Cache Subsystem<br/>(src/lib/cache/index.ts)"]
        PrismaClient["Prisma 7 Client<br/>(src/lib/prisma.ts)"]
        PgAdapter["@prisma/adapter-pg + pg.Pool"]

        ClientFetch -- HTTP JSON Requests --> RouteHandlers
        RouteHandlers --> Validations
        RouteHandlers --> CacheLayer
        RouteHandlers --> PrismaClient
        PrismaClient --> PgAdapter
    end

    subgraph External["External Services & Datastores"]
        Postgres[("PostgreSQL Database<br/>(Supabase / Remote Pool)")]
        YouTube["YouTube oEmbed API<br/>(youtube.com/oembed)"]
        CDNs["Media CDNs<br/>(Unsplash / Pexels / YouTube Img)"]

        PgAdapter -- TCP Connection Pool --> Postgres
        RouteHandlers -- HTTP GET --> YouTube
        UI -- Direct Image Load --> CDNs
    end
```

---

## 3. Main Components and Responsibilities

| Layer / Directory           | Primary Role                                                              | Key Implementation Files                                                                                                                                                                                                                        |
| :-------------------------- | :------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **App Entry & Layout**      | App initialization, font loading, global providers, and shell layout.     | `src/app/layout.tsx`, `src/app/page.tsx`, `src/lib/providers.tsx`                                                                                                                                                                               |
| **UI Views**                | High-density dashboard screens representing studio tools.                 | `src/components/views/*` (`global-vault-view.tsx`, `competitor-spy-view.tsx`, `project-workspace-view.tsx`, `projects-hub-view.tsx`, `settings-view.tsx`)                                                                                      |
| **Workspace Modals**        | Controlled creation and modification dialogues for records.               | `src/components/project-modal.tsx`, `src/components/inspiration-modal.tsx`, `src/components/asset-modal.tsx`, `src/components/note-modal.tsx`                                                                                                   |
| **Shared Shell Components** | Global top navigation, filter bar, tactile controls, and quick-capture.   | `src/components/top-header.tsx`, `src/components/sidebar.tsx`                                                                                                                                                   |
| **Client Hooks**            | Reactive data fetching and mutation handling via React Query.             | `src/hooks/use-projects.ts`, `src/hooks/use-inspirations.ts`, `src/hooks/use-assets.ts`                                                                                                                                                         |
| **Client API Services**     | Type-safe abstractions over HTTP endpoints using Zod schema verification. | `src/services/api/client.ts`, `src/services/api/project.service.ts`, `src/services/api/inspiration.service.ts`, `src/services/api/asset.service.ts`, `src/services/api/youtube.service.ts`                                                      |
| **API Route Handlers**      | Next.js server endpoints implementing REST handlers.                      | `src/app/api/projects/route.ts`, `src/app/api/projects/[id]/route.ts`, `src/app/api/inspirations/route.ts`, `src/app/api/inspirations/tag/route.ts`, `src/app/api/assets/route.ts`, `src/app/api/youtube/route.ts`, `src/app/api/channels/route.ts` |
| **Database & Cache Layer**  | Database pooling singleton and swappable Cache-Aside key-value store.     | `src/lib/prisma.ts`, `src/lib/cache/index.ts`, `prisma.config.ts`, `prisma/schema.prisma`                                                                                                                                                       |
| **Validation Layer**        | Zod schemas shared across API validation and UI form handling.            | `src/lib/validations.ts`                                                                                                                                                                                                                        |
| **Shared Types**            | Canonical TypeScript interfaces and inferred domain types.                | `src/types/index.ts`                                                                                                                                                                                                                            |
| **Constants & Config**      | Cache keys, API route paths, default query limits.                        | `src/lib/constants.ts`                                                                                                                                                                                                                          |
| **Design System & Theming** | Custom CSS variables, dark/light toggle, and tactile button animations.   | `src/styles/globals.css`, `tailwind.config.ts`, `src/lib/theme-provider.tsx`                                                                                                                                                                    |

---

## 4. Data Flow and Request Lifecycles

### 4.1 Inspiration Creation with YouTube Extraction

```mermaid
sequenceDiagram
    actor User
    participant Modal as InspirationModal (UI)
    participant YtService as youtubeService.fetchInfo()
    participant YtRoute as POST /api/youtube
    participant YouTube as YouTube oEmbed API
    participant InspService as inspirationService.create()
    participant InspRoute as POST /api/inspirations
    participant DB as PostgreSQL (Prisma)
    participant RQ as React Query Cache

    User->>Modal: Pastes YouTube URL & hits Enter
    Modal->>YtService: fetchInfo(url)
    YtService->>YtRoute: POST { url }
    YtRoute->>YouTube: GET /oembed?url=...&format=json
    YouTube-->>YtRoute: Returns title, author_name, thumbnail_url
    YtRoute-->>YtService: Returns parsed metadata + maxresdefault.jpg
    YtService-->>Modal: Auto-fills title, channelName, thumbnailUrl, sourceUrl
    User->>Modal: Selects project, enters note, clicks "Save Inspiration"
    Modal->>InspService: create(payload)
    InspService->>InspRoute: POST /api/inspirations
    InspRoute->>DB: prisma.inspiration.create() with nested ProjectInspiration
    DB-->>InspRoute: Inspiration Record
    InspRoute-->>InspService: JSON response (201)
    InspService-->>Modal: Success
    Modal->>RQ: invalidateQueries(["inspirations"]), invalidateQueries(["projects"])
    Modal-->>User: Closes modal; UI updates reactively
```

### 4.2 Project List Caching Flow (Cache-Aside)

1. **Client Request:** `useProjects()` fires `projectService.list()` via HTTP `GET /api/projects`.
2. **Server Cache Check:** Server invokes `withCache(cacheStore, CACHE_KEYS.PROJECTS_LIST, CACHE_TTL.PROJECTS_LIST_SECONDS, fetchFn)`.
3. **Cache Hit:** If `"projects:list"` exists and is unexpired in `cacheStore`, data returns immediately without database roundtrips.
4. **Cache Miss:** If key is missing or expired, `prisma.project.findMany(...)` queries PostgreSQL, stores the result in `cacheStore` with 60s TTL, and returns the fresh records.
5. **Mutation Invalidation:** When a user creates a project via `POST /api/projects`, `cacheStore.del(CACHE_KEYS.PROJECTS_LIST)` executes immediately after database commit to prevent stale reads.

### 4.3 Inspiration Tagging & Contextual Notes Flow

- Project-inspiration relationships are modeled through the `ProjectInspiration` join table with a composite primary key `(projectId, inspirationId)`.
- Tagging or toggling favorites calls `POST /api/inspirations/tag` which invokes `prisma.projectInspiration.upsert(...)`.
- Untagging an inspiration from a project calls `DELETE /api/inspirations/tag?projectId=...&inspirationId=...` which executes `prisma.projectInspiration.delete(...)`.

---

## 5. Key Directories and Important Files

```
snipvis/
├── .env.example             # Template for environment variables (DATABASE_URL, NEXT_PUBLIC_APP_URL)
├── biome.json               # Biome linter and formatter configuration
├── next.config.js           # Next.js configuration (reactStrictMode: true)
├── package.json             # Scripts, runtime dependencies, devDependencies
├── postcss.config.js        # PostCSS configuration for Tailwind CSS
├── prisma.config.ts         # Prisma 7 configuration file declaring datasource URL and migrations
├── tailwind.config.ts       # Design tokens, custom colors, tactile shadows, fonts
├── tsconfig.json            # TypeScript compiler configuration (strict: true, paths: @/*)
├── prisma/
│   ├── schema.prisma        # Database schema definitions and relations
│   ├── seed.ts              # Idempotent database seeder with automated schema safety
│   └── migrations/          # PostgreSQL migration files
│       ├── 20260927000000_init/
│       └── 20260928000000_add_script_to_project/
└── src/
    ├── app/
    │   ├── layout.tsx       # Root HTML layout with Google Font links
    │   ├── page.tsx         # Main interactive shell with URL state sync & Suspense
    │   └── api/
    │       ├── assets/route.ts              # GET /api/assets, POST /api/assets
    │       ├── inspirations/route.ts        # GET /api/inspirations, POST /api/inspirations
    │       ├── inspirations/tag/route.ts    # POST /api/inspirations/tag, DELETE /api/inspirations/tag
    │       ├── projects/route.ts            # GET /api/projects, POST /api/projects
    │       ├── projects/[id]/route.ts       # GET /api/projects/:id, PATCH /api/projects/:id
    │       └── youtube/route.ts             # POST /api/youtube (oEmbed scraper & thumbnail resolver)
    ├── components/
    │   ├── asset-modal.tsx                  # New asset creation modal
    │   ├── assets-view.tsx                  # Project asset cards and filter grid
    │   ├── brief-view.tsx                   # Project creative brief editor & progress tracker
    │   ├── script-editor.tsx                # Full-featured rich WYSIWYG video script editor
    │   ├── inspiration-modal.tsx            # Manual & YouTube inspiration capture dialog
    │   ├── note-modal.tsx                   # Project-specific note editor for inspirations
    │   ├── project-modal.tsx                # Project creation modal
    │   ├── sidebar.tsx                      # Navigation drawer & project list
    │   ├── top-header.tsx                   # Search capsule (⌘K), quick actions (N), theme toggle
    │   ├── ui/
    │   │   ├── button.tsx                   # Reusable button with variants
    │   │   └── card.tsx                     # Reusable card container
    │   └── views/
    │       ├── competitor-spy-view.tsx      # Outlier breakdown & import feed
    │       ├── global-vault-view.tsx        # High-density inspiration gallery
    │       ├── project-workspace-view.tsx   # Project tab container (Inspirations/Brief/Assets)
    │       ├── projects-hub-view.tsx        # Production pipeline overview & completion bars
    │       └── settings-view.tsx            # Theme appearance toggle & JSON backup exporter
    ├── hooks/
    │   ├── use-assets.ts                    # React Query hooks for assets
    │   ├── use-inspirations.ts              # React Query hooks for inspirations & tags
    │   └── use-projects.ts                  # React Query hooks for projects
    ├── lib/
    │   ├── cache/
    │   │   └── index.ts                     # Cache-Aside pattern (InMemory & Redis implementations)
    │   ├── constants.ts                     # Static cache keys, routes, and query parameters
    │   ├── format-inspirations.ts           # Enrichment helper for inspiration cards
    │   ├── prisma.ts                        # PrismaClient singleton with PrismaPg adapter
    │   ├── providers.tsx                    # ThemeProvider and QueryClientProvider wrapper
    │   ├── query-client.ts                  # TanStack QueryClient instance configuration
    │   ├── theme-provider.tsx               # Light/Dark mode state management & localStorage sync
    │   └── validations.ts                   # Zod schemas for input validation
    ├── services/
    │   └── api/
    │       ├── asset.service.ts             # Client API service for asset endpoints
    │       ├── client.ts                    # Fetch wrapper with error propagation & Zod parsing
    │       ├── inspiration.service.ts       # Client API service for inspirations & tags
    │       ├── project.service.ts           # Client API service for projects & seed trigger
    │       └── youtube.service.ts           # Client API service for YouTube extraction
    ├── styles/
    │   └── globals.css                      # CSS custom properties, utility classes, tactile buttons
    └── types/
        └── index.ts                         # Canonical shared types, interfaces, and DTO contracts
```

---

## 6. Entry Points and Startup Sequence

### 6.1 Server Startup Sequence

1. **Command:** `npm run dev` (or `npm run start`).
2. **Next.js Engine:** Boots Next.js 14.2.5 on default port `3000` (or `3001` if port `3000` is allocated).
3. **Route Discovery:** Dynamically compiles Route Handlers in `src/app/api/*` and App Router page components.
4. **Database Connection:** `src/lib/prisma.ts` initializes `pg.Pool` with `process.env.DATABASE_URL`, attaches `@prisma/adapter-pg`, and creates a cached global PrismaClient instance.
5. **Cache Store Initialization:** `src/lib/cache/index.ts` creates the in-memory map store `cacheStore`.

### 6.2 Client Ingestion & Initialization Sequence

1. **HTML & Fonts:** Browser parses `src/app/layout.tsx`, preconnecting to Google Fonts (`Plus Jakarta Sans` & `Space Grotesk`).
2. **Root Providers:** `src/lib/providers.tsx` mounts `ThemeProvider` and `QueryClientProvider`:
   - `ThemeProvider` reads `localStorage.getItem("sv-theme")` (or `prefers-color-scheme`), applying the `.dark` or `.light` class to `document.documentElement`.
   - `QueryClientProvider` registers TanStack Query client.
3. **CreatorLabShell Boot:** `src/app/page.tsx` mounts inside a React `Suspense` boundary.
4. **URL State Synchronization:** The shell parses search params (`view`, `project`, `tab`) to render either the active project workspace or one of the global studio tools.


---

## 7. External Dependencies and Integrations

| Dependency                           | Purpose                                                                  | Integration Method                                                                                                                |
| :----------------------------------- | :----------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| **PostgreSQL Database**              | Primary persistent store for all entities.                               | `@prisma/adapter-pg` + `pg.Pool` via `DATABASE_URL` in `src/lib/prisma.ts`.                                                       |
| **YouTube oEmbed API**               | Public, keyless metadata retrieval for video titles and author channels. | HTTP GET to `https://www.youtube.com/oembed` in `src/app/api/youtube/route.ts`.                                                   |
| **YouTube Image CDN**                | Direct retrieval of maximum resolution thumbnails (`maxresdefault.jpg`). | Constructed dynamically in `src/app/api/youtube/route.ts` using parsed 11-char video ID.                                          |
| **Unsplash / External CDNs**         | Demonstration images and textures for mock cards and assets.             | Remote URLs referenced directly in UI image tags.                                                                                 |
| **YouTube Data API v3** _(Optional)_ | Extended metadata extraction (video duration, view counts).              | Server-side environment configuration (`YOUTUBE_API_KEY`) if extended features are enabled. All keys must be sourced from `.env`. |

---

## 8. Authentication, Authorization, and Security Model

- **Authentication Status:** No authentication is currently implemented. Snipvis operates as a single-tenant studio tool or shared team deployment without user login credentials or session tokens.
- **Authorization Status:** All routes and API endpoints are public to anyone with network access to the server.
- **Data Validation & Sanitization:**
  - All mutating endpoints (`POST`, `PATCH`) strictly validate input payloads against Zod schemas in `src/lib/validations.ts` before triggering database operations.
  - Unexpected schema keys are stripped or rejected.
- **Database Safety:**
  - SQL injection is mitigated through Prisma's parameterized query engine.
  - Foreign key cascades are enforced in PostgreSQL via `onDelete: Cascade` on relations (`ProjectInspiration`, `ProjectAsset`).
- **Network Boundaries:**
  - Fastify and Render were previously discarded; all communication is local same-origin Next.js route handling, eliminating cross-origin CORS attack surfaces.
- **Secrets Management:**
  - All API keys and secrets must strictly reside in environment variables (`.env` on server), never collected or stored in browser client state / `localStorage`.

---

## 9. Configuration, Environment Variables, and Secrets

Environment variables are managed using standard `.env` files loaded at build and runtime.

| Variable              | Description                                                                                         | Required | Example                                                       |
| :-------------------- | :-------------------------------------------------------------------------------------------------- | :------: | :------------------------------------------------------------ |
| `DATABASE_URL`        | PostgreSQL connection string including user, password, host, port, and database name.               | **Yes**  | `postgresql://postgres:password@db.supabase.co:5432/postgres` |
| `NEXT_PUBLIC_APP_URL` | Base canonical application URL for self-referential links or client requests.                       |    No    | `http://localhost:3000`                                       |
| `YOUTUBE_API_KEY`     | Optional Google Cloud YouTube Data API v3 key if extended server-side metadata fetching is enabled. |    No    | `AIzaSy...`                                                   |

### Prisma 7 Configuration Note

Prisma 7 uses `prisma.config.ts` located at the project root to define schema location, migrations, datasource URL, and the seed script:

```typescript
// prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "node --experimental-strip-types prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

---

## 10. Build, Run, Test, and Tooling Commands

All commands are defined in `package.json`:

```bash
# Install dependencies
npm install

# Start development server (Next.js dev)
npm run dev

# Compile production build
npm run build

# Start production server
npm run start

# Static TypeScript typecheck (no emit)
npm run type-check
npm run check

# Run Biome linter checks across ./src
npm run lint

# Automatically format code across ./src with Biome
npm run format

# Run test suite with Vitest
npm run test

# Run a specific focused test file with Vitest
npx vitest run path/to/file.test.ts

# Run Vitest in watch mode for active development
npx vitest path/to/file.test.ts

# Generate Prisma Client after schema changes
npm run db:generate

# Apply migrations locally and create new migration if schema changed
npm run db:migrate

# Seed database via standalone seed script
npm run db:seed
npx prisma db seed

# Open Prisma Studio web inspector
npm run db:studio
```

---

## 11. Testing Strategy and Status

- **Runner:** Vitest (`^1.6.0`).
- **Target Test Architecture (Recommended):**
  - **Unit Tests:** Validations (`src/lib/validations.ts`), Cache Store operations (`src/lib/cache/index.ts`), constants (`src/lib/constants.ts`), and URL parsing logic in `youtube.service.ts`.
  - **Integration Tests:** Route handlers (`/api/projects`, `/api/inspirations`, `/api/assets`) utilizing a test PostgreSQL instance or an in-memory mock.
  - **Component Tests:** Studio views (`BriefView`, `InspirationModal`, `GlobalVaultView`) verifying React Query query invalidation on mutation.

---

## 12. Logging, Monitoring, and Error Handling

- **Database Logging:** `src/lib/prisma.ts` explicitly enables error and warning logging on the Prisma client:
  ```typescript
  return new PrismaClient({ adapter, log: ["error", "warn"] });
  ```
- **API Error Normalization:** Next.js Route Handlers wrap validation parsing errors in Zod exceptions and return standard JSON error objects with appropriate HTTP status codes:
  - `400 Bad Request`: Input payload validation failure or invalid YouTube URL.
  - `404 Not Found`: Project not found during `GET /api/projects/:id`.
  - `409 Conflict`: Unique constraint conflicts.
  - `500 Internal Server Error`: Sanitized unexpected server error.
- **Client-Side Exception Handling:**
  - `src/services/api/client.ts` intercepts non-2xx HTTP responses, extracts the `error` field from JSON, and throws standard JavaScript `Error` objects.
  - React components catch these errors and display inline contextual error banners (e.g. in `ProjectModal`, `InspirationModal`, `BriefView`).

---

## 13. Performance, Concurrency, and Caching Architecture

1. **Client-Side Invalidation:** TanStack React Query prevents redundant network calls during route transitions by caching queries indefinitely within session memory until explicitly invalidated via `qc.invalidateQueries(...)`.
2. **Server-Side Cache-Aside (`src/lib/cache/index.ts`):**
   - Implements generic `Store` contract: `get<T>(k)`, `set<T>(k, v, ttl)`, `del(k)`.
   - `createInMemoryStore`: Uses a local JavaScript `Map` with timestamps. Used in `GET /api/projects` (TTL: 60s).
   - `createRedisStore`: Ready-to-use adapter for Redis clients with `"EX"` expiration semantics.
3. **Database Connection Pooling:** Uses `pg.Pool` via `@prisma/adapter-pg` to avoid exhausting PostgreSQL connection limits under concurrent HTTP requests.
4. **Database Indexing:**
   - Unique index on `Project.slug`.
   - Composite primary key on `ProjectInspiration(projectId, inspirationId)` with an index on `projectId`.
   - Composite primary key on `ProjectAsset(projectId, assetId)`.

---

## 14. Known Limitations, Tech Debt, and Architectural Gotchas

1. **Missing Unit Tests:** Vitest is installed and configured in `package.json`, but no tests exist, causing `npm run test` to fail until tests are written.
2. **Biome Lint Diagnostics:**
   - Multiple `as any` type assertions previously existed in `src/app/api/assets/route.ts` and `src/app/api/inspirations/route.ts` for enum assignments. These must be replaced with strict types according to the Zero `any` policy.
   - Import order sorting (`organizeImports`) and `useImportType` rule flags will trigger warnings/errors when running `npm run lint`.
3. **Serverless Cache Isolation:** The in-memory cache store in `src/lib/cache/index.ts` is instantiated in process memory. On serverless environments (like Vercel), this cache is not shared across lambda instances. For multi-instance caching, `cacheStore` must be switched to `createRedisStore` with Upstash Redis or standard Redis.

5. **Legacy Residual Directory:** A `client/` folder exists at the repository root containing an old `.next/` build artifact from an earlier multi-repo / split architecture. It is unused and can be safely deleted.
6. **No Multi-Tenancy / User Authentication:** All data is global to the database instance. Multi-user separation requires adding a `User` model, workspace relations, and auth middleware (e.g. NextAuth/Auth.js or Supabase Auth).

---

## 15. Glossary

- **Inspiration:** A saved creative benchmark (thumbnail, retention hook, or title format).
- **CTR Formula:** A title or thumbnail layout designed specifically to maximize Click-Through Rate.
- **Hook:** The opening 5–30 seconds of a video designed to capture attention and prevent viewer drop-off.
- **Outlier:** A video that generates drastically higher views (e.g., 5x–15x) relative to the channel's historical baseline.
- **Creative Brief:** A project document consolidating hooks, target channels, external document links, and full video scripts.
- **Script Editor:** Embedded rich WYSIWYG video script editor with word count, character count, and speech timing.
- **PrismaPg:** Driver adapter (`@prisma/adapter-pg`) bridging Prisma 7 to `node-postgres` (`pg.Pool`).
- **Tactile Button:** Design system interactive button styling with hard drop shadows (`box-shadow: 0 3px 0 #D9381E`) that translate down on active press.

---

## 16. Code Placement & Where to Add New Code

| If You Are Adding...                  | Place It In...                                                                             |
| :------------------------------------ | :----------------------------------------------------------------------------------------- |
| **New API Route Handler**             | `src/app/api/<feature>/route.ts`                                                           |
| **New Validation Schema**             | `src/lib/validations.ts`                                                                   |
| **New Shared Domain Types / DTOs**    | `src/types/index.ts`                                                                       |
| **New Cache Key or Route Constant**   | `src/lib/constants.ts`                                                                     |
| **New Database Model / Field**        | `prisma/schema.prisma` (run `npm run db:migrate` and `npm run db:generate`)                |
| **New Client API Service Method**     | `src/services/api/<feature>.service.ts`                                                    |
| **New React Query Hook**              | `src/hooks/use-<feature>.ts`                                                               |
| **New Studio Tool or Dashboard View** | `src/components/views/<feature>-view.tsx`                                                  |
| **New Modal Dialog / Sheet**          | `src/components/<feature>-modal.tsx`                                                       |
| **New Base UI Primitive**             | `src/components/ui/<primitive>.tsx`                                                        |
| **New Test File**                     | Co-locate as `*.test.ts` or `*.test.tsx` next to the implementation or in `src/__tests__/` |

---

## 17. Developer Guardrails and Common Pitfalls

- 🚫 **Do Not Edit `client/`:** The `client/` folder is an obsolete residue from an old split-architecture setup. Do not touch or add files to `client/`.
- 🚫 **Do Not Commit `.env`:** Keep database credentials and secrets inside local `.env` only. Update `.env.example` when adding environment variables.
- 🚫 **Do Not Manually Alter `prisma/migrations/`:** Always use `npm run db:migrate` to create consistent SQL migrations.
- 🚫 **Avoid Bypassing Route Handlers:** Do not import `src/lib/prisma.ts` into client-side components (`"use client"`). Database calls are strictly server-side inside `src/app/api/*`.
- 🚫 **All Keys from Environment Variables:** Do not build client-side UI inputs or use `localStorage` for storing API keys. All service keys (such as `YOUTUBE_API_KEY`) must strictly be configured in `.env` and accessed server-side.
- 🚫 **Zero `any` Policy:** Do not use `any` in TypeScript files. Use explicit types from `@prisma/client`, `src/types/`, or Zod inferences.
- 🚫 **No Automatic Git Commits or Pushes:** Do NOT commit (`git commit`) or push (`git push`) to GitHub. All version control staging, committing, and pushing must be performed manually by the user.
- ⚠️ **Be Mindful of Cache Invalidation:** If adding mutations to `/api/projects`, always invalidate or delete the `projects:list` cache key in `cacheStore` (`src/lib/cache/index.ts`).
- ⚠️ **Vitest No-Test Error:** Running `npm run test` will exit with code 1 until at least one `*.test.ts` file is created.

---

## 18. Open Questions

- `TODO: verify` **Automated Test Suite:** Should Vitest be configured with jsdom/happy-dom for component testing, or restricted to unit testing server services and Zod schemas?
- `TODO: verify` **Legacy `client/` Directory:** Can the obsolete `client/` folder at the project root be safely removed from the repository?
- `TODO: verify` **Production Cache Provider:** When deploying to Vercel production, should Upstash Redis be configured to replace `createInMemoryStore` in `src/lib/cache/index.ts`?
- `TODO: verify` **Authentication Strategy:** Is multi-tenant user authentication planned (e.g., Supabase Auth or Auth.js/NextAuth), or will this remain a single-tenant studio tool?
- `TODO: verify` **Git Repository Root:** Is this directory intended to be an independent git repository, or part of a parent monorepo workspace?
