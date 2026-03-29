# My Spotify Wrapped – Interview Cheat Sheet

---

## A. Architecture & Backend Questions

**Q: Why extract the backend from Next.js into NestJS?**

- **Separation of Concerns:** Decouples UI from business logic and API integrations.
- **Scalability:** Enables independent scaling, deployment, and team ownership.
- **Dependency Injection:** NestJS’s DI system makes code more modular, testable, and maintainable.
- **Tech Alignment:** Matches industry best practices and the target company’s stack.

**Q: Why REST instead of GraphQL?**

- **Pragmatism:** The app’s data flows are linear and predictable (e.g., top tracks, playlists).
- **Simplicity:** REST is easier to cache, debug, and secure for this use case.
- **Openness:** Eager to use GraphQL for more complex, relational data at Dedale.

---

## B. Tech Stack Proficiency

**Q: Why Next.js for the frontend?**

- **Server-Side Rendering:** Fast load times and SEO benefits.
- **App Router:** Clean, file-based navigation and layouts.
- **API Routes:** Enabled rapid prototyping and secure handling of Spotify tokens before backend extraction.

**Q: React vs. Vue?**

- My project demonstrates deep React and Next.js expertise.
- Both React and Vue are component-based, use similar state management patterns, and encourage modular UI.
- I’m confident I can pick up Vue quickly and would enjoy the opportunity.

**Q: TypeScript Usage**

- Used for strict typing with Spotify Web API responses.
- Ensures robust, predictable data handling and safer refactoring.
- Enforces structured JSON for AI (Mistral) responses.

---

## C. Project Showcase Guide

**Screen Share Script:**

1. **Intro:**  
   “This is My Spotify Wrapped, a full-stack TypeScript project that visualizes your Spotify listening data and leverages AI for insights.”

2. **Architecture:**  
   “The frontend is Next.js 14 (App Router), deployed to Vercel. The backend is a standalone NestJS REST API, containerized with Docker and deployed to Google Cloud Run. Local development uses Docker Compose with root-level Dockerfile.backend and Dockerfile.frontend.”

3. **Demo:**  
   “Let me show you the dashboard, how we fetch top tracks, and how AI analysis is integrated.”

**Hardest Technical Challenge:**

- **Spotify OAuth Token Refresh:**  
   Handling token expiration and refresh flows securely, especially when moving from Next.js API routes to a dedicated backend, ensuring seamless user experience and secure storage of credentials.
- **Monorepo Deployment:**
   Ensuring Vercel only builds the frontend (using .vercelignore), and that Docker Compose uses the correct root-level Dockerfiles for local development, while Cloud Run uses Dockerfile.backend for backend deployment.

- **(Runner-up):**  
  Prompting Mistral AI to return consistent, structured JSON for downstream processing.

---

**Good luck! You’ve got this.**
