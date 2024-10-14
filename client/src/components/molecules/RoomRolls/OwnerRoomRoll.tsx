import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useAuthContext } from '@/providers/web3-provider';
import { getFirestoreDB } from '@/utils/configs/firebase-app-config';
import RoomRoll from './RoomRoll';
import Room from '@/utils/models/Room';
import { useBaseReadOnly } from '@/hooks/useBaseReadOnly';


const OwnerRoomRoll = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const { user } = useAuthContext();
  const db = getFirestoreDB();
  const { fetchMySubscriptions } = useBaseReadOnly();

  useEffect(() => {
    const fetchRooms = async () => {
      if (!user) return;

      // return rooms from Base Sepolia Smart Contract
      const subs = await fetchMySubscriptions();
      console.log('subs', subs);
      // example [3,2,5,6]
      // nftId
      if (!subs || (subs && !subs.length)) {
        return;
      }
      console.log("let's go");
      setIsLoading(true);
      try {
        // Remove duplicates from subs array
        const uniqueSubs = Array.from(new Set(subs));

        const roomsRef = collection(db, 'rooms');
        const q = query(roomsRef, where('nftId', 'in', uniqueSubs));

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
