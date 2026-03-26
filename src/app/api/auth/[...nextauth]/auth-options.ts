import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { pagesOptions } from './pages-options';
import { loginUser } from '@/services/api';

export const authOptions: NextAuthOptions = {
  pages: {
    ...pagesOptions,
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours (matches backend access token TTL)
  },
  callbacks: {
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.idToken as string,
        },
        accessToken: token.accessToken as string,
        refreshToken: token.refreshToken as string,
      };
    },
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.idToken = (user as any).id;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Allow relative URLs and same-origin callbacks
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {},
      async authorize(credentials: any) {
        try {
          const res = await loginUser({
            email: credentials?.email,
            password: credentials?.password,
          });

          if (res.success && res.user) {
            return {
              id: res.user.id,
              email: res.user.email,
              name: res.user.name,
              accessToken: res.accessToken,
              refreshToken: res.refreshToken,
            };
          }
          return null;
        } catch {
          return null;
        }
      },
    }),
  ],
};
