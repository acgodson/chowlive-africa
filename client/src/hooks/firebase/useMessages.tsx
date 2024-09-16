import { useEffect, useState, useMemo } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

import { Message } from '../../models/Message';
import { getFirestoreDB } from '@/util/firebase';
import { trpc } from 'src/server/client';

interface Dictionary<T> {
  [id: string]: T;
}

const useMessages = (roomID: string) => {
  const [dictionary, setDictionary] = useState<Dictionary<Message>>({});
  const [userIds, setUserIds] = useState<string[]>([]);
  const db = getFirestoreDB();

  const { data: userDictionary = {} } = trpc.fetchRoomUser.useQuery(
    { userIds },
    {
      enabled: userIds.length > 0,
    }
  );

  useEffect(() => {
    if (!roomID) return;

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('roomId', '==', roomID),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedDictionary: Dictionary<Message> = {};
      const newUserIds = new Set<string>();

      snapshot.forEach((doc) => {
        const data = doc.data();
        updatedDictionary[doc.id] = {
          ...data,
          id: doc.id,
          timestamp: data.timestamp.toDate() ?? '',
        } as Message;
        newUserIds.add(data.userId);
      });
      setDictionary(updatedDictionary);
    });

    return () => unsubscribe();
  }, [roomID]);



  // const array = useMemo(() => Object.values(dictionary), [dictionary]);
  const array = useMemo(() => {
    return Object.values(dictionary).map(message => ({
      ...message,
      avatar: userDictionary[message.userId]?.photoURL || '',
      name: userDictionary[message.userId]?.displayName || '',
    }));
  }, [dictionary, userDictionary]);

  return { dictionary, array };
};

export default useMessages;
