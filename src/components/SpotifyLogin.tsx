// src/components/SpotifyLogin.tsx
"use client";
import { signIn, signOut, useSession, SessionProvider } from "next-auth/react";


export default function SpotifyLogin() {
  return (
    <SessionProvider>
      <InnerSpotifyLogin />
    </SessionProvider>
  );
}

function InnerSpotifyLogin() {
  const { data: session } = useSession();
  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
    localStorage.clear(); // Clear all client-side data
  };
  if (!session) {
    return (
      <div>
        <p>Not signed in</p>
        <button onClick={() => signIn("spotify")}>Sign in</button>
      </div>
    );
  }
  return (
    <div>
      <p>Signed in as {session.user?.email}</p>
      <button onClick={handleSignOut}>Sign out</button>
    </div>
  );
}
