import { useEffect, useState } from 'react';
import {
  Link1Icon,
  LinkBreak1Icon,
  PauseIcon,
  PlayIcon,
  TrackNextIcon,
} from '@radix-ui/react-icons';
import { useAtom } from 'jotai';


import { trpc } from '@/trpc/client';
import useSpotifyTrack from '@/hooks/spotify/useSpotifyTrack';
import Song from '@/utils/models/Song';
import { playbackConfigurationAtom } from '@/state/playbackConfigurationAtom';


type Props = {
  song: Song;
};

const FixedPlaybackButtons = ({ song }: Props) => {
  const [playbackConfiguration, setPlaybackConfiguration] = useAtom(
    playbackConfigurationAtom
  );
  const [changeToIsPaused, setChangeToIsPaused] = useState(true);
  const [isSkippingSong, setIsSkippingSong] = useState(false);
  const track = useSpotifyTrack(song);

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
    if (!track) return;
    setIsSkippingSong(true);

    await updatePlayback({
      shouldSkip: true,
      songId: song.id,
      track: {
        spotify_uri: track.uri,
        duration_ms: track.duration_ms,
      },
    });

    setIsSkippingSong(false);
  };

  const handleTogglePlay = async () => {
    setChangeToIsPaused(!isPaused);

    await updatePlayback({
      isPaused: !isPaused,
      songId: song.id,
    });
  };

  if (!song) return null;

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-50 transition-opacity duration-200">
      <div className="flex space-x-4">
        <button
          onClick={handleTogglePlaybackConfiguration}
          aria-label={playbackConfiguration.linked ? 'Unlink playback to room' : 'Link playback to room'}
          className="group relative h-14 w-14 rounded-full flex items-center justify-center hover:bg-neutral-800 transition-colors duration-200"
        >
          {playbackConfiguration.linked ? (
            <LinkBreak1Icon className="h-6 w-6 text-white" />
          ) : (
            <Link1Icon className="h-6 w-6 text-white" />
          )}
          {/* <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {playbackConfiguration.linked ? 'Unlink playback to room' : 'Link playback to room'}
          </span> */}
        </button>

        <button
          onClick={handleTogglePlay}
          aria-label={isPaused ? 'Play song' : 'Pause song'}
          className="group relative h-14 w-14 rounded-full flex items-center justify-center hover:bg-neutral-800 transition-colors duration-200"
        >
          {changeToIsPaused !== song.isPaused ? (
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
          ) : song.isPaused ? (
            <PlayIcon className="h-6 w-6 text-white" />
          ) : (
            <PauseIcon className="h-6 w-6 text-white" />
          )}
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {isPaused ? 'Play song' : 'Pause song'}
          </span>
        </button>

        <button
          onClick={handleSkipForward}
          aria-label="Skip to next song"
          className="group relative h-14 w-14 rounded-full flex items-center justify-center hover:bg-neutral-800 transition-colors duration-200"
        >
          {isSkippingSong ? (
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
          ) : (
            <TrackNextIcon className="h-6 w-6 text-white" />
          )}
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Skip to next song
          </span>
        </button>
      </div>
    </div>
  );
};

export default FixedPlaybackButtons;