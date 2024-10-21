import React, { useCallback, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckIcon,
  CopyIcon,
  MoonIcon,
  SunIcon,
  Component1Icon,
  EyeClosedIcon,
  EyeOpenIcon,
  PlayIcon,
  PauseIcon,
  ListBulletIcon,
  Cross2Icon,
  PlusIcon,
  TrackNextIcon,
} from '@radix-ui/react-icons';
import { useAuthContext } from '@/providers/web3-provider';
import useStore, { Modal } from '@/state/store';
import { cn } from '@/utils';
import Room from '@/utils/models/Room';
import Song from '@/utils/models/Song';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import useSongProgress from '@/hooks/rooms/useSongProgress';
import { useAtom } from 'jotai';
import { playbackConfigurationAtom } from '@/state/playbackConfigurationAtom';
import { trpc } from '@/trpc/client';
import QueuedSongDisplay from './QueuedSongDisplay';

type props = {
  room: Room;
  song?: Song;
  queue: Song[];
  show: boolean;
  isPlaying: boolean;
  shouldAlwaysShowUI: boolean;
  setShouldAlwaysShowUI: React.Dispatch<React.SetStateAction<boolean>>;
};

const AvatarMusicControls = ({
  room,
  show = true,
  song,
  queue,
  isPlaying,
  shouldAlwaysShowUI,
  setShouldAlwaysShowUI,
}: props) => {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated } = useAuthContext();
  const [hasCopied, setHasCopied] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isSkippingSong, setIsSkippingSong] = useState(false);

  const [playbackConfiguration, setPlaybackConfiguration] = useAtom(playbackConfigurationAtom);
  const [changeToIsPaused, setChangeToIsPaused] = useState(true);
  const { mutateAsync: updatePlayback } = trpc.updatePlayback.useMutation();

  const isPaused = song ? song.isPaused : false;

  useEffect(() => {
    setChangeToIsPaused(isPaused);
  }, [isPaused]);

  const { handleSetModal } = useStore((store) => ({
    handleSetModal: store.handleSetModal,
  }));

  const host = 'https://chowlive-africa.vercel.app';

  const handleTogglePlaybackConfiguration = () =>
    setPlaybackConfiguration({
      ...playbackConfiguration,
      linked: !playbackConfiguration.linked,
    });

  const onCopy = useCallback(() => {
    navigator.clipboard
      .writeText(`${host}/rooms/${room.slug}`)
      .then(() => {
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  }, [room.slug]);

  const handleColorMode = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleQueue = handleSetModal(Modal.QueueSong);
  const handleDevices = handleSetModal(Modal.DeviceSelect);

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

  const progress = useSongProgress(song);
  const length = song ? song.duration_ms : 1;

  let progressPercent = ((length - progress) / length) * 100;
  if (progressPercent < 0 || !progressPercent) progressPercent = 0;
  if (progressPercent > 100) progressPercent = 100;

  const FloatingContainer = ({ children, position, transparent = false }: any) => (
    <div
      className={cn(
        'absolute z-30 flex min-h-12 items-center justify-between rounded-full shadow-lg transition-opacity duration-500',
        transparent ? 'bg-transparent shadow-none' : 'bg-neutral-100 dark:bg-neutral-800',
        show ? 'opacity-100' : 'opacity-0',
        position === 'tl' && 'top-4 left-4',
        position === 't' && 'top-4 left-1/2 -ml-48 w-96 rounded-lg',
        position === 'tr' && 'top-4 right-4',
        position === 'bl' && 'bottom-4 left-4',
        position === 'b' && 'bottom-4 left-1/2 -ml-48 w-96 rounded-lg',
        position === 'br' && 'bottom-4 right-4'
      )}
    >
      {children}
    </div>
  );

  const CircularButton = ({ onClick, ariaLabel, children }: any) => (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className='p-4 rounded-full cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors'
    >
      {children}
    </button>
  );

  return (
    <div className='relative w-full max-w-4xl h-[60vh] mt-16 mx-12 flex items-center justify-center overflow-hidden'>
      <FloatingContainer position='t'>
        <CircularButton onClick={onCopy} ariaLabel={hasCopied ? 'Copied!' : 'Copy room code'}>
          {hasCopied ? <CheckIcon className='w-5 h-5' /> : <CopyIcon className='w-5 h-5' />}
        </CircularButton>
        <h1 className='text-base font-bold'>{room.name}</h1>
        <CircularButton onClick={handleColorMode} ariaLabel='Toggle theme'>
          {theme === 'light' ? <MoonIcon className='w-5 h-5' /> : <SunIcon className='w-5 h-5' />}
        </CircularButton>
      </FloatingContainer>

      <FloatingContainer position='tr'>
        <CircularButton onClick={handleQueue} ariaLabel='Queue song'>
          <PlusIcon className='w-5 h-5' />
        </CircularButton>
      </FloatingContainer>

      <div className='absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 opacity-50 rounded-lg animate-gradient-x'></div>

      <div
        className={`absolute inset-0 backdrop-blur-sm rounded-lg transition-all duration-300 ease-in-out ${
          isPlaying ? 'z-0' : 'z-10'
        }`}
      ></div>

      <img
        src='/mc/Chowlive_Character(13).png'
        alt='DJ Avatar'
        className={`w-full h-full object-contain rounded-lg z-0 transition-all duration-300 ease-in-out ${
          isPlaying ? 'z-10' : 'z-0'
        }`}
      />

      {isAuthenticated && (
        <>
          <FloatingContainer position='bl'>
            <CircularButton onClick={handleDevices} ariaLabel='Choose Spotify playback device'>
              <Component1Icon className='w-5 h-5' />
            </CircularButton>
            <CircularButton
              onClick={() => setShouldAlwaysShowUI((prev) => !prev)}
              ariaLabel={shouldAlwaysShowUI ? 'Hide UI when inactive' : 'Always show UI'}
            >
              {shouldAlwaysShowUI ? (
                <EyeOpenIcon className='w-5 h-5' />
              ) : (
                <EyeClosedIcon className='w-5 h-5' />
              )}
            </CircularButton>
          </FloatingContainer>

          <FloatingContainer position='b'>
            <div className='flex items-center w-full'>
              <CircularButton
                onClick={handleTogglePlay}
                ariaLabel={!isPaused ? 'Pause' : 'Play'}
                disabled={changeToIsPaused !== isPaused || isSkippingSong}
              >
                {isPaused ? <PlayIcon className='w-5 h-5' /> : <PauseIcon className='w-5 h-5' />}
              </CircularButton>
              <CircularButton
                ariaLabel={'skip'}
                onClick={handleSkipForward}
                className='p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                disabled={changeToIsPaused !== isPaused || isSkippingSong}
              >
                <TrackNextIcon className='w-5 h-5' />
              </CircularButton>
              <ProgressPrimitive.Root
                className='relative h-2 flex-1 mx-6 overflow-hidden rounded-full bg-gray-300'
                value={progressPercent}
              >
                <ProgressPrimitive.Indicator
                  className='h-full w-full rounded-full bg-green-500 transition-transform duration-[660ms] ease-[cubic-bezier(0.65,0,0.35,1)]'
                  style={{ transform: `translateX(-${100 - progressPercent}%)` }}
                />
              </ProgressPrimitive.Root>
            </div>
          </FloatingContainer>

          <FloatingContainer position='br'>
            <CircularButton onClick={() => setIsQueueOpen(!isQueueOpen)} ariaLabel='Toggle queue'>
              <ListBulletIcon className='w-5 h-5' />
            </CircularButton>
          </FloatingContainer>
          <AnimatePresence>
            {isQueueOpen && (
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className='absolute right-0 top-0 bottom-0 w-60 bg-neutral-800 bg-opacity-90 rounded-l-lg overflow-y-auto z-30'
              >
                <div className='p-4'>
                  <div className='flex justify-between items-center mb-4'>
                    <h2 className='text-white text-lg font-bold'>Queue</h2>
                    <CircularButton onClick={() => setIsQueueOpen(false)} ariaLabel='Close queue'>
                      <Cross2Icon className='w-5 h-5 text-white' />
                    </CircularButton>
                  </div>
                  {queue && queue.length > 0 ? (
                    <ul>
                      {queue.slice(1).map((song: any, index: number) => (
                        <div key={index}>
                          <QueuedSongDisplay song={song} />
                        </div>
                      ))}
                    </ul>
                  ) : (
                    <p className='text-gray-300'>No songs in queue</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default AvatarMusicControls;
