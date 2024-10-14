import { PLAYBACK_STATE } from '@/utils/helpers/consts';
import Service from '@/utils/models/Service';

import PlaybackAPI, { PlaybackProps } from '.';
import SpotifyAPI from '../spotify';


export const getPlaybackStatus = async (props: PlaybackProps): Promise<PLAYBACK_STATE> => {
  const service = PlaybackAPI.getActiveService(props);

  let playbackStatus;
  if (service === Service.Spotify) {
    playbackStatus = await SpotifyAPI.getPlaybackStatus(props);
  }

  return playbackStatus;
};
