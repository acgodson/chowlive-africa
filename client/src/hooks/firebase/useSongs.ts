import { useEffect, useMemo, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

import Song from '@/utils/models/Song';
import { getFirestoreDB } from '@/utils/configs/firebase-app-config';

interface Dictionary<T> {
  [id: string]: T;
}

const useSongs = (roomID: string) => {
  const [dictionary, setDictionary] = useState<Dictionary<Song>>({});
  const db = getFirestoreDB();

  useEffect(() => {
    if (!roomID) return;

    const songsRef = collection(db, 'songs');
    const q = query(songsRef, where('roomId', '==', roomID), orderBy('addedAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedDictionary: Dictionary<Song> = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        updatedDictionary[doc.id] = {
          ...data,
          id: doc.id,
          addedAt: data.addedAt as number,
        } as Song;
      });
      setDictionary(updatedDictionary);
    });

    return () => unsubscribe();
  }, [roomID]);

  const array = useMemo(() => Object.values(dictionary), [dictionary]);

  return { dictionary, array };
};

export default useSongs;
