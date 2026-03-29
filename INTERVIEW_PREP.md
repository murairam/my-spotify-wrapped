# My Spotify Wrapped — Dedale Intelligence Interview Cheat Sheet

**Interview:** 1-hour technical + motivational · Gauthier (Tech Lead) + Pierre (Fullstack Dev)
**Format:** Walk-through of past experience → TypeScript/React proficiency → Project showcase → Motivation → Your questions

---

## PART 1 — Your Journey (Opening)

**Prep your 2-minute intro:**

> "I'm Mari, a final-year student at 42 School in Paris. My background is full-stack TypeScript — I've built a production-deployed AI music analytics platform with Next.js and NestJS, and at 42 I'm working on a large-scale Docker microservices project called ft_transcendence. I'm drawn to Dedale because you're applying serious engineering to intelligence-driven products, and your stack — NestJS, React, GraphQL — is exactly what I want to go deeper on."

---

## PART 2 — Project Showcase (Most Important Section)

### Screen Share Script

1. **Open the live app** at `my-spotify-wrapped-one.vercel.app` (or run locally).
2. **Intro line:**
   *"This is My Spotify Wrapped — a full-stack TypeScript app that pulls your Spotify listening history, computes music intelligence metrics, and feeds them to Mistral AI to generate a personality profile, artist recommendations, and curated playlists."*
3. **Show the architecture decision:**
   *"Frontend is Next.js 16 with App Router on Vercel. The backend is a NestJS REST API containerized with Docker, deployed to Google Cloud Run. For auth, I use NextAuth.js with a custom JWT refresh callback — the access token is silently refreshed before it expires so the user never gets logged out mid-session."*
4. **Demo the AI section:**
   *"The AI pipeline sends structured Spotify data to Mistral — it returns a JSON response that includes a music DNA card, spirit animal, mood analysis, new artist recommendations, and narrative text."*
5. **Wrap up:**
   *"The next step I'd take is replacing the Next.js API routes with the NestJS service, and switching the data layer to GraphQL — which is actually your exact stack."*

### Hardest Technical Challenges

**1. Spotify OAuth Token Refresh**
- Spotify tokens expire every 60 minutes.
- Solved this by intercepting the JWT callback in NextAuth: if `Date.now() >= token.expiresAt * 1000`, call Spotify's `/api/token` with `grant_type: refresh_token`.
- Store the new token in the JWT, propagate to session. User never has to re-authenticate.
- Edge case: if refresh fails (revoked permission), session is invalidated and user is redirected to login.

**2. Structured JSON from an LLM**
- Getting Mistral to return consistent JSON reliably required prompt engineering: explicit schema in the system prompt, examples of valid output, and a JSON mode flag.
- Added a fallback — if the response can't be parsed as JSON, the error boundary shows a friendly message rather than crashing.

**3. Monorepo Deployment Split**
- Vercel must only build the frontend; added `.vercelignore` to exclude `backend/`.
- Cloud Run uses `backend/Dockerfile.backend` independently.
- Local dev: `docker-compose.yml` at root spins up both services together.

---

## PART 3 — TypeScript Proficiency

**Q: `interface` vs `type` — which do you use when?**

- `interface` for object shapes and class contracts — it's open (can be re-declared/merged), which is useful for library extension.
- `type` for unions, intersections, mapped types, and aliases.
- In my project I used both: `interface SpotifyTrack` for the data shape, `type AIAnalysis = AIAnalysisResponse & { debug?: ... }` for composing types.

**Q: What are generics and where did you use them?**

- Generics let you write reusable type-safe code without committing to a concrete type.
- Example from my codebase: `useQuery<SpotifyData, SpotifyError>` — TanStack Query is fully generic, so the return type of the hook and the error type are precisely typed.
- Also used in the API response wrapper: `fetch(...).json() as SpotifyData & { error?: string }`.

**Q: Three utility types?**

- `Partial<T>` — all properties optional. Use for PATCH payloads.
- `Pick<T, K>` — subset of keys. Use for DTOs to expose only needed fields.
- `Omit<T, K>` — exclude keys. Use for hiding sensitive fields (e.g. `Omit<User, 'passwordHash'>`).
- `Record<K, V>` — used in my project for `discoveryMetrics` lookup maps.

**Q: Union vs intersection types?**

- Union `A | B` — value is one of several types. I used `string | number` for flexible Spotify API responses.
- Intersection `A & B` — value satisfies all types. Used `AIAnalysisResponse & { debug?: ... }` to extend the shared type locally.

