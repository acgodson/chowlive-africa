import produce from 'immer';
import Spotify from 'spotify-web-api-js';
import { create } from 'zustand';

export enum Modal {
  None = 'none',
  DeviceSelect = 'device-select',
  PlaybackControl = 'playback-control',
  QueueSong = 'queue-song',
}

export type SpotifyAPI = Spotify.SpotifyWebApiJs;

export interface Store {
  set: (callback: (store: Store) => void) => void;

  modal: Modal;
  setModal: (modal: Modal) => void;
  handleSetModal: (modal: Modal) => () => void;

  spotify: SpotifyAPI;
}

const useStore = create<Store>((set) => ({
  set: (callback) => set(produce(callback)),

  modal: Modal.None,
  setModal: (modal) => set({ modal }),
  handleSetModal: (modal) => () => set((state) => ({ modal: state.modal === modal ? Modal.None : modal })),

  spotify: new Spotify(),
}));

export default useStore;