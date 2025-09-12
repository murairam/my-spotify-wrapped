"use client";
import { SessionProvider, useSession, signIn } from "next-auth/react";
import { FaSpotify } from "react-icons/fa";
import Image from "next/image";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <ReactQueryProvider>
      <SessionProvider>
        <Content />
      </SessionProvider>
    </ReactQueryProvider>
  );
}

function Content() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center p-4 sm:p-8">
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <FaSpotify className="text-6xl sm:text-8xl text-[#1DB954] mr-3 sm:mr-4" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
              Spotify Wrapped
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-md mx-auto">
            Discover your unique music personality and listening patterns from your Spotify data
          </p>
          <button
            onClick={() => signIn('spotify')}
            className="bg-[#1DB954] hover:bg-[#1ed760] text-white px-8 py-4 sm:px-12 sm:py-5 rounded-full font-bold text-lg sm:text-xl shadow-lg transform transition hover:scale-105 flex items-center justify-center space-x-3 mx-auto min-h-[56px] touch-manipulation"
          >
            <FaSpotify className="text-xl sm:text-2xl" />
            <span>Connect with Spotify</span>
          </button>
          <div className="mt-6 sm:mt-8 text-center">
            <Image
              src="/spotify-logo.svg"
              alt="Spotify"
              width={120}
              height={24}
              className="h-5 sm:h-6 w-auto mx-auto"
              style={{
                filter: 'brightness(0) saturate(100%) invert(100%)'
              }}
              onError={() => {
                console.log('Spotify logo failed to load, using fallback');
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}
