import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { getFirestoreDB } from '@/util/firebase';
import { useAuthContext } from '@/lib/AuthProvider';
import RoomRoll from './RoomRoll';
import Room from '../../models/Room';

const OwnerRoomRoll = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const { user } = useAuthContext();
  const db = getFirestoreDB();

  useEffect(() => {
    const fetchRooms = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const roomsRef = collection(db, 'rooms');
        const q = query(roomsRef, where('creator_id', '==', user.uid));

        const querySnapshot = await getDocs(q);
        const fetchedRooms: Room[] = [];
        querySnapshot.forEach((doc) => {
          fetchedRooms.push({ id: doc.id, ...doc.data() } as Room);
        });

        setRooms(fetchedRooms);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [user, db]);

  if (!rooms.length) return null;
  return <RoomRoll rooms={rooms} isLoading={isLoading} title='Your Rooms' />;
};

export default OwnerRoomRoll;
