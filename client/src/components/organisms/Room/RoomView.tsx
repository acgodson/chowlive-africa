'use client';

import { useMemo, useState } from 'react';
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
import FixedButtons from '@/components/molecules/Room/FixedButtons';
import { Button } from '@/components/atoms';

import Song from '@/utils/models/Song';

import { sidepanelAtom } from '@/state/sidepanelAtom';
import { useAuthContext } from '@/providers/web3-provider';

export const RoomView = ({ slug }: { slug: string }) => {
  const connectedUsers = useConnectedRoomUsers(slug);

  const room = useMonitorRoom(slug);
  const queue = useQueue(room.id);
  const song = queue ? queue[0] || undefined : undefined;

  useHandlePlayback(song);

  const [sidepanelStatus] = useAtom(sidepanelAtom);
  const { isAuthenticated, signIn } = useAuthContext();
  const track = useSpotifyTrack(song);
  const [shouldAlwaysShowUI, setShouldAlwaysShowUI] = useState(false);

  const { normalGradient } = useGradientsFromImageRef(
    track ? track.album.images[0].url : undefined
  );

  const isInactive = useIsInactive();
  const shouldHideUI = isInactive && !shouldAlwaysShowUI;
  const isSongInQueue = !!track && !!song;

  return (
    <Layout>
      <Head>
        <title>{room.name || 'Room'} | ChowLive </title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <div className='h-screen w-screen overflow-hidden flex'>
        <div
          className={`h-screen w-full flex-1 flex flex-col items-center justify-center relative ${
            sidepanelStatus.isRightOpen ? 'w-full' : 'w-screen'
          } transition-all duration-300 ${isInactive ? 'cursor-none' : 'cursor-default'}`}
          style={{
            background: normalGradient || `linear-gradient(to bottom right, #4b5563, #1f2937)`,
          }}
        >
          <FixedButtons
            room={room}
            song={song}
            show={!shouldHideUI}
            users={connectedUsers}
            shouldAlwaysShowUI={shouldAlwaysShowUI}
            setShouldAlwaysShowUI={setShouldAlwaysShowUI}
          />

          {queue && queue.length > 0 && song && isAuthenticated && (
            <div className='relative h-1/2 w-1/2'>
              {queue.map((song, i) => (
                <AlbumArt song={song} position={i} maxZ={queue.length} key={song.addedAt} />
              ))}
            </div>
          )}

          {isAuthenticated ? (
            <>
              <h1 className='text-white text-2xl font-bold mt-4 drop-shadow-md'>
                {isSongInQueue ? track.name : 'Nothing is playing.'}
              </h1>
              <p className='text-white drop-shadow-md mt-2'>
                {isSongInQueue
                  ? track.artists[0].name
                  : 'Queue a song with the "+" icon in the top right!'}
              </p>
            </>
          ) : (
            <>
              <h1 className='text-white text-2xl font-bold mt-4 drop-shadow-md'>
                Log in to listen together!
              </h1>
              <p className='text-white drop-shadow-md mt-1 max-w-sm text-center leading-relaxed'>
                Join other users in {room.name} to listen to music, queue songs, and chat with
                friends.
              </p>
              {/* Changed to use shadcn Button component */}
              <Button className='mt-4' size='lg' onClick={() => signIn()}>
                Login with Spotify
              </Button>
            </>
          )}
        </div>
        <ChatComponent />
      </div>
    </Layout>
  );
};

// AlbumArt component
const AlbumArt = ({ song, position, maxZ }: { song: Song; position: number; maxZ: number }) => {
  const track = useSpotifyTrack(song);
  const zIndex = maxZ - position;
  const size = 50 - position * 5;
  const isSpotifySong = !!song.spotifyUri;

  if (position >= 5) return null;
  if (!track)
    return (
      <div
        className={`absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 shadow-lg pointer-events-none h-${size} w-${size} z-${zIndex} transform translate-y-${position} translate-x-${
          position * 2.5
        }`}
      />
    );
  return (
    <img
      src={track.album.images[0].url}
      className={`absolute inset-0 shadow-lg pointer-events-none h-${size} w-${size} z-${zIndex} transform translate-y-${position} translate-x-${
        position * 2.5
      } ${isSpotifySong ? `contrast-${100 - position * 20}` : ''}`}
    />
  );
};

export default RoomView;