**Q: `unknown` vs `any`?**

- `any` disables type checking entirely — unsafe.
- `unknown` is the safe version: you must narrow the type before using it. I used `unknown` for error catches and then checked `instanceof Error` before accessing `.message`.

---

## PART 4 — NestJS

**Q: Why extract the backend to NestJS?**

- Separation of concerns: decouples UI rendering from business logic and API integrations.
- Scalability: backend can scale independently, be owned by a separate team.
- NestJS's DI system makes code modular and testable — services can be mocked in unit tests.
- Aligns with industry best practices and Dedale's stack.

**Q: Core NestJS building blocks?**

- **Module** — groups related code; every app has at least `AppModule`. Declares what a feature owns (`providers`, `controllers`) and what it shares (`exports`).
- **Controller** — handles routing via decorators (`@Get()`, `@Post()`). Thin layer — no business logic.
- **Provider/Service** — marked `@Injectable()`, holds business logic, injected via constructor DI.

**Q: What is Dependency Injection?**

- A design pattern where a class declares its dependencies and a container provides them — rather than the class creating them.
- NestJS uses an IoC container: annotate with `@Injectable()`, register as a provider in a module, and NestJS injects it via constructor at runtime.
- Benefit: easy to swap implementations (e.g. mock a service in tests without changing business logic).

**Q: Guards vs Pipes vs Interceptors vs Middleware?**

| | Purpose | When it runs |
|---|---|---|
| **Middleware** | Raw HTTP processing (logging, req mutation) | Before route handler |
| **Guard** | Authorization — returns true/false | After middleware |
| **Pipe** | Validation and transformation of input | Before handler, on args |
| **Interceptor** | Cross-cutting concerns: logging, response shaping, caching | Around the handler (before + after) |

**Q: What is a DTO?**

- Data Transfer Object — a class defining the expected shape of incoming data.
- Combined with `class-validator` decorators (`@IsEmail()`, `@IsNotEmpty()`) and `ValidationPipe`, NestJS auto-validates and strips unsafe properties.
- Prevents malformed or malicious data from reaching the service layer.

**Q: How would you add authentication to NestJS?**

- `@nestjs/passport` + `passport-jwt`.
- Create `JwtStrategy` that validates the token, `JwtAuthGuard` that applies it.
- The guard calls `canActivate()`, runs the strategy, attaches decoded user to `req.user`.
- Apply globally or per route with `@UseGuards(JwtAuthGuard)`.

---

## PART 5 — GraphQL (Dedale uses this — know the basics)

**Q: What is GraphQL and how is it different from REST?**

- GraphQL is a query language where the client specifies exactly which fields it needs from a single endpoint (`/graphql`).
- No over/under-fetching — you get exactly what you ask for.
- Strongly typed schema — the schema IS the API contract; introspectable at runtime.
- REST: multiple endpoints + HTTP verbs. GraphQL: one endpoint, three operation types.

**Q: Three operation types?**

- **Query** — read data (like GET).
- **Mutation** — write/modify data (like POST/PUT/DELETE).
- **Subscription** — real-time stream over WebSocket (server pushes updates to client).

**Q: What is a resolver?**

- A function that fetches the actual data for a specific field in the schema.
- In NestJS code-first: `@Resolver()` class with `@Query()` / `@Mutation()` methods.
- Receives `(parent, args, context, info)` as arguments.

**Q: What is the N+1 problem and how do you solve it?**

- Fetching a list of N items, each triggering a separate DB query for a related field = N+1 total queries.
- Solution: **DataLoader** — batches and deduplicates individual lookup calls within a single event loop tick, collapsing N queries into 1.

**Q: `type` vs `input` in GraphQL schema?**

- `type` — output type, what the server returns. Can reference other types.
- `input` — input type for mutations/queries. Can only contain scalar types and other input types. Enforces separation between what you send and what you receive.

**Q: Why do you want to work with GraphQL?**

> "My project uses REST because the data flow is linear and predictable — straightforward GET endpoints. But GraphQL is the right tool for Dedale's product: you have complex, relational intelligence data across analysts, reports, and market professionals. GraphQL lets the client request exactly what it needs, which matters for a product where different consumers (internal tools vs. customer dashboards) need different views of the same data. I'm actively learning it and I'm excited to use it in production."

---

## PART 6 — React & Frontend

