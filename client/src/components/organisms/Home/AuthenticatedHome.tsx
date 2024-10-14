'use client'

import React, { useState } from 'react';

import AuthHomeLayout from '@/components/template/AuthHomeLayout';
import Layout from '@/components/template/Layout';
import DashboardWelcome from '@/components/molecules/Dashboard/DashboardWelcome';
import JoinWithRoomCode from '@/components/molecules/Dashboard/JoinWithRoomCode';
import PlaybackHeader from '@/components/molecules/PlaybackHeader/PlaybackHeader';
import OwnerRoomRoll from '@/components/molecules/RoomRolls/OwnerRoomRoll';
import PublicRoomRoll from '@/components/molecules/RoomRolls/PublicRoomRoll';


import MarqueeAnnouncement from '@/components/molecules/marqueeAnnoucements';
import AccountProfile from '@/components/molecules/accountProfile';



const AuthenticatedHome = () => {
  const [pageIndex, setPageIndex] = useState(0);

  // Promoted Rooms
  const rooms = [
    { name: "Godson's room", nftId: 2, chow: 0 },
    { name: "Bob's hangout", nftId: 12, chow: 1 },
    // Add more rooms as needed
  ];

  return (
    <>
      <Layout>
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

      <MarqueeAnnouncement rooms={rooms} />
    </>
  );
};

export default AuthenticatedHome;
