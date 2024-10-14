import React from 'react';
import DeviceSelectDrawer from '../molecules/Drawers/DeviceSelectDrawer';
// import PlaybackControlDrawer from '../molecules/Drawers/PlaybackControlDrawer';
import SongSearchDrawer from '../molecules/Drawers/SongSearchDrawer';

interface Props {
  children: JSX.Element | JSX.Element[];
  publicRoute?: boolean;
}

const Layout = ({ children, publicRoute }: Props) => {
  return (
    <main className='min-h-screen bg-background'>
      {children}
      {!publicRoute && (
        <>
          <SongSearchDrawer />
          <DeviceSelectDrawer />
          {/* <PlaybackControlDrawer /> */}
        </>
      )}
    </main>
  );
};

export default Layout;
