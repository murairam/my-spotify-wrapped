import SpotifyProvider from "next-auth/providers/spotify";
import { JWT } from "next-auth/jwt";
import { Session as NextAuthSession, Account } from "next-auth";

interface ExtendedToken extends JWT {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  error?: string;
}

interface ExtendedSession extends NextAuthSession {
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

async function refreshAccessToken(token: ExtendedToken) {
  try {
    const url = "https://accounts.spotify.com/api/token";

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      method: "POST",
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken || "",
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Date.now() / 1000 + refreshedTokens.expires_in,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    // Do not log sensitive errors in production
    if (process.env.NODE_ENV === 'development') {
      console.error("Error refreshing access token:", error);
    }
    // Re-throw the error to invalidate the session
    throw error;
  }
}

export const authOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "user-read-private user-read-email user-top-read user-read-recently-played user-follow-read playlist-read-private playlist-read-collaborative user-library-read",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }: { token: ExtendedToken; account?: Account | null }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }

      // Return previous token if the access token has not expired yet
      if (typeof token.expiresAt === 'number' && Date.now() < token.expiresAt * 1000) {
        return token;
      }

      // Access token has expired, try to update it
      return await refreshAccessToken(token);
    },
    async session({ session, token }: { session: NextAuthSession; token: ExtendedToken }) {
      // Cast session to ExtendedSession to allow custom properties
      const extSession = session as ExtendedSession;
      extSession.accessToken = token.accessToken;
      extSession.refreshToken = token.refreshToken;
      extSession.error = token.error;
      return extSession;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
