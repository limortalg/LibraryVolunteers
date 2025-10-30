import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';


// Use the configured NEXTAUTH_URL (stable domain) instead of the dynamic VERCEL_URL
// This way you only need to add the redirect URI to Google Cloud Console once
const NEXTAUTH_URL = process.env.NEXTAUTH_URL?.trim() || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL.trim()}` : 'http://localhost:3000');

// Strip whitespace from environment variables (Vercel sometimes adds \r\n)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim() || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET?.trim() || '';
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET?.trim() || 'dev-secret-change-in-production';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user?.email) {
        session.user.email = session.user.email;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: NEXTAUTH_SECRET,
};

// Add debug logging for the actual redirect URI that will be used
const handler = NextAuth(authOptions);

export default handler;

