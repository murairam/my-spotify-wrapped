# My Spotify Wrapped

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4)](https://tailwindcss.com/)
[![Mistral AI](https://img.shields.io/badge/Mistral_AI-Integrated-purple)](https://mistral.ai/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black)](https://my-spotify-wrapped-one.vercel.app/)

A full-stack, AI-enhanced music analytics platform — a richer, always-available alternative to Spotify's annual Wrapped. It pulls your real Spotify listening data, computes music intelligence metrics, and sends them through Mistral AI to generate personality insights, narrative analysis, artist recommendations, and curated playlists.

**Live demo:** [my-spotify-wrapped-one.vercel.app](https://my-spotify-wrapped-one.vercel.app)

> **Demo Mode** is available on the live deployment — no login needed. For full Spotify integration, clone the project locally or contact me to be added as a test user.

---

## Features

- **Spotify OAuth** — Secure login via NextAuth.js; access tokens are refreshed automatically and transparently.
- **Multi-timeframe Stats** — Top tracks, top artists, and top genres across three time ranges: last 4 weeks, 6 months, and all time.
- **Music Intelligence Metrics** — Computed scores for mainstream taste, artist diversity, underground %, and vintage collector %.
- **AI Intelligence Suite** — Full Mistral AI analysis producing:
  - Music DNA card and personality profile
  - Spirit animal + three-word tagline
  - Mood and emotional description
  - New artist recommendations with per-artist reasoning
  - AI-curated playlist suggestions matched against real live Spotify playlists
  - A narrative analysis paragraph written specifically about your listening habits
- **Recently Played Timeline** — Visual history of recent listening sessions.
- **Demo Mode** — Explore the full UI with realistic mock data, no authentication required.

---

## Tech Stack

### Frontend

| Technology | Version | Role |
|---|---|---|
| Next.js (App Router) | ^16.2.1 | Framework, SSR, file-based routing, API routes |
| React | ^18 | UI rendering |
| TypeScript | ^5 | End-to-end type safety |
| Tailwind CSS | ^3.4.1 | Utility-first styling, glassmorphism effects |
| TanStack Query | ^5.87.4 | Server-state caching, background refetch, retry logic |
| next-auth | ^4.24.11 | Spotify OAuth 2.0, JWT session management, token refresh |

### API Routes (`src/app/api/`)

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/[...nextauth]` | GET / POST | NextAuth handler — OAuth callback, session, JWT |
| `/api/spotify/top-items` | GET | Top tracks, artists, genres, discovery metrics |
| `/api/spotify/search` | GET | Artist and track search |
| `/api/spotify/search-playlists` | GET | Playlist search with optional track hydration (5 min cache) |
| `/api/spotify/search-track` | GET | Single track lookup (5 min cache) |
| `/api/mistral/analyze` | POST | Full AI analysis of Spotify data |
| `/api/mistral/playlists` | POST | AI playlist suggestions with 8 s timeout and graceful fallback |

### External APIs

| API | Purpose |
|---|---|
| Spotify Web API | Top items, recently played, search, user profile |
| Mistral AI (`mistral-small-latest`) | Music personality analysis, recommendations, narrative |

### Optional Microservice (`backend/`)

A NestJS service (port 4000) that mirrors the top-items API logic using `spotify-web-api-node`. Intended for load-separated deployments on Google Cloud Run. The main application does not depend on it.

---

## Local Development Setup

### Prerequisites

- Node.js 24+
- A [Spotify Developer](https://developer.spotify.com/dashboard) app
- A [Mistral AI](https://console.mistral.ai) API key

### 1. Clone the repository

```bash
git clone https://github.com/murairam/my-spotify-wrapped.git
cd my-spotify-wrapped
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# NextAuth — must match the redirect URI registered in your Spotify app
NEXTAUTH_URL=http://127.0.0.1:3000
NEXTAUTH_SECRET=any-long-random-string

# Spotify Developer Dashboard credentials
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Mistral AI
MISTRAL_API_KEY=your_mistral_api_key
```

In your [Spotify Developer Dashboard](https://developer.spotify.com/dashboard), add this redirect URI:

```
http://127.0.0.1:3000/api/auth/callback/spotify
```

> **Spotify development mode**: Only allowlisted accounts can log in. Add your Spotify email under *Users and Access* in the dashboard.

### 4. Run the development server

```bash
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

### 5. (Optional) Run the NestJS microservice

```bash
cd backend && npm install && npm run start:dev
```

The backend API runs on port 4000.

---

## Project Structure

```
my-spotify-wrapped/
├── src/
│   ├── app/
│   │   ├── api/                    # Next.js API routes
│   │   │   ├── auth/[...nextauth]/ # NextAuth handler
│   │   │   ├── spotify/            # Spotify data routes
│   │   │   └── mistral/            # AI analysis routes
│   │   ├── layout.tsx              # Root layout — ReactQueryProvider + Vercel Analytics
│   │   └── page.tsx                # Entry point
│   ├── components/
│   │   ├── Dashboard.tsx           # Main dashboard — time range selector + stats
│   │   ├── LandingPage.tsx         # Auth gate + entry UI
│   │   ├── RecentlyPlayedTimeline.tsx
│   │   └── ai/                     # AI-powered display components
│   │       ├── AIIntelligenceSection.tsx
│   │       ├── MusicDNACard.tsx
│   │       ├── AIPersonalityCard.tsx
│   │       ├── MusicSpiritAnimal.tsx
│   │       ├── AIPlaylistRecommendations.tsx
│   │       ├── ArtistRecommendations.tsx
│   │       ├── MoodAnalysisCard.tsx
│   │       └── AIStory.tsx
│   ├── hooks/
│   │   ├── useSpotifyData.ts       # TanStack Query wrapper for Spotify data
│   │   └── useAIAnalysis.ts        # State + fetch logic for Mistral analysis
│   ├── lib/
│   │   ├── auth.ts                 # next-auth config, token refresh logic
│   │   └── mockData.ts             # Demo mode data
│   ├── providers/
│   │   └── ReactQueryProvider.tsx  # Global QueryClient config
│   └── types/
│       └── spotify.ts              # All TypeScript interfaces
├── backend/                        # Optional NestJS microservice
├── types/
│   └── next-auth.d.ts              # Session/JWT type augmentation
├── docs/                           # Architecture and interview documentation
├── Dockerfile.frontend
├── Dockerfile.backend
└── docker-compose.yml
```

---

## Deployment

- **Frontend** → Vercel. Push to `main`, deploys automatically.
- **Backend (optional)** → Google Cloud Run via `backend/Dockerfile.backend`.
- **Local full-stack** → `docker-compose up --build` runs both services in containers.

---

## Development Story

This project started as a submission for the Mistral AI Internship Application but grew into something far more involved. What was meant to be a couple of days of work turned into two-plus weeks of deep work — learning the Next.js App Router in depth, wrestling with OAuth token lifecycle edge cases, and doing a lot of prompt engineering to get consistent structured JSON out of an LLM.

Most of the late-stage work happened at **KB Coffeeroasters**. The baristas know me by name now.

**AI assistance**: Built with help from Mistral AI Chat and Claude AI Chat for architecture decisions and debugging.

---

## Contact

- **Email**: [marimiilpalu@gmail.com](mailto:marimiilpalu@gmail.com)
- **Issues**: [GitHub Issues](https://github.com/murairam/my-spotify-wrapped/issues)

---

*Built by Mari Miilpalu — 42 School student, exploring the intersection of music, data, and AI.*
