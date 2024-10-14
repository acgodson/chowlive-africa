'use client';

import React, { createContext, useContext, useEffect, useState, PropsWithChildren } from 'react';
import { useAuthContext } from '../web3-provider/';
import { get, ref, getDatabase } from 'firebase/database';

const SPOTIFY_PLAYER_SCRIPT_SRC = 'https://sdk.scdn.co/spotify-player.js';

interface SpotifyWebPlaybackContextType {
  isWebPlaybackReady: boolean;
  accessToken: string | null;
  spotifyPlayer: Spotify.Player | null;
}

const SpotifyWebPlaybackContext = createContext<SpotifyWebPlaybackContextType | undefined>(
  undefined
);

export const useSpotifyWebPlayback = () => {
  const context = useContext(SpotifyWebPlaybackContext);
  if (context === undefined) {
    throw new Error('useSpotifyWebPlayback must be used within a SpotifyWebPlaybackProvider');
  }
  return context;
};

export const SpotifyWebPlaybackProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { user } = useAuthContext();
  const [isWebPlaybackReady, setIsWebPlaybackReady] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [spotifyPlayer, setSpotifyPlayer] = useState<Spotify.Player | null>(null);

  // Add the Spotify Web Playback SDK script to the DOM
  useEffect(() => {
    const existingScript = document.querySelector(`script[src="${SPOTIFY_PLAYER_SCRIPT_SRC}"]`);

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = SPOTIFY_PLAYER_SCRIPT_SRC;
      script.async = true;
      document.body.appendChild(script);
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      setIsWebPlaybackReady(true);
    };

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Fetch access token from Firebase
  useEffect(() => {
    if (!user) return;

    const loadToken = async () => {
      const rtdb = getDatabase();
      const tokenSnapshot = await get(ref(rtdb, `spotifyAccessToken/${user.uid}`));
      const fetchedAccessToken = tokenSnapshot.val();
      setAccessToken(fetchedAccessToken);
    };

    loadToken();
  }, [user]);

  // Create the Spotify Web Player
  useEffect(() => {
    if (!user || !isWebPlaybackReady || !accessToken || spotifyPlayer) return;

    console.log('Spotify Web Playback SDK ready.');

    const player = new Spotify.Player({
      name: 'ChowLive Listening Rooms',
      getOAuthToken: (cb: (token: string) => void) => {
        cb(accessToken as string);
      },
      volume: 1,
    });

    // Error handling
    player.addListener('initialization_error', ({ message }) => console.error(message));
    player.addListener('authentication_error', ({ message }) => console.error(message));
    player.addListener('account_error', ({ message }) => console.error(message));
    player.addListener('playback_error', ({ message }) => console.error(message));

    // Ready and Not Ready listeners
    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
    });

    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });

    // Connect to the player
    player.connect();

    setSpotifyPlayer(player);

    // Cleanup when component unmounts
    return () => {
      player.disconnect();
    };
  }, [user, isWebPlaybackReady, accessToken, spotifyPlayer]);

  const value = {
    isWebPlaybackReady,
    accessToken,
    spotifyPlayer,
  };

  return (
    <SpotifyWebPlaybackContext.Provider value={value}>
      {children}
    </SpotifyWebPlaybackContext.Provider>
  );
};
