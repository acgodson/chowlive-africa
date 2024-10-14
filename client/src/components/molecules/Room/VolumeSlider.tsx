import { useState } from 'react';
import { FiVolume, FiVolume1, FiVolume2, FiVolumeX } from 'react-icons/fi';
import useStore from '@/state/store';

const VolumeSlider = () => {
  const { spotify } = useStore((store) => ({
    spotify: store.spotify,
  }));

  const [localVolume, setLocalVolume] = useState(100);

  const updateSpotifyVolume = (value: number) => {
    setLocalVolume(value);

    if (spotify) {
      // spotifyApi.setAccessToken(accessToken);
      // spotifyApi.setVolume(value);
    }
  };

  const getVolumeIcon = () => {
    if (localVolume < 1) return <FiVolumeX className='w-5 h-5' />;
    if (localVolume < 33) return <FiVolume className='w-5 h-5' />;
    if (localVolume < 66) return <FiVolume1 className='w-5 h-5' />;
    return <FiVolume2 className='w-5 h-5' />;
  };

  return (
    <div className='flex items-center'>
      <button
        className='p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-1'
        onClick={() => updateSpotifyVolume(localVolume > 0 ? 0 : 100)}
        aria-label={localVolume < 1 ? 'Unmute audio' : 'Mute audio'}
      >
        {getVolumeIcon()}
      </button>
      <div className='w-20 h-2 bg-gray-200 rounded-full'>
        <div className='h-full bg-blue-500 rounded-full' style={{ width: `${localVolume}%` }} />
        <input
          type='range'
          min='0'
          max='100'
          value={localVolume}
          onChange={(e) => updateSpotifyVolume(Number(e.target.value))}
          className='absolute w-20 h-2 opacity-0 cursor-pointer'
          aria-label='slider-volume'
        />
      </div>
    </div>
  );
};

export default VolumeSlider;
