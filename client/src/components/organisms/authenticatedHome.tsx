import React, { useState } from 'react';
import Head from 'next/head';

import DashboardWelcome from 'src/components/Dashboard/DashboardWelcome';
import JoinWithRoomCode from 'src/components/Dashboard/JoinWithRoomCode';
import PlaybackHeader from 'src/components/PlaybackHeader/PlaybackHeader';
import OwnerRoomRoll from 'src/components/RoomRolls/OwnerRoomRoll';
import PublicRoomRoll from 'src/components/RoomRolls/PublicRoomRoll';

import Layout from '../Layout';
import AuthHomeLayout from '../template/AuthHomeLayout';
import AccountProfile from '../molecules/accountProfile';

const AuthenticatedHome = () => {
  const [pageIndex, setPageIndex] = useState(0);

  return (
    <Layout>
      <Head>
        <title>Dashboard | Chow Live</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='min-h-screen'>
        <PlaybackHeader isHome />
        <div className='bg-opacity-60 bg-[#E5E5E7] dark:bg-[#1C1C1E] w-full  -mt-12'>
          <AuthHomeLayout setIndex={setPageIndex}>
            {pageIndex === 1 ? (
              <>
                <AccountProfile />
              </>
            ) : (
              <div className='-inset-2 mt-12 flex flex-col  items-center max-w-7xl px-4 sm:p-8 md:px-12 lg:px-16 mx-auto'>
                <DashboardWelcome />
                <JoinWithRoomCode />
                <OwnerRoomRoll />
                <PublicRoomRoll />
              </div>
            )}
          </AuthHomeLayout>
        </div>
      </div>
    </Layout>
  );
};

export default AuthenticatedHome;
