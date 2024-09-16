import { useMemo, useState } from 'react';
import { useAtom } from 'jotai';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';

import { useAuthContext } from '@/lib/AuthProvider';
import useConnectedRoomUsers from 'src/hooks/rooms/useConnectedRoomUsers';
import useHandlePlayback from 'src/hooks/useHandlePlayback';
import useIsInactive from 'src/hooks/useIsInactive';

import Layout from '../../src/components/Layout';
import ChatComponent from '../../src/components/Room/Chat/ChatComponent';
import FixedButtons from '../../src/components/Room/FixedButtons';
import useMonitorRoom from '../../src/hooks/rooms/useMonitorRoom';
import useQueue from '../../src/hooks/rooms/useQueue';
import useSpotifyTrack from '../../src/hooks/spotify/useSpotifyTrack';
import useGradientsFromImageRef from '../../src/hooks/useGradientsFromImageRef';
import Song from '../../src/models/Song';
import { sidepanelAtom } from '../../src/state/sidepanelAtom';
import { Button } from 'src/components/atoms';

export const RoomPage = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const slug = useMemo(() => {
    if (router.query.slug && typeof router.query.slug === 'string') {
      return router.query.slug;
    }

    if (typeof window !== 'undefined') {
      const urlPortions = new URL(window.location.toString()).pathname.split('/');
      const windowSlug = urlPortions[urlPortions.length - 1];
      if (windowSlug) return windowSlug;
    }

    return undefined;
  }, [router.query.slug]);
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

  const backgroundStyles = track
    ? {
        style: { background: normalGradient },
      }
    : {};

  const isInactive = useIsInactive();
  const shouldHideUI = isInactive && !shouldAlwaysShowUI;
  const isSongInQueue = !!track && !!song;

  return (
    <Layout>
      <Head>
        <title>{room.name || 'Room'} | ChowLive </title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      {/* Changed to use Tailwind classes */}
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

export default RoomPage;
