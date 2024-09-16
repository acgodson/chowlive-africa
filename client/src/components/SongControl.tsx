import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import {
  Link1Icon,
  LinkBreak1Icon,
  PauseIcon,
  PlayIcon,
  TrackNextIcon,
} from '@radix-ui/react-icons';
import { trpc } from 'src/server/client';
import Song from '../models/Song';
import { playbackConfigurationAtom } from '../state/playbackConfigurationAtom';
import { Tooltip, TooltipTrigger } from './atoms/tooltip';
interface Props {
  song?: Song;
}

const SongControl = ({ song }: Props) => {
  const [playbackConfiguration, setPlaybackConfiguration] = useAtom(playbackConfigurationAtom);
  const [changeToIsPaused, setChangeToIsPaused] = useState(true);
  const [isSkippingSong, setIsSkippingSong] = useState(false);

  const { mutateAsync: updatePlayback } = trpc.updatePlayback.useMutation();

  const isPaused = song ? song.isPaused : false;

  useEffect(() => {
    setChangeToIsPaused(isPaused);
  }, [isPaused]);

  const handleTogglePlaybackConfiguration = () =>
    setPlaybackConfiguration({
      ...playbackConfiguration,
      linked: !playbackConfiguration.linked,
    });

  const handleSkipForward = async () => {
    if (!song) return;

    console.log('Skipping song...');
    setIsSkippingSong(true);

    await updatePlayback({
      shouldSkip: true,
      songId: song.id,
      track: {
        spotify_uri: song.spotifyUri,
        duration_ms: song.duration_ms,
      },
    });

    setIsSkippingSong(false);
    console.log('Skipped song.');
  };

  const handleTogglePlay = async () => {
    if (!song) return;
    setChangeToIsPaused(!isPaused);

    await updatePlayback({
      isPaused: !isPaused,
      songId: song.id,
    });

    console.log(isPaused ? 'Played song.' : 'Paused song.');
  };

  return (
    <div className='flex items-center justify-center'>
      <Tooltip>
        <TooltipTrigger>
          <button
            onClick={handleTogglePlaybackConfiguration}
            className='p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            {playbackConfiguration.linked ? (
              <LinkBreak1Icon className='w-5 h-5' />
            ) : (
              <Link1Icon className='w-5 h-5' />
            )}
          </button>
        </TooltipTrigger>
        {/* <TooltipContent>
          {playbackConfiguration.linked ? 'Unlink playback to room' : 'Link playback to room'}
        </TooltipContent> */}
      </Tooltip>
      <button
        onClick={handleTogglePlay}
        className='p-2 mx-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        disabled={changeToIsPaused !== isPaused || isSkippingSong}
      >
        {isPaused ? <PlayIcon className='w-5 h-5' /> : <PauseIcon className='w-5 h-5' />}
      </button>
      <button
        onClick={handleSkipForward}
        className='p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        disabled={changeToIsPaused !== isPaused || isSkippingSong}
      >
        <TrackNextIcon className='w-5 h-5' />
      </button>
    </div>
  );
};

export default SongControl;
