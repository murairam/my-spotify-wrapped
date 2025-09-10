import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

export const authOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "user-read-private user-read-email user-top-read user-read-recently-played user-follow-read playlist-read-private playlist-read-collaborative",
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
      }
      console.log("JWT callback - Token after:", token);
      return token;
    },
    async session({ session, token }: any) {
      console.log("Session callback - Token:", token);
      // Send properties to the client
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      console.log("Session callback - Session:", session);
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
