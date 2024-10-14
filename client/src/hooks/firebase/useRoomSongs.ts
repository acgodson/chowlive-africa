import { useEffect, useState, useMemo } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

import RoomSong from '@/utils/models/RoomSong';
import { getFirestoreDB } from '@/utils/configs/firebase-app-config';

interface Dictionary<T> {
  [id: string]: T;
}

const useRoomSongs = (roomID: string) => {
  const [dictionary, setDictionary] = useState<Dictionary<RoomSong>>({});
  const db = getFirestoreDB();

  useEffect(() => {
    if (!roomID) return;

    const roomSongsRef = collection(db, 'room_song');
    const q = query(roomSongsRef, where('room_id', '==', roomID));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedDictionary: Dictionary<RoomSong> = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        updatedDictionary[data.song_id] = {
          ...data,
          id: doc.id,
        } as any;
      });
      setDictionary(updatedDictionary);
    });

    return () => unsubscribe();
  }, [roomID]);

  const array = useMemo(() => Object.values(dictionary), [dictionary]);

  return { dictionary, array };
};

export default useRoomSongs;
