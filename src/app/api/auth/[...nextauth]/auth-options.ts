import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { pagesOptions } from './pages-options';
import { loginUser } from '@/services/api';

const COOKIE_DOMAIN = 'vships.perfomax.io';

function buildCookies(): NextAuthOptions['cookies'] {
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    // Development: no secure prefix, no explicit domain (defaults to localhost)
    return {
      sessionToken: {
        name: 'next-auth.session-token',
        options: { httpOnly: true, sameSite: 'lax', path: '/', secure: false },
      },
      callbackUrl: {
        name: 'next-auth.callback-url',
        options: { httpOnly: true, sameSite: 'lax', path: '/', secure: false },
      },
      csrfToken: {
        name: 'next-auth.csrf-token',
        options: { httpOnly: true, sameSite: 'lax', path: '/', secure: false },
      },
    };
  }

  // Production: lock cookies to this subdomain only
  return {
    sessionToken: {
      name: '__Secure-next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
        domain: COOKIE_DOMAIN,
      },
    },
    callbackUrl: {
      name: '__Secure-next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
        domain: COOKIE_DOMAIN,
      },
    },
    csrfToken: {
      name: '__Host-next-auth.csrf-token',
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: true },
    },
  };
}

export const authOptions: NextAuthOptions = {
  pages: {
    ...pagesOptions,
  },
  cookies: buildCookies(),
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