**Q: React vs Vue — can you pick up Vue?**

- Both are component-based with similar mental models (state, props, lifecycle, reactivity).
- React uses JSX, Vue uses SFCs (`.vue` files with `<template>`, `<script>`, `<style>`).
- Vue's Options API is more structured for beginners; Composition API is very similar to React hooks.
- Given my depth in React, I'm confident I'd be productive in Vue quickly — the paradigm shift is small.

**Q: What is TanStack Query and why did you use it?**

- Server-state management library. Handles caching, background refetching, loading/error states, and retries.
- Used it in my project to cache Spotify data with `staleTime: 5 min` / `gcTime: 30 min` — prevents hammering the Spotify API on every render.
- Configured exponential backoff retry: `retryDelay: (n) => Math.pow(2, n) * 1000` (1s, 2s, 4s).
- Disabled `refetchOnWindowFocus` to prevent unnecessary re-fetches when the user alt-tabs.

**Q: Explain React's useCallback and why you used it.**

- `useCallback` memoizes a function reference so it doesn't get re-created on every render.
- Used it for `analyzeData` in `useAIAnalysis` — the function is passed to child components and if not memoized would trigger re-renders down the tree on every parent render.

**Q: What is SSR and why does Next.js use it?**

- Server-Side Rendering — HTML is generated on the server before being sent to the client.
- Benefits: faster First Contentful Paint, better SEO (crawlers see real content), progressive enhancement.
- Next.js App Router makes SSR/SSG/ISR composable at the component level with React Server Components.

---

## PART 7 — Docker & Infrastructure

**Q: What is Docker and why did you use it?**

- Docker packages an application and its dependencies into a portable container.
- Used it to containerize the NestJS backend: guarantees the same runtime on my laptop, CI, and Cloud Run.
- `docker-compose.yml` at root spins up frontend + backend together for local development.

**Q: What is the difference between a Dockerfile and docker-compose?**

- `Dockerfile` — recipe to build a single image.
- `docker-compose.yml` — orchestrates multiple containers together, handles networking, environment variables, and volumes. Good for local development; not for production at scale (use Kubernetes for that).

**Q: What is CI/CD?**

- Continuous Integration: automated builds and tests run on every push.
- Continuous Deployment: on passing tests, code is automatically deployed to staging or production.
- I set this up with GitHub Actions in the project.

---

## PART 8 — Motivation Questions

**Q: Why Dedale?**

> "Dedale is interesting to me for two reasons. First, you're applying engineering to intelligence and information — a domain where data quality and the depth of analysis actually matter. Second, your tech stack (NestJS, React, GraphQL) is the direction I've been intentionally moving toward — my project already has NestJS deployed, and GraphQL is my clear next step. I want to work somewhere where the engineering problems are real and the team cares about doing it right."

**Q: Why a fast-paced early-stage team?**

> "At 42 School I've learned almost entirely by building under pressure — no teachers, just specs and a deadline. I'm used to figuring things out, making decisions with incomplete information, and iterating quickly. Early-stage means my contributions have visible impact, and the pace pushes me to grow faster than a large corporate environment would."

**Q: What are your technical weaknesses?**

> "I haven't used GraphQL in production yet — I know the concepts well and I'm actively learning it, but I haven't shipped it. That's actually one of the things that excites me about this role. I also want to go deeper on testing — I write unit tests but I want more experience with integration and E2E testing at scale."

---

## PART 9 — Questions to Ask Dedale

- "What does the typical lifecycle of a feature look like — from product requirement to deployed code?"
- "What does the GraphQL schema currently look like — code-first or schema-first? Which ORM are you using?"
- "How do you handle schema evolution and versioning as the product grows?"
- "What's the biggest technical challenge the team is working through right now?"
- "What does the onboarding process look like for an intern — what's a realistic first contribution in week 2?"
- "How do you balance velocity with code quality at this stage of the company?"

---

## PART 10 — Day-of Checklist

- [ ] Live app is running locally on port 3000 (`npm run dev`)
- [ ] NestJS backend is running on port 4000 (`cd backend && npm run start:dev`)
- [ ] Spotify account has data (top tracks loaded)
- [ ] Demo mode works (no auth needed) as fallback
- [ ] Screen share is tested and the browser tab is clean
- [ ] Mic and camera are tested
- [ ] Two tabs open: live app + GitHub repo for showing code

**Good luck. You've got this.**
