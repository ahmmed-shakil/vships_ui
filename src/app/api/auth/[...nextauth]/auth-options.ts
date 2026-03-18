import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { env } from '@/env.mjs';
import { pagesOptions } from './pages-options';

export const authOptions: NextAuthOptions = {
  pages: {
    ...pagesOptions,
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.idToken as string,
        },
      };
    },
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {},
      async authorize(credentials: any) {
        const validEmail = env.UAT_EMAIL;
        const validPassword = env.UAT_PASSWORD;

        if (
          credentials?.email === validEmail &&
          credentials?.password === validPassword
        ) {
          return {
            id: '1',
            email: validEmail,
            name: 'Perfomax UAT',
          };
        }
        return null;
      },
    }),
  ],
};
