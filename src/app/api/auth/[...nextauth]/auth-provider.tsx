'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  setAccessToken,
  setRefreshToken,
  clearAccessToken,
} from '@/services/api-client';

function TokenSync() {
  const { data: session, status } = useSession();
  useEffect(() => {
    if ((session as any)?.accessToken) {
      setAccessToken((session as any).accessToken);
    }
    if ((session as any)?.refreshToken) {
      setRefreshToken((session as any).refreshToken);
    }
    if (status === 'unauthenticated') {
      clearAccessToken();
    }
  }, [session, status]);
  return null;
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated' && pathname !== '/signin') {
      router.replace(`/signin?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [status, pathname, router]);

  return <>{children}</>;
}

export default function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}): React.ReactNode {
  return (
    <SessionProvider session={session}>
      <TokenSync />
      <AuthGuard>{children}</AuthGuard>
    </SessionProvider>
  );
}
