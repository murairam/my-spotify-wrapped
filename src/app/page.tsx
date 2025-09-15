"use client";
"use client";
import { SessionProvider } from "next-auth/react";
// Removed duplicate default import
import { LandingPage } from '@/components/LandingPage';

export default function Home() {
  return (
    <SessionProvider>
      <LandingPage />
    </SessionProvider>
  );
}
