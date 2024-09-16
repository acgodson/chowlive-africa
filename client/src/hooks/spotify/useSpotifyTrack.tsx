import { useEffect, useState } from 'react';
import { getDatabase, get, ref } from 'firebase/database';
import { useAuthContext } from 'src/lib/AuthProvider';
import useStore from 'src/state/store';
import Song from '../../models/Song';

const useSpotifyTrack = (song?: Song) => {
  const { spotify } = useStore((store) => ({
    spotify: store.spotify,
  }));

  const { user } = useAuthContext();
  const [spotifyTrack, setSpotifyTrack] =
    useState<SpotifyApi.SingleTrackResponse>();
  const [previousSongID, setPreviousSongID] = useState('');

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

  const loadTrack = async () => {
    const provider_token = await fetchToken();
    if (song && song.spotifyUri && provider_token) {
      if (previousSongID !== song.id) {
        setSpotifyTrack(undefined);
        setPreviousSongID(song.id);
        spotify.setAccessToken(provider_token);
        spotify
          .getTrack(song.spotifyUri.split(':')[2])
          .then((res) => setSpotifyTrack(res));
      }
    }
  };

  useEffect(() => {
    loadTrack();
  }, [user, previousSongID, song, spotify]);

  return spotifyTrack;
};

export default useSpotifyTrack;
