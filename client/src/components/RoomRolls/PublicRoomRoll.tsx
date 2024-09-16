import { useEffect, useState } from 'react';
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';

import RoomRoll from './RoomRoll';
import Room from '../../models/Room';
import { getFirestoreDB } from '@/util/firebase';

const PublicRoomRoll = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const db = getFirestoreDB();

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      try {
        const roomsRef = collection(db, 'rooms');
        const q = query(roomsRef, where('isPublic', '==', true), limit(30));

        const querySnapshot = await getDocs(q);
        const fetchedRooms: Room[] = [];
        querySnapshot.forEach((doc) => {
          fetchedRooms.push({ id: doc.id, ...doc.data() } as Room);
        });

        setRooms(fetchedRooms);
      } catch (error) {
        console.error('Error fetching public rooms:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [db]);

  return <RoomRoll rooms={rooms} isLoading={isLoading} title='Public Rooms' end={true} />;
};

export default PublicRoomRoll;
