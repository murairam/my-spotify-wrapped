/* eslint-disable @typescript-eslint/no-explicit-any */
import SpotifyProvider from "next-auth/providers/spotify";

async function refreshAccessToken(token: any) {
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
        refresh_token: token.refreshToken,
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
    console.log("Error refreshing access token:", error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
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
    async jwt({ token, account }: any) {
      console.log("JWT callback - Account:", account);
      console.log("JWT callback - Token before:", token);
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < token.expiresAt * 1000) {
        console.log("JWT callback - Token still valid");
        return token;
      }

      // Access token has expired, try to update it
      console.log("JWT callback - Token expired, refreshing...");
      return await refreshAccessToken(token);
    },
    async session({ session, token }: any) {
      console.log("Session callback - Token:", token);
      // Send properties to the client
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.error = token.error;
      console.log("Session callback - Session:", session);
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
