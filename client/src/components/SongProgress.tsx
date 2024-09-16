import * as ProgressPrimitive from '@radix-ui/react-progress';
import useSongProgress from '../hooks/rooms/useSongProgress';
import Song from '../models/Song';

interface Props {
  song?: Song;
}

const SongProgress = ({ song }: Props) => {
  const progress = useSongProgress(song);
  const length = song ? song.duration_ms : 1;

  let progressPercent = ((length - progress) / length) * 100;
  if (progressPercent < 0 || !progressPercent) progressPercent = 0;
  if (progressPercent > 100) progressPercent = 100;

  return (
    <ProgressPrimitive.Root
      className='relative h-2 flex-1 mx-6 overflow-hidden rounded-full bg-gray-300'
      value={progressPercent}
    >
      <ProgressPrimitive.Indicator
        className='h-full w-full rounded-full bg-green-500 transition-transform duration-[660ms] ease-[cubic-bezier(0.65,0,0.35,1)]'
        style={{ transform: `translateX(-${progressPercent}%)` }}
      />
    </ProgressPrimitive.Root>
  );
};

export default SongProgress;
