import React from 'react';

interface Props {
  playback?: {
    progress: number;
    length: number;
  };
}

const ProgressSlider = ({ playback }: Props) => {
  if (!playback) return null;

  const progressPercentage = (playback.progress / playback.length) * 100;

  return (
    <div className='w-40 h-2 bg-gray-200 rounded-full overflow-hidden'>
      <div className='h-full bg-blue-500' style={{ width: `${progressPercentage}%` }} />
    </div>
  );
};

export default ProgressSlider;
