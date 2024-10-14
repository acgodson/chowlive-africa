import React, { useEffect, useState } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { useAtom } from 'jotai';
import { trpc } from '@/trpc/client';
import useStore, { Modal } from '@/state/store';
import { roomAtom } from '@/state/roomAtom';
import { cn } from '@/utils';
import DashboardSongDisplay from '../Room/DashboardSongDisplay';
import Drawer from '../../atoms/drawer';
import { Input, useToast } from '../../atoms';
import { useAuthContext } from '@/providers/web3-provider';
import useWindowDimensions from '@/hooks/useWindowDimensions';



const SongSearchDrawer = () => {
  const dimensions = useWindowDimensions();
  const [room] = useAtom(roomAtom);
  const { spotify, modal, setModal, handleSetModal } = useStore((store) => ({
    spotify: store.spotify,
    modal: store.modal,
    setModal: store.setModal,
    handleSetModal: store.handleSetModal,
  }));
  const { user } = useAuthContext();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [lastSearched, setLastSearched] = useState(0);
  const [searchResults, setSearchResults] = useState<SpotifyApi.TrackObjectFull[]>([]);
  const [maxHeight, setMaxHeight] = useState('30vh');

  const { mutateAsync: queueTrack } = trpc.queueSong.useMutation();

  const handleQueueTrack = async ({
    duration_ms,
    spotifyUri,
    progress,
  }: {
    duration_ms: number;
    spotifyUri?: string;
    progress?: number;
  }) => {
    await queueTrack({
      roomId: room.id.toString(),
      spotifyUri,
      progress,
      duration_ms,
    }).catch(console.error);

    setSearchQuery('');
    setModal(Modal.None);
  };

  const onChangeSpotifySearchQuery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);

    const rtdb = getDatabase();
    const tokenSnapshot = await get(ref(rtdb, `spotifyAccessToken/${user?.uid}`));
    const accessToken = tokenSnapshot.val();

    if (e.target.value === '' || !accessToken) {
      setSearchResults([]);
      setMaxHeight('30vh');
      return;
    }
    if (spotify && Date.now() - lastSearched > 250) {
      try {
        setLastSearched(Date.now());
        spotify.setAccessToken(accessToken);
        const results = await spotify.searchTracks(e.target.value);
        setSearchResults(results.tracks.items.slice(0, 4));
        setMaxHeight(results.tracks.items.length > 0 ? '80vh' : '30vh');
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSpotifyQueue = (track: SpotifyApi.TrackObjectFull) => async () => {
    await handleQueueTrack({
      spotifyUri: track.uri,
      duration_ms: track.duration_ms,
    });
  };

  const isOpen = modal === Modal.QueueSong;

  const toggleModal = () => {
    setModal(Modal.None);
    handleSetModal(Modal.None);
    setSearchQuery('');
    setSearchResults([]);
    setMaxHeight('30vh');
  };

  return (
    // maxHeight={maxHeight}
    <Drawer isOpen={isOpen} onClose={toggleModal} direction='top'>
      <div className='p-2 sm:p-4 md:p-8'>
        <h2
          className={cn(
            'text-2xl font-bold mb-4',
            dimensions && dimensions.width > 600 ? 'text-3xl' : 'text-2xl'
          )}
        >
          Queue a Song
        </h2>

        <div className='flex flex-col items-center justify-center max-w-3xl mx-auto'>
          <Input
            className={cn(
              'w-full h-[55px] mt-8',
              dimensions && dimensions.width > 600 ? 'text-lg' : 'text-base'
            )}
            placeholder='Search for a song to queue...'
            onChange={onChangeSpotifySearchQuery}
            value={searchQuery}
          />
          <div
            className={cn(
              'grid gap-4 mt-4',
              searchResults.length > 0
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                : ''
            )}
          >
            {searchResults.map((track, index) => (
              <div
                key={index}
                className='p-2 -mx-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800'
                onClick={handleSpotifyQueue(track)}
              >
                <DashboardSongDisplay
                  title={track.name}
                  album={track.album.name}
                  artist={track.artists[0].name}
                  src={track.album.images ? track.album.images[0]?.url : undefined}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default SongSearchDrawer;
