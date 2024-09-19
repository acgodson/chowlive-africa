import { FaPlus } from 'react-icons/fa';

import useStore, { Modal } from 'src/state/store';

import useSpotifyTrack from '../../hooks/spotify/useSpotifyTrack';
import Room from '../../models/Room';
import Song from '../../models/Song';
import DashboardSongDisplay from '../Room/DashboardSongDisplay';
import { Button } from '../atoms';

interface Props {
  song?: Song;
  room?: Room;
}

const PlaybackHeaderSongDisplay = ({ song, room }: Props) => {
  const { handleSetModal } = useStore((store) => ({
    handleSetModal: store.handleSetModal,
  }));

  const track = useSpotifyTrack(song);

  return (
    <div>
      {room && room.name ? (
        song && track ? (
          <DashboardSongDisplay
            title={track.name}
            artist={track.artists[0].name}
            album={track.album.name}
            src={track.album.images[0].url}
          />
        ) : (
          <Button variant='ghost' onClick={handleSetModal(Modal.QueueSong)}>
            <FaPlus />
            <p className={'ml-1'}>Pick a song to play!</p>
          </Button>
        )
      ) : (
        <p className='ml-0 sm:ml-2 md:ml-4 lg:ml-8 font-medium text-lg text-[#541413] dark:text-[#FCEFDC]'>
          Join a room to start listening to music!
        </p>
      )}
    </div>
  );
};

export default PlaybackHeaderSongDisplay;
