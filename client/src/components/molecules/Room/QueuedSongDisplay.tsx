// import Image from 'next/image';
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
      <div className='flex items-center justify-start bg-white/5 px-3 my-2 py-3 rounded-sm animate-pulse'>
        <div className='w-12 h-12 bg-gray-300 rounded-sm'></div>
        <div className='ml-4 space-y-2 flex-1'>
          <div className='h-4 bg-gray-300 rounded w-3/4'></div>
          <div className='h-3 bg-gray-300 rounded w-1/2'></div>
        </div>
      </div>
    );

  return (
    <div className='flex items-center justify-start bg-white/5 px-3 my-2 py-3 rounded-sm'>
      <img width={12} height={12} src={track.album.images[0].url} alt='Album cover' />
      <div className='ml-4 text-sm'>
        <h3>{track.name}</h3>
        <p>{track.artists[0].name}</p>
      </div>
    </div>
  );
};

export default QueuedSongDisplay;
