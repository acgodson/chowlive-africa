import React from 'react';
import ProgressSlider from './ProgressSlider';
import useSongProgress from '@/hooks/rooms/useSongProgress';
import useSpotifyTrack from '@/hooks/spotify/useSpotifyTrack';
import Song from '@/utils/models/Song';
import SongControl from '../SongControl';

interface Props {
  song?: Song;
}

const DashboardSongControls = ({ song }: Props) => {
  const track = useSpotifyTrack(song);
  const progress = useSongProgress(song);

  return (
    <div className='flex flex-col items-center justify-center'>
      <SongControl song={song} />
      <ProgressSlider
        playback={{
          progress,
          length: track ? track.duration_ms : 1,
        }}
      />
    </div>
  );
};

export default DashboardSongControls;
