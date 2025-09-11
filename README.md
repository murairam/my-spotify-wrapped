# My Spotify Wrapped 🎵

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-blue)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.13-06B6D4)](https://tailwindcss.com/)
[![Spotify Web API](https://img.shields.io/badge/Spotify_API-v1.0-green)](https://developer.spotify.com/documentation/web-api/)
[![GitHub Stars](https://img.shields.io/github/stars/murairam/my-spotify-wrapped?style=social)](https://github.com/murairam/my-spotify-wrapped)

**A personal, year-round alternative to Spotify Wrapped** — providing deep, interactive insights into your music listening habits with advanced analytics, real-time data, and AI-powered recommendations.

🔗 **[Live Demo](#)** (Coming Soon)   📊 **[Screenshots](#screenshots)** | 📖 **[Documentation](#documentation)**

---

## 🎯 Project Overview

**My Spotify Wrapped** is a **full-stack web application** that delivers a **comprehensive, interactive dashboard** for analyzing your Spotify listening history. Unlike Spotify’s annual Wrapped, this tool offers **real-time, multi-timeframe analytics**, **personalized insights**, and **AI-powered recommendations** — all in a sleek, mobile-first interface.

Built for music enthusiasts, developers, and data lovers, it’s designed to be **extensible, performant, and visually engaging**.

---

## 🌟 Key Features
| Feature                   | Description                                                                                     |
|----------------------------|-------------------------------------------------------------------------------------------------|
| **Top Tracks & Artists**   | Rankings across 4 weeks, 6 months, and all-time                                                |
| **Genre Analysis**         | Top 20 genres, discovery trends, and decade distribution                                        |
| **Listening Habits**       | Time-based activity patterns and social metrics                                                |
| **Audio Profile**          | Detailed analysis of your musical taste (energy, danceability, valence, etc.)                  |
| **Playlist Intelligence**  | Analysis of owned vs. followed playlists with metadata                                         |
| **Real-Time Data**         | Live sync with Spotify API and completion scores                                               |
| **Interactive Dashboard**  | Glass-morphism UI, responsive charts, and touch-friendly interactions                          |
| **AI-Powered Insights**    | (In Development) Mistral AI integration for personalized recommendations and natural language summaries |

---

## 🛠 Tech Stack
| Category       | Technologies                                                                                   |
|----------------|------------------------------------------------------------------------------------------------|
| **Frontend**   | Next.js 14 (App Router), TypeScript, Tailwind CSS, Chart.js, React Chart.js 2                  |
| **Backend**    | Next.js API Routes, NextAuth.js (Spotify OAuth), Spotify Web API Node                          |
| **Dev Tools**  | ESLint, PostCSS, npm, GitHub Actions (CI/CD)                                                   |
| **Deployment** | Vercel (Planned), Docker (Planned)                                                             |

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18.17.0
- npm/yarn/pnpm/bun
- [Spotify Developer Account](https://developer.spotify.com/dashboard/)

### Installation
1. **Clone the repo:**
   ```bash
   git clone https://github.com/murairam/my-spotify-wrapped.git
   cd my-spotify-wrapped
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Spotify credentials in `.env.local`:
   ```env
   NEXTAUTH_URL=http://127.0.0.1:3000
   NEXTAUTH_SECRET=your-secret-key
   SPOTIFY_CLIENT_ID=your-client-id
   SPOTIFY_CLIENT_SECRET=your-client-secret
   ```

4. **Configure Spotify App:**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
   - Add `http://127.0.0.1:3000/api/auth/callback/spotify` to Redirect URIs
   - Copy Client ID and Client Secret to `.env.local`

5. **Run the dev server:**
   ```bash
   npm run dev
   ```

6. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📸 Screenshots
(Add screenshots/GIFs here as you develop the UI. Example placeholders.)

---

## 🔧 Usage Options
| Option              | Description                                                                        | Status        |
|---------------------|------------------------------------------------------------------------------------|---------------|
| **Personal Setup**  | Clone and run locally with your Spotify credentials. Full control over data.       | ✅ Available  |
| **Mock Data Demo**  | Test the interface with sample data (no Spotify auth required).                     | 🚧 Coming Soon|
| **User Access**     | Contact me to add your Spotify email to the approved users list.                    | ✅ Available  |

---

## 📈 Upcoming Features
- **Mistral AI Integration**: AI-generated insights and predictive analytics.
- **Mood & Seasonal Trends**: Emotional profiling and yearly listening patterns.
- **Export Options**: Save your Wrapped as PDF/images.
- **Comparative Analytics**: Compare your taste with global trends.

---

## 🏗 Project Structure
```bash
my-spotify-wrapped/
├── src/
│   ├── app/          # Next.js App Router
│   ├── components/   # Reusable UI components
│   ├── lib/          # Utility functions, API clients
│   ├── styles/       # Tailwind CSS config
│   └── types/        # TypeScript types
├── public/           # Static assets
├── .env.example      # Environment template
└── README.md         # You are here!
```

---

## 🎨 Design & UX
- Glass-morphism UI for a modern, immersive experience.
- Mobile-first, responsive layout with touch-friendly interactions.
- Accessibility: WCAG-compliant color contrast and keyboard navigation.

---

## 🔌 API Coverage
Uses **8+ Spotify Web API endpoints**, including:
- User Top Items (tracks/artists)
- User Profile & Playlists
- Recently Played & Saved Tracks
- Audio Features (energy, danceability, etc.)

(Add a Mermaid diagram or Swagger docs link here for API flow.)

---

## 🤝 Contributing
This is a personal project, but feedback and suggestions are welcome!

- **Report Issues**: GitHub Issues
- **Feature Requests**: Open a discussion or PR
- **Contact**: Your Email | LinkedIn

---

## 📄 License
MIT License. Spotify data remains property of Spotify and is used per their Web API Terms.

---

## 🙏 Acknowledgments
- Spotify Web API
- NextAuth.js
- Chart.js
- 42 School for peer-learning inspiration

---

© 2025 Mari Miilpalu
Built with ❤️ for music and data lovers.
