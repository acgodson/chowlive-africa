import React from 'react';
import DeviceSelectDrawer from './Drawers/DeviceSelectDrawer';
// import PlaybackControlDrawer from './Drawers/PlaybackControlDrawer';
import SongSearchDrawer from './Drawers/SongSearchDrawer';

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
