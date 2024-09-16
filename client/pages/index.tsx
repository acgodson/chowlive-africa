import React from 'react';
import Head from 'next/head';

import { useAuthContext } from 'src/lib/AuthProvider';

import PublicHome from 'src/components/organisms/publicHome';
import AuthenticatedHome from 'src/components/organisms/authenticatedHome';

export default function Home() {
  const { isAuthenticated } = useAuthContext();

  return (
    <div>
      <Head>
        <title>Chow Live Together</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      {isAuthenticated ? <AuthenticatedHome /> : <PublicHome />}
    </div>
  );
}
