'use client';

import { useState } from 'react';
import { useAtom } from 'jotai';
import Head from 'next/head';

import useConnectedRoomUsers from '@/hooks/rooms/useConnectedRoomUsers';
import useHandlePlayback from '@/hooks/useHandlePlayback';
import useIsInactive from '@/hooks/useIsInactive';
import useMonitorRoom from '@/hooks/rooms/useMonitorRoom';
import useQueue from '@/hooks/rooms/useQueue';
import useSpotifyTrack from '@/hooks/spotify/useSpotifyTrack';
import useGradientsFromImageRef from '@/hooks/useGradientsFromImageRef';

import Layout from '@/components/template/Layout';
import ChatComponent from '@/components/molecules/Room/Chat/ChatComponent';
import AvatarMusicControls from '@/components/molecules/Room/AvatarMusicControls';
import EcommercePanel from '@/components/molecules/Room/EcommercePanel';
import RoomPerks from '@/components/molecules/Room/RoomPerks';
import FixedButtons from '@/components/molecules/Room/FixedButtons';

import { sidepanelAtom } from '@/state/sidepanelAtom';
import { useAuthContext } from '@/providers/web3-provider';

export const RoomView = ({ slug }: { slug: string }) => {
  const connectedUsers = useConnectedRoomUsers(slug);

  const room = useMonitorRoom(slug);
  const queue = useQueue(room.id);
  const song = queue ? queue[0] || undefined : undefined;

  useHandlePlayback(song);

  const [sidepanelStatus] = useAtom(sidepanelAtom);
  const { isAuthenticated, signIn, user } = useAuthContext();
  const track = useSpotifyTrack(song);
  const [shouldAlwaysShowUI, setShouldAlwaysShowUI] = useState(false);
  const [isEcommercePanelExpanded, setIsEcommercePanelExpanded] = useState(false);
  const [activeEcommerceTab, setActiveEcommerceTab] = useState('now playing');

  const { normalGradient } = useGradientsFromImageRef(
    track ? track.album.images[0].url : undefined
  );

  const isInactive = useIsInactive();
  const shouldHideUI = isInactive && !shouldAlwaysShowUI;
  const isSongInQueue = !!track && !!song;

  const renderMainContent = () => {
    switch (activeEcommerceTab) {
      case 'now playing':
        return (
          <AvatarMusicControls
            show={true}
            room={room}
            song={song}
            queue={queue}
            isPlaying={isSongInQueue}
            shouldAlwaysShowUI={shouldAlwaysShowUI}
            setShouldAlwaysShowUI={setShouldAlwaysShowUI}
          />
        );
      case 'featured':
        return (
          <div className='w-full h-full flex items-center justify-center'>
            <div className='bg-neutral-800/50 text-white p-6 rounded-lg shadow-xl w-full max-w-2xl'>
              <h2 className='text-2xl font-bold mb-4'>Featured Perks</h2>
              {isAuthenticated && (
                <RoomPerks
                  roomId={room.id}
                  userId={user?.id}
                  storeOwner={{
                    storeId: 'store123',
                    storeName: "Blossom's Bites",
                  }}
                />
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <Head>
        <title>{room.name || 'Room'} | ChowLive </title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <div className='h-screen w-screen overflow-hidden flex'>
        <EcommercePanel
          isExpanded={isEcommercePanelExpanded}
          onToggle={() => setIsEcommercePanelExpanded(!isEcommercePanelExpanded)}
          activeTab={activeEcommerceTab}
          setActiveTab={setActiveEcommerceTab}
        />

        <div
          className={`h-screen flex-1 flex flex-col items-center justify-between relative
          ${sidepanelStatus.isRightOpen ? 'w-full' : 'w-screen'}
          ${isEcommercePanelExpanded ? 'ml-80' : 'ml-20'}
          transition-all duration-300 ${isInactive ? 'cursor-none' : 'cursor-default'}`}
          style={{
            background: normalGradient || `linear-gradient(to bottom right, #4b5563, #1f2937)`,
          }}
        >
          {renderMainContent()}

          <NowPlaying track={track} isSongInQueue={isSongInQueue} />

          <FixedButtons
            room={room}
            song={song}
            show={!shouldHideUI}
            users={connectedUsers}
            shouldAlwaysShowUI={shouldAlwaysShowUI}
            setShouldAlwaysShowUI={setShouldAlwaysShowUI}
          />
        </div>
        <ChatComponent />
      </div>
    </Layout>
  );
};

const NowPlaying = ({ track, isSongInQueue }: any) => {
  if (!isSongInQueue) return null;
  return (
    <div className='flex items-center space-x-4 bg-black bg-opacity-50 p-4 rounded-lg'>
      <img src={track.album.images[0].url} alt='Album Art' className='w-16 h-16 rounded' />
      <div>
        <h2 className='text-white text-lg font-bold'>{track.name}</h2>
        <p className='text-gray-300'>{track.artists[0].name}</p>
      </div>
    </div>
  );
};

export default RoomView;
