"use client";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  return (
    <SessionProvider>
      <Content />
    </SessionProvider>
  );
}

function Content() {
  const { data: session } = useSession();
  
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">My Spotify Wrapped</h1>
          <p className="mb-4">Not signed in</p>
          <button 
            onClick={() => signIn("spotify")}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            Sign in with Spotify
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">My Spotify Wrapped</h1>
        <p className="mb-4">Signed in as {session.user?.email}</p>
        <button 
          onClick={() => signOut()}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
