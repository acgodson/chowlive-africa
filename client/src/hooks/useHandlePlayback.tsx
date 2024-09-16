import { useEffect } from 'react';

import { useAtom } from 'jotai';

import { useAuthContext } from '@/lib/AuthProvider';
import { PLAYBACK_STATE } from 'constants/playback';
import PlaybackAPI from 'src/lib/playback';
import Song from 'src/models/Song';
import { playbackConfigurationAtom } from 'src/state/playbackConfigurationAtom';
import useStore from 'src/state/store';

import useSongProgress from './rooms/useSongProgress';
import { getDatabase, ref, get } from 'firebase/database';

export default function useHandlePlayback(song?: Song) {
  const { user } = useAuthContext();

  const { spotify } = useStore((store) => ({
    spotify: store.spotify
  }));

  const [playbackConfiguration] = useAtom(playbackConfigurationAtom);

  const progress = useSongProgress(song);

  async function fetchToken() {
    if (!user) {
      return;
    }
    // Fetch the Spotify access token
    const rtdb = getDatabase();
    const tokenSnapshot = await get(
      ref(rtdb, `spotifyAccessToken/${user?.uid}`)
    );
    const accessToken = await tokenSnapshot.val();
    return accessToken;
  }

  useEffect(() => {
    const updatePlayback = async () => {
      const provider_token = await fetchToken();
      if (!provider_token) return;
      const props: any = {
        spotify,
        spotifyAccessToken: provider_token,
        song,
        progress,
      };

      if (!song || !song.duration_ms) return;
      if (progress <= 10) return;
      if (song.duration_ms <= 10) return;
      if (!playbackConfiguration.linked) return;
 
      const playbackPromise = PlaybackAPI.getPlaybackStatus(props);
      const isSynchronizedPromise = PlaybackAPI.getIsSynchronized(props);

      const [playback, isSynchronized] = await Promise.all([
        playbackPromise,
        isSynchronizedPromise,
      ]);

      const isClientPlaying = playback === PLAYBACK_STATE.PLAYING;
      const isSongOver = song.duration_ms <= progress;

      if (isSongOver) {
        console.log('Song is over, skipping...');
        await PlaybackAPI.pause(props);
        await PlaybackAPI.skip(props);
      } else if (isClientPlaying && song.isPaused) {
        console.log('Song should not be playing, pausing...');
        await PlaybackAPI.pause(props);
      } else if (!isClientPlaying && !song.isPaused) {
        await PlaybackAPI.play(props);
      } else if (!isSynchronized && !song.isPaused) {
        console.log('Song is out of sync, synchronizing...');
        await PlaybackAPI.play(props);
      }
    };

    updatePlayback();
  }, [user, spotify, playbackConfiguration, song, progress]);
}
