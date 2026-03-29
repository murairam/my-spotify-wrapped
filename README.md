# My Spotify Wrapped 🎵

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-blue)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4)](https://tailwindcss.com/)
[![Spotify Web API](https://img.shields.io/badge/Spotify_API-v1.0-green)](https://developer.spotify.com/documentation/web-api/)
[![Mistral AI](https://img.shields.io/badge/Mistral_AI-Integrated-purple)](https://mistral.ai/)

**A sophisticated, year-round alternative to Spotify Wrapped** — providing deep, interactive insights into your music listening habits with advanced analytics, real-time data, and AI-powered recommendations.

🔗 **[Try Live Demo on Vercel](https://my-spotify-wrapped-one.vercel.app/)** | 📖 **[Documentation](#documentation)**

> **New**: AI playlist suggestions now pair Mistral-curated mixes with live Spotify search results, so every recommendation links to a real playlist you can open immediately.

> **🚀 Deployed on Vercel**: The application is live and ready to test! You can try the **Demo Mode** with sample data, or contact me to be added as a test user for the full Spotify integration.

---

## 🎯 Project Overview

**My Spotify Wrapped** is a **full-stack web application** that delivers a **comprehensive, interactive dashboard** for analyzing your Spotify listening history. Unlike Spotify's annual Wrapped, this tool offers **real-time, multi-timeframe analytics**, **personalized AI insights**, and **music intelligence** — all wrapped in a sleek, mobile-first interface with glassmorphism design.

Built for music enthusiasts, developers, and data lovers, it showcases modern web development practices and AI integration.

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18.17.0
- npm/yarn/pnpm
- [Spotify Developer Account](https://developer.spotify.com/dashboard/)
- [Mistral AI API Key](https://console.mistral.ai/) (optional, for AI features)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/murairam/my-spotify-wrapped.git
   cd my-spotify-wrapped
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

   Configure your `.env.local` file:
   ```env
   # NextAuth Configuration
   NEXTAUTH_URL=http://127.0.0.1:3000
   NEXTAUTH_SECRET=your-nextauth-secret-key-here

   # Spotify API Credentials
   SPOTIFY_CLIENT_ID=your-spotify-client-id
   SPOTIFY_CLIENT_SECRET=your-spotify-client-secret

   # Mistral AI (Optional - for AI features)
   MISTRAL_API_KEY=your-mistral-api-key
   ```

4. **Configure Spotify App:**
   - Visit [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
   - Create a new app or use existing one
   - Add `http://127.0.0.1:3000/api/auth/callback/spotify` to Redirect URIs
   - Copy Client ID and Client Secret to your `.env.local`

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Deployment

**🚀 Live on Vercel**: The application is deployed and accessible at [https://my-spotify-wrapped-one.vercel.app/](https://my-spotify-wrapped-one.vercel.app/)


### Local Docker Compose (for development)

To run both frontend and backend locally with Docker Compose:

```bash
docker-compose up --build
```

This uses the root-level `Dockerfile.backend` and `Dockerfile.frontend` for backend and frontend services, respectively.

### Production Deployment

- **Backend:** Deploy to Google Cloud Run using the root-level `Dockerfile.backend`.
- **Frontend:** Deploy to Vercel (Dockerfile not used by Vercel).

**Spotify API Limitation**: The live deployment runs in Spotify's development mode, which requires manual approval of test users. Contact me to be added to the approved users list, or clone the project locally for unrestricted access with your own Spotify app credentials.

---

<a id="documentation"></a>
## 📖 Documentation

### API Endpoints

The application exposes several API routes for data fetching and AI analysis:

- **`/api/auth/[...nextauth]`** - NextAuth.js authentication handler
- **`/api/spotify/profile`** - User profile data
- **`/api/spotify/top-items`** - Top tracks and artists with time range support
- **`/api/spotify/recently-played`** - Recent listening history
- **`/api/spotify/playlists`** - User playlists and metadata
- **`/api/spotify/search-playlists`** - Finds real Spotify playlists to pair with AI recommendations (with short-lived caching)
- **`/api/mistral/analyze`** - AI-powered music analysis and recommendations


### Component Architecture (Partial)

```
src/components/
├── ai/                    # AI-powered components
│   ├── AIAnalysisSpotlight.tsx
│   ├── AIIntelligenceSection.tsx
│   ├── AIPersonalityCard.tsx
│   ├── AIPlaylistRecommendations.tsx
│   ├── AIStory.tsx
│   ├── ArtistRecommendations.tsx
│   ├── MoodAnalysisCard.tsx
│   ├── MusicDNACard.tsx
│   └── MusicSpiritAnimal.tsx
├── concerts/              # Concert finder
│   └── ConcertFinderSection.tsx
├── Dashboard.tsx
├── ErrorHandling.tsx
├── LandingPage.tsx
├── RecentlyPlayedTimeline.tsx
└── ...
```

### Environment Variables

```env
# Required for authentication
NEXTAUTH_URL=your-domain-or-localhost
NEXTAUTH_SECRET=random-secret-key

# Spotify API (required)
SPOTIFY_CLIENT_ID=from-spotify-developer-dashboard
SPOTIFY_CLIENT_SECRET=from-spotify-developer-dashboard

# Mistral AI (optional - enables AI features)
MISTRAL_API_KEY=from-mistral-console
```

### Spotify App Configuration

1. Create app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Add these scopes: `user-read-private`, `user-read-email`, `user-top-read`, `user-read-recently-played`, `playlist-read-private`
3. Set redirect URI: `http://localhost:3000/api/auth/callback/spotify` (development)
4. For production, add: `https://your-domain.com/api/auth/callback/spotify`

### Troubleshooting

**Common Issues:**

- **"Invalid client" error**: Check your Spotify Client ID and Secret
- **"Redirect URI mismatch"**: Ensure redirect URI matches exactly in Spotify dashboard
- **AI features not working**: Verify `MISTRAL_API_KEY` is set correctly
- **No data showing**: Check if user has sufficient Spotify listening history

**Development Tips:**

- Use `npm run dev` for development with hot reload
- Check browser console for API errors
- Verify environment variables with `echo $VARIABLE_NAME`
- Test with different time ranges if data seems incomplete

---

## 🌟 Key Features

| Feature | Description |
|---------|-------------|
| **🎵 Top Tracks & Artists** | Interactive rankings across multiple time periods (4 weeks, 6 months, all-time) with popularity indicators |
| **🎨 Genre Intelligence** | Advanced genre analysis with distribution charts and discovery trends |
| **🕒 Listening Patterns** | Time-based activity analysis and detailed listening habit insights |
| **🎧 Audio Profile** | Deep musical taste analysis (energy, danceability, valence, acousticness, etc.) |
| **🧠 AI-Powered Insights** | **Mistral AI integration** providing personalized music intelligence and recommendations |
| **🔍 AI + Live Playlists** | New AI playlist suggestions enriched with real Spotify search results and fallback gradients |
| **📱 Recently Played Timeline** | Real-time tracking with audio previews and social sharing capabilities |
| **📊 Music Intelligence** | Advanced metrics including mainstream vs. underground preferences, discovery patterns |
| **🎪 Interactive Dashboard** | Glassmorphism UI with responsive charts and touch-friendly interactions |
| **⚡ Real-Time Data** | Live sync with Spotify API and comprehensive completion scores |
| **📋 Playlist Analysis** | Intelligent analysis of owned vs. followed playlists with metadata insights |

---

## 🛠 Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Chart.js, React Chart.js 2 |
| **Backend** | Next.js API Routes, NextAuth.js (Spotify OAuth), Spotify Web API Node |
| **AI Integration** | Mistral AI API for music intelligence and personalized recommendations |
| **State Management** | React Context API, TanStack Query for data fetching |
| **UI Components** | React Icons, FontAwesome, Custom glassmorphism components |
| **Dev Tools** | ESLint, PostCSS, TypeScript, npm |
| **Deployment** | Vercel-ready configuration |

---

## 📊 API Integration

The application integrates with **10+ Spotify Web API endpoints**:

- **User Profile & Social**: Profile data, followed artists, created playlists
- **Top Items**: Top tracks and artists across different time ranges
- **Listening History**: Recently played tracks with timestamps
- **Audio Features**: Energy, danceability, valence, acousticness analysis
- **Search & Recommendations**: Music discovery and playlist generation

**AI Enhancement**: Mistral AI processes Spotify data to generate personalized insights, mood analysis, and intelligent music recommendations.

---

## 🎨 Design Philosophy

- **Glassmorphism UI**: Modern, translucent design with backdrop blur effects
- **Spotify-Inspired**: Dark theme with green accent colors matching Spotify's design language
- **Mobile-First**: Fully responsive design optimized for all device sizes
- **Accessibility**: WCAG-compliant color contrast and keyboard navigation support
- **Performance**: Optimized images, lazy loading, and efficient data fetching

---

## 🏗 Project Structure


```bash
my-spotify-wrapped/
├── backend/                  # (No Dockerfile here; see root)
├── public/                   # Static assets and images
├── scripts/                  # Mock/test data
├── src/
│   ├── app/                  # Next.js App Router
│   ├── components/           # Reusable UI components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions and API clients
│   ├── providers/            # React context providers
│   └── types/                # TypeScript type definitions
├── types/                    # NextAuth types
├── Dockerfile.backend        # Used for backend in Docker Compose & Cloud Run
├── Dockerfile.frontend       # Used for frontend in Docker Compose
├── docker-compose.yml        # Local dev orchestration
├── .vercelignore             # Excludes backend from Vercel builds
├── .env.example              # Environment variables template
├── next.config.js            # Next.js config
├── package.json              # Dependencies and scripts
└── ...
```

---

## 🧑‍💻 Development Story

This project started as a simple idea for the [Mistral AI Internship Application](https://jobs.lever.co/mistral/a6980b07-e55a-427c-a985-38ecd1e2eea6) but evolved into something much more ambitious.

**What began as a "couple of days" project turned into over two weeks of intensive development**, fueled by countless flat whites and filter coffees at **KB Coffeeroasters** (and yes, my wallet felt every single euro spent on premium coffee ☕).

### The Journey

- **Initial Goal**: Create a simple Spotify data visualization for Mistral AI application
- **Reality**: Fell down a rabbit hole of music analytics, AI integration, and polished UX design
- **Learning Curve**: Mastered Next.js App Router, TypeScript patterns, Spotify Web API intricacies
- **AI Integration**: Deep dive into Mistral AI API for music intelligence features
- **Coffee Consumption**: Immeasurable amounts at KB Coffeeroasters (the baristas know me by name now)

### Technical Achievements

- **Full-Stack Architecture**: From OAuth authentication to AI-powered analytics
- **Real-Time Data Processing**: Efficient handling of large Spotify datasets
- **Advanced Visualizations**: Custom Chart.js implementations with interactive features
- **AI Integration**: Sophisticated prompt engineering for music personality analysis
- **Performance Optimization**: Image optimization, caching, and responsive design


**AI Assistance**: This project was built with significant help from **Mistral AI Chat** and **Claude AI Chat** for problem-solving, code review, and architectural decisions. The AI integration features were particularly enhanced through iterative collaboration with AI tools.

---

## 🐳 Docker & Deployment Notes

- Only the root-level `Dockerfile.backend` and `Dockerfile.frontend` are used for local Docker Compose.
- The backend is deployed to Cloud Run using `Dockerfile.backend`.
- The frontend is deployed to Vercel (Dockerfile not used by Vercel).
- `.vercelignore` ensures the backend is not included in Vercel builds.

---

---

## 🔧 Usage Options

| Option | Description | Status |
|--------|-------------|--------|
| **🔑 Personal Setup** | Clone and run locally with your Spotify credentials | ✅ Available |
| **🎭 Demo Mode** | Test the interface with sample data on the [live deployment](https://my-spotify-wrapped-one.vercel.app/) | ✅ [Available](https://my-spotify-wrapped-one.vercel.app/) |
| **👥 Test User Access** | Contact me to be added to the approved test users list for full Spotify integration | ✅ Available |

> **📝 Note about Spotify API**: Due to Spotify's development mode restrictions, I need to manually add test users to access the full Spotify integration on the live deployment. If you want to test with your own Spotify data without cloning the project, please contact me and I'll add your Spotify email to the approved users list.

---

## 🎯 Future Roadmap

- **🎪 Enhanced AI Features**: Mood-based playlist generation, seasonal trend analysis
- **📈 Social Features**: Compare your taste with friends and global trends
- **📄 Export Options**: Save your Wrapped as beautiful PDF reports or social images
- **🎵 Extended Analytics**: Decade analysis, artist evolution tracking, concert recommendations
- **🔄 Data Sync**: Automatic periodic updates and historical trend tracking

---

## 🤝 Contributing

While this is a personal project, I welcome feedback, suggestions, and collaboration opportunities!

- **🐛 Report Issues**: [GitHub Issues](https://github.com/murairam/my-spotify-wrapped/issues)
- **💡 Feature Requests**: Open a discussion or create a pull request
- **📧 Contact**: [marimiilpalu@gmail.com](mailto:marimiilpalu@gmail.com)

---

## 📄 License

MIT License. Spotify data remains property of Spotify and is used in accordance with their Web API Terms of Service.

---

## 🙏 Acknowledgments

- **🎵 Spotify Web API** - For providing comprehensive music data access
- **🧠 Mistral AI** - For enabling intelligent music analysis and recommendations
- **🏫 42 School** - For peer-learning methodology and collaborative development inspiration
- **☕ KB Coffeeroasters** - For the workspace and premium coffee that fueled this project
- **🤖 AI Assistants** - Mistral AI Chat and Claude AI Chat for development assistance
- **⚡ NextAuth.js** - For seamless OAuth integration
- **📊 Chart.js** - For powerful data visualization capabilities

---

## 📱 Connect

This project showcases my passion for music, data visualization, and AI integration. **I plan to continue developing and improving this project**, fixing bugs, adding features, and exploring new ways to understand music consumption patterns.

If you're interested in music technology, AI applications, or just want to discuss the project, feel free to reach out!

---

**Built with ❤️, ☕, and countless late nights by Mari Miilpalu**

*A 42 School student exploring the intersection of music, data, and AI*
