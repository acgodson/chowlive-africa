import '../styles/globals.css';
import { ThemeProvider } from 'next-themes';
import { Provider as JotaiProvider } from 'jotai';
import { AppType } from 'next/app';

import SpotifyWebPlayback from '@/lib/spotify/SpotifyWebPlayback';
import AuthProvider from 'src/lib/AuthProvider';
import UserProvider from 'src/lib/UserProvider';
import { trpc } from 'src/server/client';

import { globalStyles } from '../stitches.config';
import { ToastProvider } from 'src/components/atoms/toast';

const App: AppType = ({ Component, pageProps }) => {
  globalStyles();

  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <ToastProvider>
        <AuthProvider>
          <UserProvider>
            <JotaiProvider>
              <SpotifyWebPlayback>
                <Component {...pageProps} />
              </SpotifyWebPlayback>
            </JotaiProvider>
          </UserProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default trpc.withTRPC(App);
