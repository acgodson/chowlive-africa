import Image from 'next/image';
import useSpotifyTrack from '@/hooks/spotify/useSpotifyTrack';
import Song from '@/utils/models/Song';
import { Spinner } from '../../atoms';

interface Props {
  song: Song;
}

const QueuedSongDisplay = ({ song }: Props) => {
  const track = useSpotifyTrack(song);

  if (!track)
    return (
      <div className='flex items-center'>
        <Spinner />
      </div>
    );

  return (
    <div className='flex items-center justify-center'>
      <Image width={12} height={12} src={track.album.images[0].url} alt='Album cover' />
      <div className='ml-2'>
        <h3>{track.name}</h3>
        <p>{track.artists[0].name}</p>
      </div>
    </div>
  );
};

export default QueuedSongDisplay;
