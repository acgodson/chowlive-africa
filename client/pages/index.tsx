import React, { useEffect, useState } from 'react';
import Head from 'next/head';

import { useAuthContext } from 'src/lib/AuthProvider';

import PublicHome from 'src/components/organisms/publicHome';
import AuthenticatedHome from 'src/components/organisms/authenticatedHome';
import FullscreenLoader from 'src/components/FullscreenLoader';

export default function Home() {
  const { isAuthenticated } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <Head>
        <title>Chow Live</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      {isLoading ? <FullscreenLoader /> : isAuthenticated ? <AuthenticatedHome /> : <PublicHome />}
    </div>
  );
}
