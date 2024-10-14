'use client';

import { ThemeProvider } from 'next-themes';
import { Provider as JotaiProvider } from 'jotai';

import { TRPCProvider } from '@/trpc/client';
import { SpotifyWebPlaybackProvider as SpotifyWebPlayback } from './spotify-provider/SpotifyWebPlayback';
import AuthProvider from './web3-provider/';
import UserProvider from './user-provider';
import { ToastProvider } from '@/components/atoms/toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
        <ToastProvider>
          <TRPCProvider>
            <AuthProvider>
              <UserProvider>
                <JotaiProvider>
                  <SpotifyWebPlayback>
                    {children}
                  </SpotifyWebPlayback>
                </JotaiProvider>
              </UserProvider>
            </AuthProvider>
          </TRPCProvider>
        </ToastProvider>
      </ThemeProvider>
    </>
  );
}
