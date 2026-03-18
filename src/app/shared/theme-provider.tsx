'use client';

import { Provider } from 'jotai';
// import hideRechartsConsoleError from '@/utils/recharts-console-error';
import { ThemeProvider as NextThemeProvider } from 'next-themes';

// hideRechartsConsoleError();

export function ThemeProvider({ children }: React.PropsWithChildren<{}>) {
  return (
    <NextThemeProvider
      enableSystem={false}
      themes={['dark']}
      defaultTheme="dark"
      forcedTheme="dark"
    >
      {children}
    </NextThemeProvider>
  );
}

export function JotaiProvider({ children }: React.PropsWithChildren<{}>) {
  return <Provider>{children}</Provider>;
}
