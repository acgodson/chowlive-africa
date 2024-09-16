import { PropsWithChildren, useEffect, useState } from 'react';
import { useAuthContext } from '@/lib/AuthProvider';
import { get, ref, getDatabase } from 'firebase/database';

const SPOTIFY_PLAYER_SCRIPT_SRC = 'https://sdk.scdn.co/spotify-player.js';

export default function SpotifyWebPlayback({ children }: PropsWithChildren) {
  const { user } = useAuthContext();
  const [isWebPlaybackReady, setIsWebPlaybackReady] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

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
      // existingScript?.remove();
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
    if (!user || !isWebPlaybackReady || !accessToken || window.spotifyWebPlayer) return;

    console.log('Spotify Web Playback SDK ready.');

    window.spotifyWebPlayer = new Spotify.Player({
      name: 'ChowLive Listening Rooms',
      getOAuthToken: (cb: (token: string) => void) => {
        cb(accessToken as string);
      },
      volume: 1,
    });

    const spotifyPlayer = window.spotifyWebPlayer;

    // Error handling
    spotifyPlayer.addListener('initialization_error', ({ message }) => console.error(message));
    spotifyPlayer.addListener('authentication_error', ({ message }) => console.error(message));
    spotifyPlayer.addListener('account_error', ({ message }) => console.error(message));
    spotifyPlayer.addListener('playback_error', ({ message }) => console.error(message));

    // Ready and Not Ready listeners
    spotifyPlayer.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
    });

    spotifyPlayer.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });

    // Connect to the player
    spotifyPlayer.connect();

    // Cleanup when component unmounts
    return () => {
      spotifyPlayer.disconnect();
    };
  }, [user, isWebPlaybackReady, accessToken]);

  return <>{children}</>;
}
