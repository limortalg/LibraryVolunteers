import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

// Development mode - use mock credentials when Google OAuth is not configured
const USE_MOCK_AUTH = !process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your_client_id_here';

export const authOptions: NextAuthOptions = {
  providers: USE_MOCK_AUTH
    ? [
        CredentialsProvider({
          name: 'Mock',
          credentials: {
            email: { label: 'Email', type: 'text' },
            name: { label: 'Name', type: 'text' },
          },
          async authorize(credentials) {
            return {
              id: '1',
              email: credentials?.email || 'demo@example.com',
              name: credentials?.name || 'Demo User',
            };
          },
        }),
      ]
    : [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID || '',
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
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
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production',
};

export default NextAuth(authOptions);

